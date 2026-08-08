import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Winner } from '../types';
import { Trophy, Search, User, MapPin, Sparkles, Medal } from 'lucide-react';

export const WinnerSection: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const path = 'winners';
    const q = query(collection(db, path));
    const unsub = onSnapshot(q, (snap) => {
      const list: Winner[] = [];
      snap.docs.forEach((d) => list.push({ id: d.id, ...d.data() } as Winner));
      list.sort((a, b) => new Date(b.drawDate || 0).getTime() - new Date(a.drawDate || 0).getTime());
      setWinners(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, []);

  const filteredWinners = winners.filter(
    (w) =>
      w.winnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.winnerCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.drawTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto relative z-10">
      {/* Header */}
      <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-orange-400" /> Hall of Champions
          </div>
          <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight">WINNER <span className="text-orange-500">GALLERY</span></h1>
          <p className="text-xs text-white/60 mt-1">
            Verified transparent lucky draw winners. Every draw generates a public PDF report.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search Winner or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Winner Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredWinners.length === 0 ? (
          <div className="col-span-full bg-black/60 border border-white/10 rounded-3xl p-16 text-center text-white/40 text-xs font-mono uppercase tracking-widest">
            No winners recorded yet. Participate in active draws!
          </div>
        ) : (
          filteredWinners.map((w, idx) => (
            <div
              key={w.id || idx}
              className="bg-black/60 border border-white/10 hover:border-orange-500/50 rounded-2xl p-5 space-y-3 relative overflow-hidden group shadow-xl transition backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                  {w.drawTitle}
                </span>
                <span className="text-xs font-mono font-black text-orange-400">
                  #{String(w.ticketNumber).padStart(3, '0')}
                </span>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 text-black font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                  {w.winnerName ? w.winnerName.charAt(0).toUpperCase() : 'R'}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{w.winnerName}</h3>
                  <p className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5 font-mono">
                    <span>{w.winnerMaskedMobile || '98******45'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5 text-orange-400" />{w.winnerCity}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-mono">Prize</span>
                <span className="font-mono font-black text-orange-400 text-sm">{w.prizeAmount}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
