import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Youtube, ExternalLink, Radio, Tv, Clock, Play, AlertCircle, HelpCircle } from 'lucide-react';
import { YouTubeLiveWelcomeModal } from './YouTubeLiveWelcomeModal';

export const YouTubeLiveSection: React.FC = () => {
  const [liveUrl, setLiveUrl] = useState<string>('https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [videoTitle, setVideoTitle] = useState<string>('1X Luck - Live Draw & Winner Announcement');
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);

  useEffect(() => {
    const path = 'settings/app_config';
    const unsub = onSnapshot(doc(db, 'settings', 'app_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.youtubeLiveUrl) setLiveUrl(data.youtubeLiveUrl);
        if (data.isLiveActive !== undefined) setIsLiveActive(data.isLiveActive);
        if (data.announcement) setVideoTitle(data.announcement);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, []);

  // Helper to convert watch / live URL to proper embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/live/')) {
      videoId = url.split('youtube.com/live/')[1]?.split('?')[0] || '';
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
    return url;
  };

  const getDirectYouTubeUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com';
    if (url.includes('/embed/')) {
      const id = url.split('/embed/')[1]?.split('?')[0];
      if (id && id !== 'live_stream') {
        return `https://www.youtube.com/watch?v=${id}`;
      }
    }
    return url;
  };

  const directUrl = getDirectYouTubeUrl(liveUrl);
  const embedUrl = getEmbedUrl(liveUrl);

  return (
    <div className="w-full flex flex-col gap-3 animate-in fade-in h-full overflow-hidden justify-between max-w-md mx-auto py-1">
      
      {/* Stream Info Header Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2.5 shrink-0 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
            isLiveActive 
              ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)] animate-pulse' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isLiveActive ? 'animate-spin' : ''}`} />
            {isLiveActive ? 'LIVE NOW' : 'OFFLINE'}
          </span>
          <h2 className="font-bold text-white text-xs truncate font-mono">{videoTitle}</h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl transition flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
            title="YouTube Live Stream Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <a
            href={directUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase font-mono rounded-xl transition flex items-center gap-1.5 shrink-0 active:scale-95 shadow"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Video Player Container or Offline Placeholder */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {isLiveActive && embedUrl ? (
          /* Active Live Stream Player */
          <div className="w-full aspect-video max-h-[260px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative shrink-0">
            <iframe
              src={embedUrl}
              title="1X Luck YouTube Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          /* Clean Offline View when video is unavailable or stream is offline */
          <div className="w-full aspect-video max-h-[260px] rounded-2xl bg-slate-950 border border-slate-800/80 p-5 flex flex-col items-center justify-center text-center space-y-3 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-red-500 shadow-inner">
              <Tv className="w-6 h-6" />
            </div>

            <div className="space-y-1 max-w-xs">
              <h3 className="text-xs font-black uppercase tracking-wide text-white font-mono flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Stream Currently Offline</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                The official live draw broadcast is not active at this moment.
              </p>
            </div>

            <a
              href={directUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-red-500/40 text-red-400 hover:text-red-300 text-[11px] font-mono font-bold rounded-xl transition flex items-center gap-2 cursor-pointer active:scale-95 shadow"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Watch Previous Streams on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Broadcast Info & Schedule Banner */}
      <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 shrink-0 shadow-md">
        <div className="flex items-center justify-between font-mono text-[11px] border-b border-slate-800/80 pb-2">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Live Draw Schedule</span>
          </span>
          <span className="text-emerald-400 font-black bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30 text-[10px]">
            9:00 PM IST
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          All ticket draws and lucky wheel announcements are broadcast live with on-screen randomizers for 100% fair and verifiable results.
        </p>
      </div>

      {/* YouTube Live Welcome & Info Modal */}
      <YouTubeLiveWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        directUrl={directUrl}
      />

    </div>
  );
};


