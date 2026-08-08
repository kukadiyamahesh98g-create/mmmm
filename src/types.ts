export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  mobileNumber: string;
  city: string;
  coinBalance: number;
  totalTicketsBought: number;
  isBanned: boolean;
  role: 'user' | 'admin';
  createdAt: string;
  isProfileCompleted?: boolean;
}

export interface LuckyDraw {
  id: string;
  title: string;
  drawType?: 'daily' | 'weekly' | 'monthly';
  totalTickets: number;
  soldTickets: number;
  ticketPriceCoins: number;
  prizeAmount: string;
  status: 'active' | 'completed' | 'cancelled';
  winnerTicketNumber?: number;
  winnerUid?: string;
  winnerName?: string;
  winnerMaskedMobile?: string;
  winnerCity?: string;
  drawDate?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  drawId: string;
  drawTitle?: string;
  drawType?: 'daily' | 'weekly' | 'monthly';
  ticketNumber: number;
  userUid: string;
  userName: string;
  userMaskedName?: string;
  userMobile?: string;
  userMobileMasked: string;
  userCity: string;
  purchasedAt: string;
  status?: 'Active' | 'Winner' | 'Closed';
}

export interface Winner {
  id: string;
  drawId: string;
  drawTitle: string;
  ticketNumber: number;
  winnerUid: string;
  winnerName: string;
  winnerMaskedMobile: string;
  winnerCity: string;
  prizeAmount: string;
  drawDate: string;
}

export interface CoinTransaction {
  id: string;
  userUid: string;
  amount: number;
  type: 'daily_reward' | 'ludo_win' | 'ludo_loss' | 'lucky_spin' | 'ticket_purchase' | 'admin_grant' | 'welcome_bonus';
  description: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'draw' | 'winner' | 'reward' | 'live' | 'system';
  createdAt: string;
  targetUserUid?: string;
}

export interface AppSettings {
  youtubeLiveUrl: string;
  isLiveActive: boolean;
  dailySpinLimit: number;
  announcement?: string;
}

export interface DailyRewardStatus {
  lastClaimDate: string | null; // YYYY-MM-DD
  currentStreak: number; // 1 to 7
}
