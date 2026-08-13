import React from 'react';
import { X, ShieldCheck, FileText, Info, Headphones, Phone, Mail, ExternalLink, CheckCircle2 } from 'lucide-react';

export type LegalDocType = 'about' | 'privacy' | 'terms' | 'contact';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'about',
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<LegalDocType>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                Legal & Platform Info
              </h2>
              <p className="text-xs text-slate-400">
                1X Luck Official Information & Guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Navigation Tabs + Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Side Navigation for Desktop / Top Bar for Mobile */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-3 md:p-4 flex md:flex-col gap-1.5 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-mono tracking-wide transition shrink-0 ${
                activeTab === 'about'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>About Us</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-mono tracking-wide transition shrink-0 ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-mono tracking-wide transition shrink-0 ${
                activeTab === 'terms'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Terms & Conditions</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold font-mono tracking-wide transition shrink-0 ${
                activeTab === 'contact'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Headphones className="w-4 h-4 shrink-0" />
              <span>Contact Us</span>
            </button>
          </div>

          {/* Document Content View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {activeTab === 'about' && (
              <div className="space-y-4 font-sans text-slate-300 text-sm leading-relaxed">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-amber-400 font-mono font-bold text-base uppercase">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-400" />
                    <span>About 1X Luck</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal font-mono normal-case">
                    Our Platform & Mission
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs text-slate-300">
                  <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                    Welcome to 1X Luck, a platform built to bring simple, fun and fair gaming experiences to everyone. We offer popular games like Ludo and Lucky Spin, where players can earn coins through gameplay. These coins can be used to participate in our Lucky Draw events, with winners announced during our official YouTube Live streams. At 1X Luck, we believe in fair play, transparency, and user safety. Our goal is to create a trusted space where players can enjoy games, compete fairly, and have a little more excitement along the way. If you ever need help or have questions, our team is available through the Contact Us page or the Query section.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      <div className="text-xs font-bold text-white font-mono uppercase">Fair Play</div>
                      <div className="text-[11px] text-slate-400">Simple & transparent gaming</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 mx-auto" />
                      <div className="text-xs font-bold text-white font-mono uppercase">Ludo & Spin</div>
                      <div className="text-[11px] text-slate-400">Earn coins through gameplay</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto" />
                      <div className="text-xs font-bold text-white font-mono uppercase">Live Streams</div>
                      <div className="text-[11px] text-slate-400">Official YouTube Live draws</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4 font-sans text-slate-300 text-sm leading-relaxed">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-amber-400 font-mono font-bold text-base uppercase">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>Privacy Policy</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal font-mono normal-case">
                    Official Policy
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs text-slate-300">
                  <p className="text-sm text-white font-medium leading-relaxed">
                    Welcome to 1X Luck. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
                  </p>

                  <ol className="list-none space-y-3 pt-1">
                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">1. Information We Collect</strong>
                      <p>
                        We may collect full name, mobile number, account information, game progress, coin balance, lucky draw ticket information, queries, support requests, and device information such as browser type and IP address.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">2. How We Use Your Information</strong>
                      <p>
                        We use your information to create and manage your account, save your game progress and coin balance, process lucky draw participation, contact lucky draw winners, respond to support requests, improve website performance and user experience, and prevent fraud or misuse.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">3. Ludo, Lucky Spin and Lucky Draw</strong>
                      <p>
                        Players can earn coins by playing Ludo and using the Lucky Spin feature. These coins can be used to obtain Lucky Draw tickets according to the rules of each event. Lucky Draw winners are announced during our official YouTube Live broadcasts, and prize details, event schedules, and winner announcements are published before each event.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">4. Cookies</strong>
                      <p>
                        We may use cookies and similar technologies to improve website performance, remember preferences, and enhance user experience.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">5. Data Security</strong>
                      <p>
                        We use reasonable security measures to protect your personal information, but no online platform can guarantee 100% security.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">6. Third-Party Services</strong>
                      <p>
                        Our website may use trusted third-party services such as Google AdSense, Firebase, and YouTube, each with its own privacy policies and terms.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">7. Contact Us</strong>
                      <p>
                        If you have any questions about this Privacy Policy, please contact us through the Contact Us page or submit your request through the Query section.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">8. Changes to This Privacy Policy</strong>
                      <p>
                        We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised date.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <strong className="text-amber-300 font-mono text-xs uppercase block">9. Your Consent</strong>
                      <p className="text-slate-200">
                        By using 1X Luck, you agree to this Privacy Policy and our Terms & Conditions.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4 font-sans text-slate-300 text-sm leading-relaxed">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-amber-400 font-mono font-bold text-base uppercase">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>Terms & Conditions</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal font-mono normal-case">
                    Official Terms
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs text-slate-300">
                  <p className="text-sm text-white font-medium leading-relaxed">
                    Welcome to 1X Luck. By accessing or using our website and services, you agree to comply with these Terms & Conditions. If you do not agree, please do not use our website.
                  </p>

                  <ol className="list-none space-y-3 pt-1">
                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">1. User Account</strong>
                      <p>
                        Users must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account and login credentials.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">2. Games and Coins</strong>
                      <p>
                        Players can earn coins by participating in games such as Ludo and Lucky Spin. Coins are virtual rewards within the platform and have no cash value unless specifically stated by an official event.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">3. Lucky Draw</strong>
                      <p>
                        Coins may be used to purchase Lucky Draw as per event rules. Winners are announced during official YouTube Live streams.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">4. YouTube Live Streams</strong>
                      <p>
                        Live streams are used to announce winners, share prize information, and provide updates.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">5. User Conduct</strong>
                      <p>
                        Users must use the platform fairly and respectfully. Cheating, hacking, or attempting to manipulate games is strictly prohibited.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">6. Payments and Prizes</strong>
                      <p>
                        If applicable, prize details and distribution methods will be communicated clearly. All prizes are subject to the rules of each event.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">7. Privacy</strong>
                      <p>
                        We collect minimal personal information to operate accounts and provide services.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 font-mono text-xs uppercase block">8. Changes to Terms</strong>
                      <p>
                        We may update these terms from time to time. Continued use of 1X Luck means you accept those changes. If you have any questions, reach us through the Contact Us page or the Query section.
                      </p>
                    </li>

                    <li className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <strong className="text-amber-300 font-mono text-xs uppercase block">Agreement</strong>
                      <p className="text-slate-200">
                        By using this website, you agree to these Terms & Conditions and our Privacy Policy.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4 font-sans text-slate-300 text-sm leading-relaxed">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-mono font-bold text-base uppercase">
                  <Headphones className="w-5 h-5 text-amber-400" />
                  <span>Contact Support</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <p className="text-xs text-slate-300">
                    If you have any questions, suggestions, or need support, please feel free to contact us. We aim to respond to all inquiries as soon as possible. Thank you for contacting 1X Luck. We value your feedback and are always happy to assist you.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <a 
                      href="tel:+919898874347" 
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition text-left space-y-2 group"
                    >
                      <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                        <Phone className="w-4 h-4 text-amber-400" />
                        <span>Phone Support</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-500 group-hover:text-amber-400" />
                      </div>
                      <div className="text-white font-mono text-sm font-semibold">
                        +91 98988 74347
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Direct Phone Call / Support
                      </div>
                    </a>

                    <a 
                      href="mailto:kukadiyamahesh07@gmail.com" 
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition text-left space-y-2 group"
                    >
                      <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <span>Email Support</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-500 group-hover:text-amber-400" />
                      </div>
                      <div className="text-white font-mono text-xs font-semibold truncate">
                        kukadiyamahesh07@gmail.com
                      </div>
                      <div className="text-[11px] text-slate-400">
                        24/7 Email Inquiries & Help
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">© 2026 1X LUCK PLATFORM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-mono text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
