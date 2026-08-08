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
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-mono font-bold text-base uppercase">
                  <Info className="w-5 h-5 text-amber-400" />
                  <span>About 1X Luck</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <p className="font-semibold text-white text-base">
                    Welcome to 1X Luck.
                  </p>
                  <p>
                    1X Luck is an online rewards and entertainment platform where users can enjoy skill-based games, earn virtual coins, and participate in lucky draw events according to the platform rules.
                  </p>
                  <p>
                    Our mission is to provide a secure, transparent, and enjoyable experience for every user. We are committed to fairness, user privacy, and continuous improvement of our platform. Our goal is to create a fun and trusted platform where users can play games, earn rewards, and enjoy a smooth user experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                    <div className="text-xs font-bold text-white font-mono uppercase">Transparent Draws</div>
                    <div className="text-[11px] text-slate-400">PDF spreadsheets & verification</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-xs font-bold text-white font-mono uppercase">Skill Games</div>
                    <div className="text-[11px] text-slate-400">Ludo, Spin & Win, Lucky Draw</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto" />
                    <div className="text-xs font-bold text-white font-mono uppercase">Secure Platform</div>
                    <div className="text-[11px] text-slate-400">Firebase Encrypted Auth</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4 font-sans text-slate-300 text-sm leading-relaxed">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-mono font-bold text-base uppercase">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Privacy Policy</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <p>
                    Your privacy is important to us. This website is committed to protecting your personal information. We may collect basic information such as your name, mobile number, email address, IP address, and device information when you use our services.
                  </p>
                  <p>
                    We use this information to create and manage your account, improve our services, send important notifications, prevent fraud, and ensure platform security. We may use cookies and similar technologies to enhance your browsing experience.
                  </p>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>We do not sell your personal information to third parties.</span>
                  </div>
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
                    Last Updated: July 29, 2026
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <p className="text-xs text-slate-300">
                    Welcome to 1X Luck. By accessing or using our website, you agree to comply with these terms. If you do not agree, please do not use our services.
                  </p>

                  <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300">
                    <li className="pl-1">
                      <strong className="text-white">User Eligibility:</strong> You must be at least 18 years old or meet the minimum legal age in your jurisdiction to use this website.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">User Account:</strong> You are responsible for keeping your account information secure and must provide accurate and up-to-date information during registration.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Virtual Coins:</strong> The coins earned or used on this platform are virtual and intended only for use within the platform. They have no cash value unless explicitly stated by 1X Luck.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Lucky Draw and Rewards:</strong> Participation in Lucky Draw events is subject to the rules displayed on the platform. Winners are selected according to the published rules. 1X Luck reserves the right to verify user eligibility before issuing any reward.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Fair Use Policy:</strong> Any attempt to cheat, exploit bugs, use automated tools, create multiple accounts, or engage in fraudulent activity may result in account suspension or permanent termination.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Advertisements:</strong> Our platform may display advertisements from third-party advertising partners, including Google AdSense. We are not responsible for the content or policies of third-party ads.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Privacy:</strong> Your use of this website is also governed by our Privacy Policy.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Changes to Services:</strong> 1X Luck reserves the right to modify, suspend, or discontinue any feature, game, reward, or service at any time without prior notice.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Limitation of Liability:</strong> 1X Luck shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Governing Law:</strong> These Terms and Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the appropriate courts in India.
                    </li>
                    <li className="pl-1">
                      <strong className="text-white">Contact Us:</strong> If you have any questions regarding these Terms and Conditions, contact us at Email: <a href="mailto:kukadiyamahesh07@gmail.com" className="text-amber-400 hover:underline">kukadiyamahesh07@gmail.com</a>, Phone: <a href="tel:+919898874347" className="text-amber-400 hover:underline">+91 98988 74347</a>.
                    </li>
                  </ol>

                  <p className="font-semibold text-emerald-400 text-xs pt-2 border-t border-slate-800">
                    By using 1X Luck, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
                  </p>
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
