export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
  referralCode?: string;
  referredBy?: string;
  vipPlanId?: string;
  vipExpiry?: string; // ISO date string
  createdAt: string;
  updatedAt?: string;
}

export interface UserWallet {
  userId: string;
  balance: number; // In PKR
  totalDeposited: number;
  totalSpent: number;
  updatedAt?: string;
}

export type TransactionType =
  | 'deposit_credit'
  | 'order_deduction'
  | 'order_refund'
  | 'vip_purchase'
  | 'referral_reward'
  | 'admin_adjustment';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  previousBalance: number;
  newBalance: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export type PaymentMethod = 'JazzCash' | 'Easypaisa' | 'SadaPay';

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  amount: number; // in PKR
  transactionId: string;
  screenshotUrl?: string;
  status: DepositStatus;
  adminNotes?: string;
  createdAt: string;
  verifiedAt?: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'in_progress'
  | 'completed'
  | 'partial'
  | 'cancelled'
  | 'refunded';

export interface SmmOrder {
  id: string;
  userId: string;
  username: string;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  targetLink: string;
  quantity: number;
  pricePer1000: number;
  originalPrice: number;
  vipDiscount: number;
  promoDiscount: number;
  finalPrice: number;
  promoCode?: string;
  status: OrderStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface SmmService {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  pricePer1000: number; // in PKR
  minQuantity: number;
  maxQuantity: number;
  estimatedTime: string;
  isActive: boolean;
  linkType: 'video' | 'profile' | 'channel' | 'general';
}

export interface VipPlan {
  id: string;
  name: string;
  price: number; // in PKR per month
  durationDays: number;
  discountPercentage: number;
  benefits: string[];
  badgeColor: string;
  isActive: boolean;
  isPopular?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface SupportMessage {
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'order' | 'deposit' | 'vip';
  isRead: boolean;
  createdAt: string;
}

export interface SystemConfig {
  siteName: string;
  brandName: string;
  tagline: string;
  announcement: string;
  whatsappUrl: string;
  paymentJazzCash: string;
  paymentEasypaisa: string;
  paymentSadaPay: string;
  accountHolder: string;
  maintenanceMode: boolean;
  currency: string;
}
