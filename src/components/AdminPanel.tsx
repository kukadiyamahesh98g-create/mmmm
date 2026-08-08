import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  where,
  setDoc,
  increment 
} from 'firebase/firestore';
import { LuckyDraw, UserProfile, Ticket, Winner } from '../types';
import { Shield, Plus, Coins, Users, Youtube, Download, Trophy, Ban, CheckCircle, Search, RefreshCw, Settings, Sparkles, FileSpreadsheet, X, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { LuckyDrawSpreadsheet } from './LuckyDrawSpreadsheet';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'draws' | 'coins' | 'users' | 'settings'>('draws');

  // Lucky Draw Manager State
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDrawType, setNewDrawType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newTotalTickets, setNewTotalTickets] = useState(100);
  const [newTicketPriceCoins, setNewTicketPriceCoins] = useState(20);
  const [newPrizeAmount, setNewPrizeAmount] = useState('₹500 Cash Prize');

  // Random Winner Selection Modal State
  const [randomWinnerModalDraw, setRandomWinnerModalDraw] = useState<LuckyDraw | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedRandomTicket, setSelectedRandomTicket] = useState<Ticket | null>(null);
  const [displayTicketNumber, setDisplayTicketNumber] = useState<number | null>(null);

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Coin Grant State
  const [selectedUserUid, setSelectedUserUid] = useState('');
  const [grantAmount, setGrantAmount] = useState(50);

  // Settings State
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw');
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [dailySpinLimit, setDailySpinLimit] = useState(3);
  const [announcement, setAnnouncement] = useState('1X Luck - Live Draw & Winner Announcement');

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Draws & Users
  useEffect(() => {
    const drawsPath = 'luckyDraws';
    const unsubDraws = onSnapshot(collection(db, drawsPath), (snap) => {
      const list: LuckyDraw[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as LuckyDraw));
      setDraws(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, drawsPath);
    });

    const usersPath = 'users';
    const unsubUsers = onSnapshot(collection(db, usersPath), (snap) => {
      const list: UserProfile[] = [];
      snap.docs.forEach((d) => list.push({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, usersPath);
    });

    const ticketsPath = 'tickets';
    const unsubTickets = onSnapshot(collection(db, ticketsPath), (snap) => {
      const list: Ticket[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as Ticket));
      list.sort((a, b) => new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime());
      setAllTickets(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ticketsPath);
    });

    const settingsPath = 'settings/app_config';
    const unsubSettings = onSnapshot(doc(db, 'settings', 'app_config'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.youtubeLiveUrl) setYoutubeLiveUrl(d.youtubeLiveUrl);
        if (d.isLiveActive !== undefined) setIsLiveActive(d.isLiveActive);
        if (d.dailySpinLimit) setDailySpinLimit(d.dailySpinLimit);
        if (d.announcement) setAnnouncement(d.announcement);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, settingsPath);
    });

    return () => {
      unsubDraws();
      unsubUsers();
      unsubTickets();
      unsubSettings();
    };
  }, []);

  // Create new Lucky Draw
  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'luckyDraws'), {
        title: newTitle || `${newDrawType.toUpperCase()} Lucky Draw`,
        drawType: newDrawType,
        totalTickets: newTotalTickets || 100,
        soldTickets: 0,
        ticketPriceCoins: 20, // Fixed 20 coins per ticket
        prizeAmount: newPrizeAmount || '₹500 Cash Prize',
        status: 'active',
        createdAt: new Date().toISOString()
      });

      // Send app notification
      await addDoc(collection(db, 'notifications'), {
        title: '🎉 New Lucky Draw Started!',
        body: `${newTitle || `${newDrawType.toUpperCase()} Lucky Draw`} is now LIVE! Total Tickets: ${newTotalTickets}. Buy tickets for 20 Coins.`,
        type: 'draw',
        createdAt: new Date().toISOString()
      });

      setNewTitle('');
      setMsg({ type: 'success', text: 'Lucky Draw created successfully!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to create draw.' });
    }
  };

  // Open Random Winner Selection Modal for a Draw
  const handleOpenRandomWinnerPicker = (draw: LuckyDraw) => {
    const drawTickets = allTickets.filter((t) => t.drawId === draw.id);
    if (drawTickets.length === 0) {
      setMsg({ type: 'error', text: 'Cannot select winner: 0 tickets sold for this draw!' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    setRandomWinnerModalDraw(draw);
    setSelectedRandomTicket(null);
    setDisplayTicketNumber(null);
    setIsShuffling(false);
  };

  // Roll / Spin Random Winner completely at random
  const handleRollRandomWinner = () => {
    if (!randomWinnerModalDraw) return;
    const drawTickets = allTickets.filter((t) => t.drawId === randomWinnerModalDraw.id);
    if (drawTickets.length === 0) return;

    setIsShuffling(true);
    setSelectedRandomTicket(null);

    // Pick a completely random winner upfront
    const randomIndex = Math.floor(Math.random() * drawTickets.length);
    const pickedWinner = drawTickets[randomIndex];

    // Visual ticker animation cycling through sold ticket numbers
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const tempIndex = Math.floor(Math.random() * drawTickets.length);
      setDisplayTicketNumber(drawTickets[tempIndex].ticketNumber);

      if (counter >= 28) {
        clearInterval(interval);
        setDisplayTicketNumber(pickedWinner.ticketNumber);
        setSelectedRandomTicket(pickedWinner);
        setIsShuffling(false);
      }
    }, 60);
  };

  // Confirm & Publish Random Winner to Firestore
  const handleConfirmRandomWinner = async () => {
    if (!randomWinnerModalDraw || !selectedRandomTicket) return;

    try {
      const draw = randomWinnerModalDraw;
      const ticket = selectedRandomTicket;

      const drawRef = doc(db, 'luckyDraws', draw.id);
      await updateDoc(drawRef, {
        status: 'completed',
        winnerTicketNumber: ticket.ticketNumber,
        winnerUid: ticket.userUid,
        winnerName: ticket.userName,
        winnerMaskedMobile: ticket.userMobileMasked,
        winnerCity: ticket.userCity,
        drawDate: new Date().toISOString()
      });

      await addDoc(collection(db, 'winners'), {
        drawId: draw.id,
        drawTitle: draw.title,
        ticketNumber: ticket.ticketNumber,
        winnerUid: ticket.userUid,
        winnerName: ticket.userName,
        winnerMaskedMobile: ticket.userMobileMasked,
        winnerCity: ticket.userCity,
        prizeAmount: draw.prizeAmount,
        drawDate: new Date().toISOString()
      });

      await addDoc(collection(db, 'notifications'), {
        title: '🏆 Lucky Draw Winner Announced!',
        body: `Random Draw Winner for ${draw.title}: ${ticket.userName} (#${String(ticket.ticketNumber).padStart(3, '0')}) won ${draw.prizeAmount}!`,
        type: 'winner',
        createdAt: new Date().toISOString()
      });

      setMsg({ type: 'success', text: `Random winner selected & declared: ${ticket.userName} (#${ticket.ticketNumber})` });
      setRandomWinnerModalDraw(null);
      setSelectedRandomTicket(null);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to declare random winner.' });
    }
  };

  // Grant Coins to user
  const handleGrantCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserUid) return;

    try {
      const userRef = doc(db, 'users', selectedUserUid);
      await updateDoc(userRef, {
        coinBalance: increment(grantAmount)
      });

      await addDoc(collection(db, 'coinTransactions'), {
        userUid: selectedUserUid,
        amount: grantAmount,
        type: 'admin_grant',
        description: `Admin Granted +${grantAmount} Coins`,
        createdAt: new Date().toISOString()
      });

      setMsg({ type: 'success', text: `Granted ${grantAmount} Coins to user!` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to grant coins.' });
    }
  };

  // Toggle user ban
  const handleToggleBan = async (user: UserProfile) => {
    try {
      const newStatus = !user.isBanned;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isBanned: newStatus
      });

      setMsg({ type: 'success', text: `User ${user.displayName} ${newStatus ? 'Banned' : 'Unbanned'}!` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to update user status.' });
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'app_config'), {
        youtubeLiveUrl,
        isLiveActive,
        dailySpinLimit,
        announcement,
        updatedAt: new Date().toISOString()
      });

      setMsg({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to save settings.' });
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.mobileNumber?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-black italic uppercase text-white tracking-tight">ADMIN CONTROL PANEL</h1>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[10px] font-bold uppercase">
              Superadmin
            </span>
          </div>
          <p className="text-white/60 text-xs font-mono mt-1">Manage draws, automated random winner selection, coin grants, user accounts & broadcast settings</p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl font-mono text-xs font-bold border ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('draws')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'draws' ? 'bg-orange-600 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" /> Lucky Draws
        </button>
        <button
          onClick={() => setActiveTab('coins')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'coins' ? 'bg-orange-600 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" /> Grant Coins
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' ? 'bg-orange-600 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings' ? 'bg-orange-600 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" /> App Settings
        </button>
      </div>

      {/* Tab 1: Lucky Draws Manager */}
      {activeTab === 'draws' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-400" /> Create New Lucky Draw
            </h3>

            <form onSubmit={handleCreateDraw} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Draw Type Category</label>
                <select
                  value={newDrawType}
                  onChange={(e) => setNewDrawType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono font-bold cursor-pointer"
                >
                  <option value="daily">📅 Daily Lucky Draw</option>
                  <option value="weekly">🗓️ Weekly Super Draw</option>
                  <option value="monthly">🏆 Monthly Mega Jackpot</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Draw Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Draw #102"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Total Tickets</label>
                  <input
                    type="number"
                    min={10}
                    value={newTotalTickets}
                    onChange={(e) => setNewTotalTickets(parseInt(e.target.value) || 100)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Ticket Price</label>
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> 20 Coins (Fixed)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Prize Amount</label>
                <input
                  type="text"
                  placeholder="₹500 Cash Prize"
                  value={newPrizeAmount}
                  onChange={(e) => setNewPrizeAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-widest rounded-2xl text-xs transition shadow-[0_0_15px_rgba(234,88,12,0.4)] cursor-pointer"
              >
                Launch Lucky Draw
              </button>
            </form>
          </div>

          {/* List of Draws */}
          <div className="lg:col-span-2 bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider">Active & Past Lucky Draws ({draws.length})</h3>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {draws.map((d) => (
                <div key={d.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{d.title}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                        d.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/40'
                      }`}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/60 font-mono mt-1">
                      Tickets Sold: <strong className="text-orange-400">{d.soldTickets}/{d.totalTickets}</strong> | Prize: {d.prizeAmount} | Price: {d.ticketPriceCoins} Coins
                    </p>
                    {d.winnerName && (
                      <p className="text-amber-400 font-mono font-bold mt-1 flex items-center gap-1">
                        🏆 Winner: {d.winnerName} (#{String(d.winnerTicketNumber).padStart(3, '0')})
                      </p>
                    )}
                  </div>

                  {d.status === 'active' && (
                    <button
                      onClick={() => handleOpenRandomWinnerPicker(d)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-xl transition text-xs shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>🎲 Pick Random Winner</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Master Spreadsheet (Admin View) */}
          <div className="lg:col-span-3 mt-4">
            <div className="mb-3">
              <h3 className="font-mono font-black uppercase text-white text-sm tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> ADMIN MASTER TICKET SPREADSHEET (UNMASKED FULL DATA)
              </h3>
              <p className="text-xs text-white/50">
                Consolidated Excel-style table with full unmasked user names, mobile numbers, ticket numbers, search, filters, and export tools.
              </p>
            </div>
            <LuckyDrawSpreadsheet
              tickets={allTickets}
              draws={draws}
              isAdmin={true}
              onDeclareWinner={(drawId) => {
                const parentDraw = draws.find((d) => d.id === drawId);
                if (parentDraw) {
                  handleOpenRandomWinnerPicker(parentDraw);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Coin Control */}
      {activeTab === 'coins' && (
        <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 max-w-xl mx-auto space-y-4">
          <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-orange-400" /> Coin Grant / Adjuster
          </h3>

          <form onSubmit={handleGrantCoins} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Select User</label>
              <select
                value={selectedUserUid}
                onChange={(e) => setSelectedUserUid(e.target.value)}
                required
                className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono font-bold cursor-pointer"
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.displayName || 'User'} ({u.mobileNumber || u.email || 'No Mobile'}) - Balance: {u.coinBalance || 0} Coins
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Coins to Add</label>
              <input
                type="number"
                min={1}
                value={grantAmount}
                onChange={(e) => setGrantAmount(parseInt(e.target.value) || 10)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl text-xs transition shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              Grant Coins Now
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" /> Registered Users ({users.length})
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name, mobile..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Coin Balance</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black font-black text-[10px] flex items-center justify-center">
                        {u.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span>{u.displayName || 'Anonymous'}</span>
                    </td>
                    <td className="py-3 px-3">{u.mobileNumber || 'N/A'}</td>
                    <td className="py-3 px-3">{u.city || 'N/A'}</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">{u.coinBalance || 0} Coins</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/10 text-white/50'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 ml-auto cursor-pointer ${
                          u.isBanned 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                      >
                        {u.isBanned ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: App Settings */}
      {activeTab === 'settings' && (
        <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 max-w-xl mx-auto space-y-4">
          <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-400" /> Global App Settings
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">YouTube Live Broadcast URL / Embed</label>
              <input
                type="text"
                value={youtubeLiveUrl}
                onChange={(e) => setYoutubeLiveUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Announcement Title</label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Daily Spin Limit</label>
                <input
                  type="number"
                  min={1}
                  value={dailySpinLimit}
                  onChange={(e) => setDailySpinLimit(parseInt(e.target.value) || 3)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 mb-1">Live Status</label>
                <button
                  type="button"
                  onClick={() => setIsLiveActive(!isLiveActive)}
                  className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
                    isLiveActive ? 'bg-red-600 text-white' : 'bg-white/10 text-white/40'
                  }`}
                >
                  {isLiveActive ? '🔴 Broadcast LIVE' : '📹 Broadcast Offline'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-widest rounded-2xl text-xs transition shadow-[0_0_15px_rgba(234,88,12,0.4)] cursor-pointer"
            >
              Save App Configuration
            </button>
          </form>
        </div>
      )}

      {/* Automated Random Winner Selection Modal */}
      {randomWinnerModalDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden font-sans">
            <button
              onClick={() => {
                if (!isShuffling) {
                  setRandomWinnerModalDraw(null);
                  setSelectedRandomTicket(null);
                }
              }}
              disabled={isShuffling}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> AUTOMATED RANDOM WINNER SELECTION
              </div>
              <h2 className="text-xl font-black italic uppercase text-white">
                {randomWinnerModalDraw.title}
              </h2>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Fair, automated random winner drawing among all {allTickets.filter(t => t.drawId === randomWinnerModalDraw.id).length} sold tickets.
              </p>
            </div>

            {/* Randomizer Animation / Display Box */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center my-4 relative overflow-hidden space-y-3">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {isShuffling ? '🎲 ROLLING RANDOM TICKET...' : selectedRandomTicket ? '🎉 RANDOMLY SELECTED WINNING TICKET' : 'READY TO DRAW WINNER'}
              </p>

              <div className="py-2">
                <span className={`font-mono font-black text-4xl sm:text-5xl tracking-widest transition-all ${
                  isShuffling 
                    ? 'text-amber-400 animate-pulse scale-105 inline-block' 
                    : selectedRandomTicket 
                    ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
                    : 'text-slate-600'
                }`}>
                  {displayTicketNumber !== null ? `#${String(displayTicketNumber).padStart(3, '0')}` : '#???'}
                </span>
              </div>

              {selectedRandomTicket && !isShuffling && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-left font-mono text-xs animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Winner Name:</span>
                    <strong className="text-white text-sm">{selectedRandomTicket.userName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Mobile Number:</span>
                    <strong className="text-amber-300">{selectedRandomTicket.userMobile}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>City / Location:</span>
                    <strong className="text-slate-200">{selectedRandomTicket.userCity || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-1 mt-1">
                    <span>Prize Award:</span>
                    <strong className="text-emerald-400 font-bold">{randomWinnerModalDraw.prizeAmount}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={isShuffling}
                onClick={handleRollRandomWinner}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RefreshCw className={`w-4 h-4 text-amber-400 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>{selectedRandomTicket ? 'Re-roll Random Winner' : '🎲 Pick Random Ticket'}</span>
              </button>

              {selectedRandomTicket && !isShuffling && (
                <button
                  type="button"
                  onClick={handleConfirmRandomWinner}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>Confirm & Publish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
