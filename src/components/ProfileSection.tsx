import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { CoinTransaction, Ticket, UserQuery } from '../types';
import { 
  User, 
  Phone, 
  Mail, 
  Coins, 
  Ticket as TicketIcon, 
  Edit3, 
  History, 
  ShieldCheck, 
  Check, 
  Sun, 
  Moon, 
  HelpCircle, 
  Send, 
  ArrowUpRight, 
  ArrowDownRight, 
  Camera, 
  MessageSquare, 
  Clock, 
  Sparkles,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
];

export const ProfileSection: React.FC = () => {
  const { userProfile, updateProfileData, saveUserProfileDetails, maskMobile } = useAuth();
  
  // Data state
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
  const [userQueries, setUserQueries] = useState<UserQuery[]>([]);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [selectedPresetAvatar, setSelectedPresetAvatar] = useState<string | null>(null);

  // Filter state for coin history
  const [txFilter, setTxFilter] = useState<'all' | 'earned' | 'spent'>('all');

  // Theme Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('1xluck_theme');
    return saved ? saved === 'dark' : true;
  });

  // Query & Support state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTab, setSupportTab] = useState<'submit' | 'my_queries'>('submit');
  const [querySubject, setQuerySubject] = useState('Coins & Rewards');
  const [queryText, setQueryText] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize form fields & listeners
  useEffect(() => {
    if (!userProfile) return;

    setNameInput(userProfile.displayName || '');
    setMobileInput(userProfile.mobileNumber || '');
    setPhotoUrlInput(userProfile.photoURL || '');
    setSelectedPresetAvatar(userProfile.photoURL || null);

    // Auto open edit mode if profile incomplete
    if (!userProfile.isProfileCompleted || !userProfile.mobileNumber) {
      setIsEditing(true);
    }

    // 1. Fetch coin transactions
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

    // 2. Fetch user tickets
    const ticketPath = 'tickets';
    const ticketQuery = query(collection(db, ticketPath), where('userUid', '==', userProfile.uid));
    const unsubTicket = onSnapshot(ticketQuery, (snap) => {
      const list: Ticket[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as Ticket));
      setPurchasedTickets(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ticketPath);
    });

    // 3. Fetch user queries
    const queryPath = 'userQueries';
    const qQuery = query(collection(db, queryPath), where('userUid', '==', userProfile.uid));
    const unsubQueries = onSnapshot(qQuery, (snap) => {
      const list: UserQuery[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as UserQuery));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserQueries(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, queryPath);
    });

    return () => {
      unsubTx();
      unsubTicket();
      unsubQueries();
    };
  }, [userProfile]);

  // Handle Light/Dark Mode Toggle
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('1xluck_theme', newTheme ? 'dark' : 'light');
  };

  // Handle Save Profile Updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !userProfile) return;

    const trimmedName = nameInput.trim();
    const trimmedMobile = mobileInput.trim();
    const finalPhotoUrl = selectedPresetAvatar || photoUrlInput.trim();

    if (!trimmedName || !trimmedMobile) {
      setMsg({ text: 'Please enter both your Full Name and Mobile Number.', type: 'info' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveUserProfileDetails(trimmedName, trimmedMobile);
      
      // Update photo URL if changed
      if (finalPhotoUrl !== userProfile.photoURL) {
        await updateProfileData({ photoURL: finalPhotoUrl });
      }

      setIsEditing(false);
      if (res.awardedCoins) {
        setMsg({ text: '🎉 20 BONUS COINS ADDED! Your profile is completed!', type: 'success' });
      } else {
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
      }
      setTimeout(() => setMsg(null), 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setMsg({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Submit Support Query
  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim() || !userProfile) return;

    setIsSubmittingQuery(true);
    try {
      await addDoc(collection(db, 'userQueries'), {
        userUid: userProfile.uid,
        userName: userProfile.displayName || 'User',
        userEmail: userProfile.email || '',
        subject: querySubject,
        question: queryText.trim(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      setQueryText('');
      setMsg({ text: 'Question submitted successfully! Check status under "My Queries".', type: 'success' });
      setSupportTab('my_queries');
      setTimeout(() => setMsg(null), 5000);
    } catch (err) {
      console.error('Submit query error:', err);
      setMsg({ text: 'Failed to submit query. Please try again.', type: 'error' });
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  if (!userProfile) return null;

  // Filtered coin history
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'earned') return tx.amount > 0;
    if (txFilter === 'spent') return tx.amount < 0;
    return true;
  });

  const isProfileIncomplete = !userProfile.isProfileCompleted;
  const avatarLetter = userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U';

  // Dynamic Theme Classes
  const cardBgClass = isDarkMode 
    ? 'bg-slate-900/90 border-slate-800 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';
  const subTextClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const headerBgClass = isDarkMode 
    ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-amber-500/30' 
    : 'bg-gradient-to-b from-amber-50/80 via-white to-slate-50 border-amber-300 shadow-lg';

  return (
    <div className={`space-y-6 animate-in fade-in max-w-4xl mx-auto pb-12 transition-colors duration-300 font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Profile Incomplete Banner - 20 Coins Bonus */}
      {isProfileIncomplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center shrink-0">
              <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
                20 BONUS COINS
              </div>
              <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tight">
                Complete your details to claim 20 coins
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Enter your full name and mobile number to receive 20 coins instantly.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Message Banner */}
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl text-xs font-mono font-bold text-center border flex items-center justify-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : msg.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </motion.div>
      )}

      {/* TOP HEADER: CIRCULAR PROFILE AVATAR & USER DETAILS */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${headerBgClass} relative overflow-hidden shadow-2xl`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Circular Profile Avatar */}
            <div className="relative group shrink-0">
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName || 'Profile Avatar'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 text-slate-950 font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] uppercase">
                  {avatarLetter}
                </div>
              )}

              {/* Edit Icon Badge */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-0 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-lg border-2 border-slate-950 transition cursor-pointer active:scale-95"
                title="Edit Avatar & Profile"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wider">
                  {userProfile.displayName || '1X Luck User'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {userProfile.role?.toUpperCase() || 'PLAYER'}
                </span>
              </div>

              <p className={`text-xs font-mono flex items-center justify-center sm:justify-start gap-1.5 ${subTextClass}`}>
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{userProfile.email}</span>
              </p>

              <p className={`text-xs font-mono flex items-center justify-center sm:justify-start gap-1.5 ${subTextClass}`}>
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{userProfile.mobileNumber ? maskMobile(userProfile.mobileNumber) : 'Mobile Not Provided'}</span>
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Edit3 className="w-4 h-4 stroke-[2.5]" />
            <span>{isEditing ? 'Close Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* EDIT PROFILE FORM PANEL */}
        <AnimatePresence>
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSaveProfile}
              className="mt-6 pt-6 border-t border-amber-500/20 space-y-4 text-left"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>UPDATE PROFILE INFORMATION</span>
              </h3>

              {/* Avatar Image Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-300">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPresetAvatar(null);
                      setPhotoUrlInput('');
                    }}
                    className={`w-12 h-12 rounded-full font-black text-xs border-2 flex items-center justify-center shrink-0 cursor-pointer transition ${
                      !selectedPresetAvatar && !photoUrlInput
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    Letter ({avatarLetter})
                  </button>

                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPresetAvatar(url)}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                        selectedPresetAvatar === url ? 'border-amber-400 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL Input */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-300 mb-1">
                  Or Custom Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={photoUrlInput}
                  onChange={(e) => {
                    setPhotoUrlInput(e.target.value);
                    if (e.target.value) setSelectedPresetAvatar(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-amber-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    placeholder="Enter full name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-amber-400 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={isSaving}
                    placeholder="10-digit mobile number"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* TWO SUMMARY CARDS: COIN BALANCE & TOTAL LUCKY DRAW TICKETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Coin Balance */}
        <div className={`p-6 rounded-3xl border ${cardBgClass} relative overflow-hidden flex items-center justify-between group`}>
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>COIN BALANCE</span>
            </p>
            <p className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
              {userProfile.coinBalance.toLocaleString()}
            </p>
            <p className={`text-[11px] font-mono ${subTextClass}`}>Available for Lucky Draw Tickets</p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Coins className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Total Lucky Draw Tickets */}
        <div className={`p-6 rounded-3xl border ${cardBgClass} relative overflow-hidden flex items-center justify-between group`}>
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <TicketIcon className="w-4 h-4 text-purple-400" />
              <span>TOTAL LUCKY DRAW TICKETS</span>
            </p>
            <p className="text-3xl sm:text-4xl font-black font-mono text-purple-400 tracking-tight">
              {purchasedTickets.length.toLocaleString()}
            </p>
            <p className={`text-[11px] font-mono ${subTextClass}`}>Active & Historical Tickets</p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <TicketIcon className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* COIN HISTORY SECTION ONLY */}
      <div className={`p-6 rounded-3xl border ${cardBgClass} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-0.5">
            <h3 className="text-base font-black italic uppercase tracking-wider flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <span>COIN HISTORY</span>
            </h3>
            <p className={`text-xs font-mono ${subTextClass}`}>
              Record of earned and deducted coins ({filteredTransactions.length})
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono shrink-0">
            <button
              onClick={() => setTxFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition cursor-pointer ${
                txFilter === 'all' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTxFilter('earned')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition cursor-pointer ${
                txFilter === 'earned' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Earned (+)
            </button>
            <button
              onClick={() => setTxFilter('spent')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition cursor-pointer ${
                txFilter === 'spent' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spent (-)
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Coins className="w-10 h-10 text-slate-600 mx-auto opacity-40" />
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                No coin history found.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isEarned = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDarkMode
                      ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        isEarned
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      {isEarned ? (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold truncate text-white">
                        {tx.description || (isEarned ? 'Coins Received' : 'Coins Spent')}
                      </p>
                      <p className={`text-[10px] font-mono ${subTextClass} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(tx.createdAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono font-black text-sm">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs inline-block ${
                        isEarned
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isEarned ? `+${tx.amount}` : tx.amount} Coins
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SETTINGS & SUPPORT SECTION */}
      <div className={`p-6 rounded-3xl border ${cardBgClass} space-y-5`}>
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-base font-black italic uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>SETTINGS & SUPPORT</span>
          </h3>
          <p className={`text-xs font-mono ${subTextClass}`}>
            Preferences, Query Submissions & Support
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Light/Dark Mode Toggle */}
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-200 text-slate-800'}`}>
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase font-mono">Theme Mode</p>
                <p className={`text-[10px] font-mono ${subTextClass}`}>
                  {isDarkMode ? 'Dark Theme Active' : 'Light Theme Active'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer relative ${
                isDarkMode ? 'bg-amber-500' : 'bg-slate-400'
              }`}
              title="Toggle Light / Dark Mode"
            >
              <div
                className={`w-4 h-4 bg-slate-950 rounded-full transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Query & Support Option */}
          <button
            onClick={() => setShowSupportModal(true)}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition group cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
                : 'bg-slate-50 border-slate-200 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase font-mono flex items-center gap-1.5">
                  <span>Query & Support</span>
                  {userQueries.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[9px]">
                      {userQueries.length}
                    </span>
                  )}
                </p>
                <p className={`text-[10px] font-mono ${subTextClass}`}>
                  Ask questions & view status
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>

        </div>
      </div>

      {/* QUERY & SUPPORT MODAL */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-blue-500/30 shadow-2xl overflow-hidden my-auto text-left"
            >
              {/* Modal Header */}
              <div className="p-5 pb-4 border-b border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold uppercase">
                    <MessageSquare className="w-3 h-3" />
                    <span>QUERY & SUPPORT HELP DESK</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">
                    1X Luck Support
                  </h3>
                </div>

                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="grid grid-cols-2 p-2 bg-slate-950 border-b border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setSupportTab('submit')}
                  className={`py-2 text-center font-bold uppercase rounded-xl transition cursor-pointer ${
                    supportTab === 'submit' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Submit Question
                </button>
                <button
                  onClick={() => setSupportTab('my_queries')}
                  className={`py-2 text-center font-bold uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    supportTab === 'my_queries' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>My Queries</span>
                  {userQueries.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                      {userQueries.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar font-sans text-xs">
                {supportTab === 'submit' ? (
                  <form onSubmit={handleSubmitQuery} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-slate-300 mb-1">
                        Query Subject / Topic *
                      </label>
                      <select
                        value={querySubject}
                        onChange={(e) => setQuerySubject(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono cursor-pointer"
                      >
                        <option value="Coins & Rewards">Coins & Rewards</option>
                        <option value="Lucky Draw Tickets">Lucky Draw Tickets</option>
                        <option value="Ludo Game Play">Ludo Game Play</option>
                        <option value="Lucky Spin Query">Lucky Spin Query</option>
                        <option value="Account & Login">Account & Login</option>
                        <option value="Other Question">Other Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-slate-300 mb-1">
                        Your Question / Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe your question or issue in detail..."
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingQuery || !queryText.trim()}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSubmittingQuery ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Submitting Query...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Question</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {userQueries.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-600 mx-auto opacity-40" />
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                          You have not submitted any queries yet.
                        </p>
                      </div>
                    ) : (
                      userQueries.map((q) => (
                        <div key={q.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px] uppercase">
                              {q.subject}
                            </span>

                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                              q.status === 'Resolved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : q.status === 'In Progress'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {q.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 font-medium">{q.question}</p>

                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Submitted: {new Date(q.createdAt).toLocaleString()}</span>
                          </div>

                          {/* Admin Reply if present */}
                          {q.adminReply && (
                            <div className="mt-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 space-y-1">
                              <p className="font-mono font-bold text-[10px] uppercase text-blue-400">Support Team Reply:</p>
                              <p className="text-xs">{q.adminReply}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
