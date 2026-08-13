import React, { useState, useEffect } from 'react';
import { useAuth, maskName, maskMobile } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { LuckyDraw, Ticket } from '../types';
import { Ticket as TicketIcon, Trophy, ShieldCheck, Coins, Sparkles, Clock, Calendar, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LuckyDrawSpreadsheet } from './LuckyDrawSpreadsheet';
import { LuckyDrawWelcomeModal } from './LuckyDrawWelcomeModal';

export const LuckyDrawSection: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { userProfile, currentUser, deductCoins } = useAuth();
  const [activeDraws, setActiveDraws] = useState<LuckyDraw[]>([]);
  const [completedDraws, setCompletedDraws] = useState<LuckyDraw[]>([]);
  const [allDraws, setAllDraws] = useState<LuckyDraw[]>([]);
  const [drawCategory, setDrawCategory] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDraw, setSelectedDraw] = useState<LuckyDraw | null>(null);
  
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMyTicketsModal, setShowMyTicketsModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // Helper to categorize draws
  const getCategoryFromDraw = (draw: LuckyDraw): 'daily' | 'weekly' | 'monthly' => {
    if (draw.drawType) return draw.drawType;
    const titleLower = draw.title.toLowerCase();
    if (titleLower.includes('weekly')) return 'weekly';
    if (titleLower.includes('monthly')) return 'monthly';
    return 'daily';
  };

  // Seed default draws if Firestore is empty
  const autoSeedDefaultDraws = async (existingDraws: LuckyDraw[]) => {
    if (existingDraws.length > 0) return;
    try {
      const defaultDrawsData = [
        {
          title: 'Daily Lucky Draw',
          drawType: 'daily',
          totalTickets: 100,
          soldTickets: 0,
          ticketPriceCoins: 20,
          prizeAmount: '₹500 Cash Prize',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Weekly Super Draw',
          drawType: 'weekly',
          totalTickets: 500,
          soldTickets: 0,
          ticketPriceCoins: 20,
          prizeAmount: '₹2,500 Cash Prize',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Monthly Mega Jackpot',
          drawType: 'monthly',
          totalTickets: 2000,
          soldTickets: 0,
          ticketPriceCoins: 20,
          prizeAmount: '₹10,000 Jackpot Prize',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];

      for (const d of defaultDrawsData) {
        await addDoc(collection(db, 'luckyDraws'), d);
      }
    } catch (err) {
      console.error('Auto seed draws error:', err);
    }
  };

  // Fetch Lucky Draws from Firestore
  useEffect(() => {
    const path = 'luckyDraws';
    const q = query(collection(db, path));
    const unsub = onSnapshot(q, (snapshot) => {
      const active: LuckyDraw[] = [];
      const completed: LuckyDraw[] = [];
      const list: LuckyDraw[] = [];

      snapshot.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() } as LuckyDraw;
        if (!data.ticketPriceCoins || data.ticketPriceCoins !== 20) {
          data.ticketPriceCoins = 20;
        }
        list.push(data);
        if (data.status === 'active') active.push(data);
        else completed.push(data);
      });

      if (snapshot.docs.length === 0) {
        autoSeedDefaultDraws([]);
      }

      setAllDraws(list);
      setActiveDraws(active);
      setCompletedDraws(completed);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, []);

  // Subscribe to ALL tickets across all draws for spreadsheet master view
  useEffect(() => {
    const path = 'tickets';
    const q = query(collection(db, path));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched: Ticket[] = [];
      snapshot.docs.forEach((d) => {
        fetched.push({ id: d.id, ...d.data() } as Ticket);
      });
      // Sort newest purchased first
      fetched.sort((a, b) => new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime());
      setAllTickets(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, []);

  // Auto-select active draw based on selected drawCategory
  useEffect(() => {
    const active = activeDraws.filter((d) => getCategoryFromDraw(d) === drawCategory);
    const completed = completedDraws.filter((d) => getCategoryFromDraw(d) === drawCategory);

    if (active.length > 0) {
      setSelectedDraw(active[0]);
    } else if (completed.length > 0) {
      setSelectedDraw(completed[0]);
    } else if (activeDraws.length > 0) {
      setSelectedDraw(activeDraws[0]);
    } else if (allDraws.length > 0) {
      setSelectedDraw(allDraws[0]);
    } else {
      setSelectedDraw(null);
    }
  }, [drawCategory, activeDraws, completedDraws, allDraws]);

  // Tickets for currently selected draw (to check taken ticket numbers and user's tickets in this draw)
  const selectedDrawTickets = selectedDraw ? allTickets.filter((t) => t.drawId === selectedDraw.id) : [];
  const userTicketsForDraw = currentUser && selectedDraw ? allTickets.filter((t) => t.userUid === currentUser.uid && t.drawId === selectedDraw.id) : [];

  const handleBuyTickets = async (qty: number = 1) => {
    if (!currentUser || !userProfile) {
      onOpenAuth();
      return;
    }

    if (!selectedDraw) return;

    if (selectedDraw.soldTickets >= selectedDraw.totalTickets) {
      setMsg({ type: 'error', text: 'Draw is Sold Out!' });
      return;
    }

    const totalCost = qty * 20; // 1 ticket = 20
    if (userProfile.coinBalance < totalCost) {
      setMsg({ type: 'error', text: `Insufficient Coins! Need ${totalCost} Coins. Play Ludo or Spin to Win to earn.` });
      return;
    }

    const availableCount = selectedDraw.totalTickets - selectedDraw.soldTickets;
    if (qty > availableCount) {
      setMsg({ type: 'error', text: `Only ${availableCount} ticket(s) remaining in this draw!` });
      return;
    }

    const takenNumbers = selectedDrawTickets.map((t) => t.ticketNumber);
    const allocatedNumbers: number[] = [];
    for (let i = 1; i <= selectedDraw.totalTickets; i++) {
      if (!takenNumbers.includes(i)) {
        allocatedNumbers.push(i);
        if (allocatedNumbers.length === qty) break;
      }
    }

    if (allocatedNumbers.length < qty) {
      setMsg({ type: 'error', text: 'Not enough available tickets!' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const success = await deductCoins(
        totalCost,
        'ticket_purchase',
        `Bought ${qty} Ticket(s) for ${selectedDraw.title}`
      );

      if (!success) {
        setMsg({ type: 'error', text: 'Coin deduction failed.' });
        setLoading(false);
        return;
      }

      const displayName = userProfile.displayName || 'Rahul';
      const mobileNum = userProfile.mobileNumber || '9876543210';
      const cat = getCategoryFromDraw(selectedDraw);

      for (const ticketNum of allocatedNumbers) {
        await addDoc(collection(db, 'tickets'), {
          drawId: selectedDraw.id,
          drawTitle: selectedDraw.title,
          drawType: cat,
          ticketNumber: ticketNum,
          userUid: currentUser.uid,
          userName: displayName,
          userMaskedName: maskName(displayName),
          userMobile: mobileNum,
          userMobileMasked: maskMobile(mobileNum),
          userCity: userProfile.city || 'Ahmedabad',
          purchasedAt: new Date().toISOString(),
          coinsUsed: 20,
          ticketQuantity: 1,
          status: 'Active'
        });
      }

      const drawRef = doc(db, 'luckyDraws', selectedDraw.id);
      await updateDoc(drawRef, {
        soldTickets: increment(qty)
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        totalTicketsBought: increment(qty)
      });

      const formattedNumStr = allocatedNumbers.map((n) => `#${String(n).padStart(3, '0')}`).join(', ');
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.7 } });
      setMsg({ type: 'success', text: `Successfully purchased ${qty} Ticket(s) (${formattedNumStr}) for ${totalCost} Coins! Added to Spreadsheet.` });
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to purchase ticket.' });
    } finally {
      setLoading(false);
    }
  };

  const soldPercentage = selectedDraw ? Math.round((selectedDraw.soldTickets / selectedDraw.totalTickets) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-2.5 animate-in fade-in h-full overflow-hidden">
      
      {/* Category Tabs: Daily / Weekly / Monthly + Guide Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setDrawCategory('daily')}
            className={`py-2 px-2 rounded-lg font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer w-full text-center ${
              drawCategory === 'daily'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">DAILY</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawCategory('weekly')}
            className={`py-2 px-2 rounded-lg font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer w-full text-center ${
              drawCategory === 'weekly'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">WEEKLY</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawCategory('monthly')}
            className={`py-2 px-2 rounded-lg font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer w-full text-center ${
              drawCategory === 'monthly'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">MONTHLY</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowWelcomeModal(true)}
          className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl transition flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 cursor-pointer active:scale-95 shadow-sm"
          title="Lucky Draw Guide & Rules"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Guide</span>
        </button>
      </div>

      {/* Active Draw Selection & Purchase Box */}
      {selectedDraw && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                  selectedDraw.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {selectedDraw.status === 'active' ? '● LIVE' : '✓ CLOSED'}
                </span>
              </div>
              <h2 className="text-xs font-black italic uppercase text-white tracking-wider">{selectedDraw.title}</h2>
            </div>
          </div>

          {/* High-visibility Highlighted Cash Prize Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border-2 border-amber-400/60 rounded-xl p-2 text-center shadow-[0_0_15px_rgba(245,158,11,0.3)] my-1 relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-amber-300 font-mono tracking-widest mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>GRAND CASH PRIZE</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black italic text-amber-300 font-mono tracking-wider drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
              {selectedDraw.prizeAmount}
            </div>
          </div>

          {/* Single Clean Buy Action Button */}
          {selectedDraw.status === 'active' && (
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <button
                onClick={() => handleBuyTickets(1)}
                disabled={loading || selectedDraw.soldTickets >= selectedDraw.totalTickets}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg text-xs uppercase font-mono tracking-wider transition disabled:opacity-50 cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
              >
                <TicketIcon className="w-4 h-4 shrink-0" />
                <span>
                  {loading
                    ? 'Processing Purchase...'
                    : 'Buy 1 ticket for 20 coins'}
                </span>
              </button>
            </div>
          )}

          {/* Progress Bar & Tickets Purchased for THIS Specific Draw */}
          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex justify-between items-center text-slate-400 gap-2">
              <span>Sold: {selectedDraw.soldTickets}/{selectedDraw.totalTickets} ({soldPercentage}%)</span>
              <button
                type="button"
                onClick={() => setShowMyTicketsModal(true)}
                className="text-amber-300 font-black px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 rounded-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95 text-[11px] shadow-sm"
              >
                <TicketIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>My Tickets: {userTicketsForDraw.length}</span>
              </button>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(soldPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Feedback message */}
          {msg && (
            <div className={`p-1.5 rounded text-[10px] font-bold font-mono ${
              msg.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'
            }`}>
              {msg.text}
            </div>
          )}
        </div>
      )}

      {/* SINGLE CONSOLIDATED EXCEL-STYLE SPREADSHEET (Scrollable Table Area) */}
      <div className="flex-1 flex flex-col">
        <LuckyDrawSpreadsheet
          tickets={allTickets}
          draws={allDraws}
          selectedDraw={selectedDraw}
          isAdmin={false}
          currentUserUid={currentUser?.uid}
        />
      </div>

      {/* MY TICKETS MODAL POPUP */}
      {showMyTicketsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-left font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-white uppercase tracking-wide">My Purchased Tickets</h3>
              </div>
              <button
                onClick={() => setShowMyTicketsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <p className="text-[11px] text-slate-400">Selected Draw: <strong className="text-white">{selectedDraw?.title || 'Active Draw'}</strong></p>
              <p className="text-[11px] text-slate-400">Total Purchased: <strong className="text-amber-300">{userTicketsForDraw.length} ticket(s)</strong></p>
            </div>

            {userTicketsForDraw.length === 0 ? (
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                You haven't purchased any tickets for this draw yet.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {userTicketsForDraw.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-amber-400/40 flex items-center justify-between text-xs font-bold shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-mono text-sm font-black bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        #{String(t.ticketNumber).padStart(3, '0')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">20 Coins</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.purchasedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowMyTicketsModal(false)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase font-mono tracking-wider transition cursor-pointer shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Lucky Draw Welcome & Info Popup */}
      <LuckyDrawWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </div>
  );
};

