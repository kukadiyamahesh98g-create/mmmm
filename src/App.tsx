import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Mail, Headphones, Info, FileText } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header';
import { NotificationBar } from './components/NotificationBar';
import { HomeScreen } from './components/HomeScreen';
import { ProfileSection } from './components/ProfileSection';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { AnnouncementModal } from './components/AnnouncementModal';
import { LuckyDrawPage } from './pages/LuckyDrawPage';
import { LudoPage } from './pages/LudoPage';
import { SpinWinPage } from './pages/SpinWinPage';
import { LiveBroadcastPage } from './pages/LiveBroadcastPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalDocType>('about');
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  // Automatically show announcement popup on initial visit to Home Page
  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem('1xluck_announcement_seen_v1');
    if (!hasSeenAnnouncement) {
      setAnnouncementModalOpen(true);
    }
  }, []);

  const handleCloseAnnouncement = () => {
    localStorage.setItem('1xluck_announcement_seen_v1', 'true');
    setAnnouncementModalOpen(false);
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const openLegal = (tab: LegalDocType) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const isFullScreenGame = activeTab === 'ludo' || activeTab === 'spin' || activeTab === 'luckydraw' || activeTab === 'live';

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className={`min-h-screen bg-[#050508] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-black relative overflow-hidden ${
          isFullScreenGame ? 'h-screen overflow-hidden pb-0' : 'pb-8'
        }`}>
          
          {/* Atmospheric Background Glows */}
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Sticky Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAuth={handleOpenAuth}
            onToggleNotifs={() => setNotifDrawerOpen(true)}
            onOpenAnnouncement={() => setAnnouncementModalOpen(true)}
          />

          {/* Top Real-Time Notification Bar */}
          <NotificationBar onOpenDrawer={() => setNotifDrawerOpen(true)} />

          {/* Main Content Area */}
          <main className={`flex-1 max-w-7xl w-full mx-auto ${
            isFullScreenGame ? 'px-1 sm:px-4 py-1 overflow-hidden flex flex-col justify-center' : 'px-4 sm:px-6 lg:px-8 py-6'
          }`}>
            {activeTab === 'luckydraw' ? (
              <LuckyDrawPage onBack={() => setActiveTab('home')} onOpenAuth={handleOpenAuth} initialTab="draws" />
            ) : activeTab === 'ludo' ? (
              <LudoPage onBack={() => setActiveTab('home')} onOpenAuth={handleOpenAuth} />
            ) : activeTab === 'spin' ? (
              <SpinWinPage onBack={() => setActiveTab('home')} onOpenAuth={handleOpenAuth} />
            ) : activeTab === 'live' ? (
              <LuckyDrawPage onBack={() => setActiveTab('home')} onOpenAuth={handleOpenAuth} initialTab="stream" />
            ) : activeTab === 'profile' ? (
              <ProfileSection />
            ) : activeTab === 'admin' ? (
              <AdminPanel />
            ) : (
              <HomeScreen 
                setActiveTab={setActiveTab} 
                onOpenAuth={handleOpenAuth}
                onOpenAnnouncement={() => setAnnouncementModalOpen(true)}
              />
            )}
          </main>

          {/* Footer (hidden on full-screen games to prevent vertical scrolling) */}
          {!isFullScreenGame && (
            <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md text-white/60 text-xs py-8 px-4 mt-auto z-10">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Legal Navigation Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-xs font-semibold">
                  <button 
                    onClick={() => openLegal('privacy')}
                    className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5 hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Privacy Policy</span>
                  </button>

                  <span className="text-slate-700 hidden sm:inline">•</span>

                  <button 
                    onClick={() => openLegal('terms')}
                    className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Terms & Conditions</span>
                  </button>

                  <span className="text-slate-700 hidden sm:inline">•</span>

                  <button 
                    onClick={() => openLegal('about')}
                    className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5 hover:underline"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>About Us</span>
                  </button>

                  <span className="text-slate-700 hidden sm:inline">•</span>

                  <button 
                    onClick={() => openLegal('contact')}
                    className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5 hover:underline"
                  >
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contact Us</span>
                  </button>
                </div>

                <div className="text-center space-y-1.5 pt-2 border-t border-slate-900">
                  <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-white/50">© 2026 1X LUCK PLATFORM • TRANSPARENT LUCKY DRAW & COIN REWARDS</p>
                  <p className="text-[10px] text-white/30 font-mono">
                    SYSTEM SECURED & ENCRYPTED • FIREBASE AUTHENTICATION & PDF VERIFICATION
                  </p>
                </div>

              </div>
            </footer>
          )}

          {/* Auth Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialMode={authMode}
          />

          {/* Notification Drawer */}
          <NotificationDrawer
            isOpen={notifDrawerOpen}
            onClose={() => setNotifDrawerOpen(false)}
          />

          {/* Legal Information Modal */}
          <LegalModal
            isOpen={legalModalOpen}
            initialTab={legalTab}
            onClose={() => setLegalModalOpen(false)}
          />

          {/* Announcement Modal */}
          <AnnouncementModal
            isOpen={announcementModalOpen}
            onClose={handleCloseAnnouncement}
            onOpenLegal={openLegal}
          />

        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
