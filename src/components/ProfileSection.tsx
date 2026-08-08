import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { CoinTransaction, Ticket, Winner } from '../types';
import { User, Phone, MapPin, Coins, Ticket as TicketIcon, Trophy, Edit3, History, Shield, Check } from 'lucide-react';

export const ProfileSection: React.FC = () => {
  const { userProfile, saveUserProfileDetails, maskMobile } = useAuth();
  
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
  const [wonHistory, setWonHistory] = useState<Winner[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    setNameInput(userProfile.displayName || '');
    setMobileInput(userProfile.mobileNumber || '');
    setCityInput(userProfile.city || 'Ahmedabad');

    // Auto open edit mode if profile is not completed yet
    if (!userProfile.isProfileCompleted || !userProfile.mobileNumber) {
      setIsEditing(true);
    }

    // Fetch coin transactions
    const txPath = 'coinTransactions';
    const txQuery = query(collection(db, txPath), where('userUid', '==', userProfile.uid));
    const unsubTx = onSnapshot(txQuery, (snap) => {
      const list: CoinTransaction[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as CoinTransaction));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, txPath);
    });

    // Fetch user tickets
    const ticketPath = 'tickets';
    const ticketQuery = query(collection(db, ticketPath), where('userUid', '==', userProfile.uid));
    const unsubTicket = onSnapshot(ticketQuery, (snap) => {
      const list: Ticket[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as Ticket));
      setPurchasedTickets(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ticketPath);
    });

    // Fetch winning history
    const winPath = 'winners';
    const winQuery = query(collection(db, winPath), where('winnerUid', '==', userProfile.uid));
    const unsubWin = onSnapshot(winQuery, (snap) => {
      const list: Winner[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as Winner));
      setWonHistory(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, winPath);
    });

    return () => {
      unsubTx();
      unsubTicket();
      unsubWin();
    };
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmedName = nameInput.trim();
    const trimmedMobile = mobileInput.trim();

    if (!trimmedName || !trimmedMobile) {
      setMsg({ text: 'Please enter both your Full Name and Mobile Number.', type: 'info' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveUserProfileDetails(trimmedName, trimmedMobile);
      setIsEditing(false);
      if (res.awardedCoins) {
        setMsg({ text: '🎉 20 BONUS COINS ADDED! Your profile is complete!', type: 'success' });
      } else {
        setMsg({ text: 'Profile details saved instantly!', type: 'success' });
      }
      setTimeout(() => setMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setMsg({ text: 'Failed to update profile.', type: 'info' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!userProfile) return null;

  const isProfileIncomplete = !userProfile.isProfileCompleted;

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto relative z-10">
      
      {/* 20 Coins Bonus Callout Banner on Profile Page */}
      {isProfileIncomplete && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center shrink-0">
              <Coins className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
                20 BONUS COINS CLAIM
              </div>
              <h2 className="text-xl font-black italic uppercase text-white tracking-tight">
                Complete your details to get 20 coins
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Simply enter your full name and mobile number below to claim your 20 coins instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Header Box */}
      <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 text-black font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)]">
              {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white italic uppercase tracking-wider">
                  {userProfile.displayName || 'Unnamed User'}
                </h1>
                <span className="px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {userProfile.role?.toUpperCase() || 'USER'}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">{userProfile.email}</p>
              <div className="flex items-center gap-3 text-xs text-white/70 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-orange-400" /> 
                  {userProfile.mobileNumber ? maskMobile(userProfile.mobileNumber) : 'Not Provided'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-orange-400 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" /> {isEditing ? 'Close Edit' : 'Edit Profile'}
          </button>
        </div>

        {msg && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-mono font-bold text-center border ${
            msg.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Edit / Profile Details Form */}
        {(isEditing || isProfileIncomplete) && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-amber-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                disabled={isSaving}
                placeholder="Enter your full name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-black/80 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-amber-300 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                disabled={isSaving}
                placeholder="10-digit mobile number"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                className="w-full bg-black/80 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono disabled:opacity-50"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-widest rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Saving Details...</span>
                  </>
                ) : (
                  isProfileIncomplete ? 'Save Details & Get 20 Coins' : 'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/60 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">Coin Balance</p>
            <p className="text-3xl font-black font-mono text-orange-400 mt-1">{userProfile.coinBalance}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-black/60 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">Total Tickets</p>
            <p className="text-3xl font-black font-mono text-white mt-1">{purchasedTickets.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <TicketIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-black/60 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">Draw Wins</p>
            <p className="text-3xl font-black font-mono text-orange-400 mt-1">{wonHistory.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tables: Winning History & Coin Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Winning History */}
        <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
          <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            Winning History ({wonHistory.length})
          </h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {wonHistory.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-white/30 uppercase tracking-widest">
                No winning draws yet. Keep participating!
              </div>
            ) : (
              wonHistory.map((w) => (
                <div key={w.id} className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-orange-300">{w.drawTitle}</p>
                    <p className="text-[10px] font-mono text-white/40">Winning Ticket: #{String(w.ticketNumber).padStart(3, '0')}</p>
                  </div>
                  <span className="font-mono font-black text-orange-400 text-sm">{w.prizeAmount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coin Transactions Log */}
        <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
          <h3 className="font-mono font-black uppercase text-white text-xs tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-orange-400" />
            Coin Transactions Log
          </h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-white/30 uppercase tracking-widest">
                No coin transactions recorded.
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white/80">{tx.description}</p>
                    <p className="text-[10px] font-mono text-white/40">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`font-mono font-black text-xs ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Coins
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
