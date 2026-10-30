import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  ServiceCategory,
  SmmService,
  VipPlan,
  PromoCode,
  SystemConfig,
  DepositRequest,
  SmmOrder,
  UserProfile,
  SupportTicket,
  WalletTransaction,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SERVICES,
  DEFAULT_VIP_PLANS,
  DEFAULT_PROMOS,
  DEFAULT_CONFIG,
} from '../data/defaultCatalog';

interface DataContextType {
  categories: ServiceCategory[];
  services: SmmService[];
  vipPlans: VipPlan[];
  promoCodes: PromoCode[];
  systemConfig: SystemConfig;
  loadingData: boolean;

  // Order & Financial operations
  placeOrder: (params: {
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
  }) => Promise<{ success: boolean; orderId?: string; error?: string }>;

  submitDeposit: (params: {
    userId: string;
    userEmail: string;
    username: string;
    paymentMethod: 'JazzCash' | 'Easypaisa' | 'SadaPay';
    accountNumber: string;
    amount: number;
    transactionId: string;
    screenshotUrl?: string;
  }) => Promise<{ success: boolean; depositId?: string; error?: string }>;

  purchaseVipMembership: (
    userId: string,
    planId: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Admin Operations
  approveDeposit: (
    deposit: DepositRequest,
    adminNotes?: string
  ) => Promise<{ success: boolean; error?: string }>;

  rejectDeposit: (
    depositId: string,
    userId: string,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;

  updateOrderStatus: (
    order: SmmOrder,
    newStatus: SmmOrder['status'],
    adminNotes?: string
  ) => Promise<{ success: boolean; error?: string }>;

  adjustUserWallet: (
    userId: string,
    amount: number, // positive to credit, negative to debit
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;

  blockUserToggle: (
    userId: string,
    blocked: boolean
  ) => Promise<{ success: boolean; error?: string }>;

  saveService: (service: SmmService) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  saveCategory: (category: ServiceCategory) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  savePromoCode: (promo: PromoCode) => Promise<void>;
  deletePromoCode: (promoId: string) => Promise<void>;
  saveVipPlan: (plan: VipPlan) => Promise<void>;
  updateConfig: (config: Partial<SystemConfig>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_CATEGORIES);
  const [services, setServices] = useState<SmmService[]>(DEFAULT_SERVICES);
  const [vipPlans, setVipPlans] = useState<VipPlan[]>(DEFAULT_VIP_PLANS);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(DEFAULT_PROMOS);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Initialize and listen to Firestore collections
  useEffect(() => {
    let unsubsCategories: () => void = () => {};
    let unsubsServices: () => void = () => {};
    let unsubsVip: () => void = () => {};
    let unsubsPromo: () => void = () => {};
    let unsubsSettings: () => void = () => {};

    const initializeData = async () => {
      try {
        // 1. Settings
        unsubsSettings = onSnapshot(doc(db, 'settings', 'config'), async (snap) => {
          if (snap.exists()) {
            setSystemConfig(snap.data() as SystemConfig);
          } else {
            await setDoc(doc(db, 'settings', 'config'), DEFAULT_CONFIG);
          }
        });

        // 2. Categories
        unsubsCategories = onSnapshot(collection(db, 'categories'), async (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => d.data() as ServiceCategory);
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(list);
          } else {
            // Seed initial categories
            for (const cat of DEFAULT_CATEGORIES) {
              await setDoc(doc(db, 'categories', cat.id), cat);
            }
          }
        });

        // 3. Services
        unsubsServices = onSnapshot(collection(db, 'services'), async (snap) => {
          if (!snap.empty) {
            setServices(snap.docs.map((d) => d.data() as SmmService));
          } else {
            // Seed initial services
            for (const srv of DEFAULT_SERVICES) {
              await setDoc(doc(db, 'services', srv.id), srv);
            }
          }
        });

        // 4. VIP Plans
        unsubsVip = onSnapshot(collection(db, 'vip_plans'), async (snap) => {
          if (!snap.empty) {
            setVipPlans(snap.docs.map((d) => d.data() as VipPlan));
          } else {
            for (const vp of DEFAULT_VIP_PLANS) {
              await setDoc(doc(db, 'vip_plans', vp.id), vp);
            }
          }
        });

        // 5. Promo Codes
        unsubsPromo = onSnapshot(collection(db, 'promo_codes'), async (snap) => {
          if (!snap.empty) {
            setPromoCodes(snap.docs.map((d) => d.data() as PromoCode));
          } else {
            for (const pr of DEFAULT_PROMOS) {
              await setDoc(doc(db, 'promo_codes', pr.id), pr);
            }
          }
        });
      } catch (err) {
        console.warn('Firestore initial data bootstrap notice:', err);
      } finally {
        setLoadingData(false);
      }
    };

    initializeData();

    return () => {
      unsubsCategories();
      unsubsServices();
      unsubsVip();
      unsubsPromo();
      unsubsSettings();
    };
  }, []);

  // Place order with atomic wallet deduction
  const placeOrder = async (params: {
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
  }): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
      const walletRef = doc(db, 'wallets', params.userId);
      const orderRef = doc(db, 'orders', orderId);
      const txRef = doc(collection(db, 'wallet_transactions'));

      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        if (!walletSnap.exists()) {
          throw new Error('Wallet not found. Please refresh or contact support.');
        }

        const walletData = walletSnap.data();
        const currentBalance = Number(walletData.balance || 0);

        if (currentBalance < params.finalPrice) {
          throw new Error(`Insufficient wallet balance. Required: Rs. ${params.finalPrice}, Available: Rs. ${currentBalance}`);
        }

        const newBalance = Math.round((currentBalance - params.finalPrice) * 100) / 100;
        const totalSpent = Number(walletData.totalSpent || 0) + params.finalPrice;

        // 1. Update wallet
        transaction.update(walletRef, {
          balance: newBalance,
          totalSpent: totalSpent,
          updatedAt: new Date().toISOString(),
        });

        // 2. Create order
        const newOrder: SmmOrder = {
          id: orderId,
          userId: params.userId,
          username: params.username,
          categoryId: params.categoryId,
          categoryName: params.categoryName,
          serviceId: params.serviceId,
          serviceName: params.serviceName,
          targetLink: params.targetLink,
          quantity: params.quantity,
          pricePer1000: params.pricePer1000,
          originalPrice: params.originalPrice,
          vipDiscount: params.vipDiscount,
          promoDiscount: params.promoDiscount,
          finalPrice: params.finalPrice,
          promoCode: params.promoCode || undefined,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        transaction.set(orderRef, newOrder);

        // 3. Record transaction
        const txRecord: WalletTransaction = {
          id: txRef.id,
          userId: params.userId,
          type: 'order_deduction',
          amount: params.finalPrice,
          previousBalance: currentBalance,
          newBalance: newBalance,
          referenceId: orderId,
          description: `Order #${orderId} - ${params.serviceName} (${params.quantity})`,
          createdAt: new Date().toISOString(),
        };
        transaction.set(txRef, txRecord);
      });

