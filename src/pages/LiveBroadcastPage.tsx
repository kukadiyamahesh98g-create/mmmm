import React from 'react';
import { LuckyDrawPage } from './LuckyDrawPage';

interface LiveBroadcastPageProps {
  onBack: () => void;
  onOpenAuth: () => void;
}

export const LiveBroadcastPage: React.FC<LiveBroadcastPageProps> = ({ onBack, onOpenAuth }) => {
  return <LuckyDrawPage onBack={onBack} onOpenAuth={onOpenAuth} initialTab="stream" />;
};

