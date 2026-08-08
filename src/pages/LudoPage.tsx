import React from 'react';
import { LudoSection } from '../components/LudoSection';

interface LudoPageProps {
  onBack: () => void;
  onOpenAuth: () => void;
}

export const LudoPage: React.FC<LudoPageProps> = ({ onBack, onOpenAuth }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-screen overflow-hidden animate-in fade-in duration-300 w-full max-w-md mx-auto px-2 py-1 select-none items-center justify-center">
      {/* Main Single-Screen Game Section Container */}
      <div className="w-full flex-1 flex flex-col justify-center items-center overflow-hidden py-1">
        <LudoSection onOpenAuth={onOpenAuth} onBack={onBack} />
      </div>
    </div>
  );
};