      // User notification
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: params.userId,
        title: 'Order Placed Successfully',
        message: `Your order #${orderId} for ${params.serviceName} is now pending manual admin processing.`,
        type: 'order',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { success: true, orderId };
    } catch (err: any) {
      console.error('placeOrder error:', err);
      return { success: false, error: err.message || 'Failed to place order' };
    }
  };

  // Submit manual deposit request
  const submitDeposit = async (params: {
    userId: string;
    userEmail: string;
    username: string;
    paymentMethod: 'JazzCash' | 'Easypaisa' | 'SadaPay';
    accountNumber: string;
    amount: number;
    transactionId: string;
    screenshotUrl?: string;
  }): Promise<{ success: boolean; depositId?: string; error?: string }> => {
    try {
      // Check duplicate TID
      const dupQuery = query(
        collection(db, 'deposits'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(dupQuery);
      const isDuplicate = snap.docs.some(
        (d) => d.data().transactionId?.trim().toLowerCase() === params.transactionId.trim().toLowerCase()
      );

      if (isDuplicate) {
        return {
          success: false,
          error: 'This Transaction ID (TID) has already been submitted. Please check your TID or contact support.',
        };
      }

      const depId = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
      const depRef = doc(db, 'deposits', depId);

      const depositData: DepositRequest = {
        id: depId,
        userId: params.userId,
        userEmail: params.userEmail,
        username: params.username,
        paymentMethod: params.paymentMethod,
        accountNumber: params.accountNumber,
        amount: params.amount,
        transactionId: params.transactionId.trim(),
        screenshotUrl: params.screenshotUrl || undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await setDoc(depRef, depositData);

      // Notification
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: params.userId,
        title: 'Deposit Request Submitted',
        message: `Your deposit of Rs. ${params.amount} via ${params.paymentMethod} (TID: ${params.transactionId}) is waiting for admin verification.`,
        type: 'deposit',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { success: true, depositId: depId };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit deposit' };
    }
  };

  // Purchase VIP membership
  const purchaseVipMembership = async (
    userId: string,
    planId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const plan = vipPlans.find((p) => p.id === planId);
      if (!plan) return { success: false, error: 'VIP Plan not found.' };

      if (plan.price <= 0) {
        // Free basic
        await updateDoc(doc(db, 'users', userId), {
          vipPlanId: plan.id,
          vipExpiry: null,
          updatedAt: new Date().toISOString(),
        });
        return { success: true };
      }

      const walletRef = doc(db, 'wallets', userId);
      const userRef = doc(db, 'users', userId);
      const txRef = doc(collection(db, 'wallet_transactions'));

      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        if (!walletSnap.exists()) throw new Error('Wallet not found');

        const currentBalance = Number(walletSnap.data().balance || 0);
        if (currentBalance < plan.price) {
          throw new Error(`Insufficient balance for ${plan.name}. Required: Rs. ${plan.price}, Available: Rs. ${currentBalance}`);
        }

        const newBalance = Math.round((currentBalance - plan.price) * 100) / 100;
        const totalSpent = Number(walletSnap.data().totalSpent || 0) + plan.price;

        // 1. Update wallet
        transaction.update(walletRef, {
          balance: newBalance,
          totalSpent: totalSpent,
          updatedAt: new Date().toISOString(),
        });

        // 2. Calculate expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.durationDays || 30));

        // 3. Update User VIP
        transaction.update(userRef, {
          vipPlanId: plan.id,
          vipExpiry: expiryDate.toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // 4. Record transaction
        const txRecord: WalletTransaction = {
          id: txRef.id,
          userId: userId,
          type: 'vip_purchase',
          amount: plan.price,
          previousBalance: currentBalance,
          newBalance: newBalance,
          referenceId: plan.id,
          description: `VIP Membership: ${plan.name} (${plan.discountPercentage}% Discount Active)`,
          createdAt: new Date().toISOString(),
        };
        transaction.set(txRef, txRecord);
      });

      // User notification
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: userId,
        title: `VIP Upgraded: ${plan.name}`,
        message: `Congratulations! Your ${plan.name} is now active with ${plan.discountPercentage}% automatic discount on all orders.`,
        type: 'vip',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'VIP purchase failed' };
    }
  };

  // ADMIN: Approve Deposit with exactly-once wallet credit
  const approveDeposit = async (
    deposit: DepositRequest,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (deposit.status === 'approved') {
        return { success: false, error: 'Deposit is already approved.' };
      }

      const depRef = doc(db, 'deposits', deposit.id);
      const walletRef = doc(db, 'wallets', deposit.userId);
      const txRef = doc(collection(db, 'wallet_transactions'));

      await runTransaction(db, async (transaction) => {
        const depSnap = await transaction.get(depRef);
        if (!depSnap.exists()) throw new Error('Deposit record not found');
        if (depSnap.data().status === 'approved') throw new Error('Already approved');

        const walletSnap = await transaction.get(walletRef);
        let currentBalance = 0;
        let totalDeposited = 0;

        if (walletSnap.exists()) {
          currentBalance = Number(walletSnap.data().balance || 0);
          totalDeposited = Number(walletSnap.data().totalDeposited || 0);
        }

        const newBalance = Math.round((currentBalance + deposit.amount) * 100) / 100;
        const newTotalDeposited = Math.round((totalDeposited + deposit.amount) * 100) / 100;

        // 1. Update deposit status
        transaction.update(depRef, {
          status: 'approved',
          adminNotes: adminNotes || 'Verified by Admin',
          verifiedAt: new Date().toISOString(),
        });

        // 2. Credit wallet
        transaction.set(
          walletRef,
          {
            userId: deposit.userId,
            balance: newBalance,
            totalDeposited: newTotalDeposited,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 3. Ledger transaction
        const txRecord: WalletTransaction = {
          id: txRef.id,
          userId: deposit.userId,
          type: 'deposit_credit',
          amount: deposit.amount,
          previousBalance: currentBalance,
          newBalance: newBalance,
          referenceId: deposit.id,
          description: `Deposit Approved via ${deposit.paymentMethod} (TID: ${deposit.transactionId})`,
          createdAt: new Date().toISOString(),
        };
        transaction.set(txRef, txRecord);
      });

      // Notify user
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: deposit.userId,
        title: 'Deposit Approved & Credited!',
        message: `Your deposit of Rs. ${deposit.amount} has been verified and added to your wallet balance.`,
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to approve deposit' };
    }
  };

  // ADMIN: Reject Deposit
  const rejectDeposit = async (
    depositId: string,
    userId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'rejected',
        adminNotes: reason,
        verifiedAt: new Date().toISOString(),
      });

      // Notify user
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: userId,
        title: 'Deposit Request Rejected',
        message: `Your deposit request #${depositId} was rejected. Reason: ${reason}`,
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reject deposit' };
    }
  };

  // ADMIN: Update order status (with auto-refund on cancel)
  const updateOrderStatus = async (
    order: SmmOrder,
    newStatus: SmmOrder['status'],
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (order.status === newStatus) return { success: true };

      // If cancelling and not previously refunded, refund money to user wallet
      if ((newStatus === 'cancelled' || newStatus === 'refunded') && order.status !== 'cancelled' && order.status !== 'refunded') {
        const walletRef = doc(db, 'wallets', order.userId);
        const orderRef = doc(db, 'orders', order.id);
        const txRef = doc(collection(db, 'wallet_transactions'));

        await runTransaction(db, async (transaction) => {
          const walletSnap = await transaction.get(walletRef);
          const currentBalance = walletSnap.exists() ? Number(walletSnap.data().balance || 0) : 0;
          const newBalance = Math.round((currentBalance + order.finalPrice) * 100) / 100;

          // 1. Update order status
          transaction.update(orderRef, {
            status: newStatus,
            adminNotes: adminNotes || 'Order cancelled by Admin and refunded.',
            updatedAt: new Date().toISOString(),
          });

          // 2. Refund wallet
          transaction.set(
            walletRef,
            {
              userId: order.userId,
              balance: newBalance,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          // 3. Ledger
          const txRecord: WalletTransaction = {
            id: txRef.id,
            userId: order.userId,
            type: 'order_refund',
            amount: order.finalPrice,
            previousBalance: currentBalance,
            newBalance: newBalance,
            referenceId: order.id,
            description: `Refund for Cancelled Order #${order.id}`,
            createdAt: new Date().toISOString(),
          };
          transaction.set(txRef, txRecord);
        });

        // Notify user of refund
        const notifRef = doc(collection(db, 'notifications'));
        await setDoc(notifRef, {
          id: notifRef.id,
          userId: order.userId,
          title: `Order #${order.id} Cancelled & Refunded`,
          message: `Your order was marked as ${newStatus}. Rs. ${order.finalPrice} has been refunded to your wallet. Note: ${adminNotes || 'Admin update'}`,
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Simple status update
        await updateDoc(doc(db, 'orders', order.id), {
          status: newStatus,
          adminNotes: adminNotes || order.adminNotes || '',
          updatedAt: new Date().toISOString(),
        });

        // Notify user of status update
        const notifRef = doc(collection(db, 'notifications'));
        await setDoc(notifRef, {
          id: notifRef.id,
          userId: order.userId,
          title: `Order #${order.id} Status: ${newStatus.toUpperCase()}`,
          message: `Your order for ${order.serviceName} is now ${newStatus}.`,
          type: 'order',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update order status' };
    }
  };

  // ADMIN: Adjust user wallet balance with reason
  const adjustUserWallet = async (
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const txRef = doc(collection(db, 'wallet_transactions'));

      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        const currentBalance = walletSnap.exists() ? Number(walletSnap.data().balance || 0) : 0;
        const newBalance = Math.round((currentBalance + amount) * 100) / 100;

        if (newBalance < 0) {
          throw new Error(`Cannot adjust wallet: balance would become negative (Rs. ${newBalance})`);
        }

        transaction.set(
          walletRef,
          {
            userId: userId,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        const txRecord: WalletTransaction = {
          id: txRef.id,
          userId: userId,
          type: 'admin_adjustment',
          amount: Math.abs(amount),
          previousBalance: currentBalance,
          newBalance: newBalance,
          description: `Admin Adjustment: ${reason} (${amount >= 0 ? '+' : '-'}Rs. ${Math.abs(amount)})`,
          createdAt: new Date().toISOString(),
        };
        transaction.set(txRef, txRecord);
      });

      // Notify user
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: userId,
        title: 'Wallet Balance Adjusted',
        message: `Admin adjusted your wallet by ${amount >= 0 ? '+' : ''}Rs. ${amount}. Reason: ${reason}`,
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to adjust wallet' };
    }
  };

  // ADMIN: Block / Unblock user
  const blockUserToggle = async (
    userId: string,
    blocked: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBlocked: blocked,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Service & Category CRUD
  const saveService = async (service: SmmService) => {
    await setDoc(doc(db, 'services', service.id), service);
  };

  const deleteService = async (serviceId: string) => {
    await deleteDoc(doc(db, 'services', serviceId));
  };

  const saveCategory = async (category: ServiceCategory) => {
    await setDoc(doc(db, 'categories', category.id), category);
  };

  const deleteCategory = async (categoryId: string) => {
    await deleteDoc(doc(db, 'categories', categoryId));
  };

  const savePromoCode = async (promo: PromoCode) => {
    await setDoc(doc(db, 'promo_codes', promo.id), promo);
  };

  const deletePromoCode = async (promoId: string) => {
    await deleteDoc(doc(db, 'promo_codes', promoId));
  };

  const saveVipPlan = async (plan: VipPlan) => {
    await setDoc(doc(db, 'vip_plans', plan.id), plan);
  };

  const updateConfig = async (newConfig: Partial<SystemConfig>) => {
    await updateDoc(doc(db, 'settings', 'config'), {
      ...newConfig,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        services,
        vipPlans,
        promoCodes,
        systemConfig,
        loadingData,
        placeOrder,
        submitDeposit,
        purchaseVipMembership,
        approveDeposit,
        rejectDeposit,
        updateOrderStatus,
        adjustUserWallet,
        blockUserToggle,
        saveService,
        deleteService,
        saveCategory,
        deleteCategory,
        savePromoCode,
        deletePromoCode,
        saveVipPlan,
        updateConfig,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
