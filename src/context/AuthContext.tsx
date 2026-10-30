import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserWallet, VipPlan, UserNotification } from '../types';
import { DEFAULT_VIP_PLANS } from '../data/defaultCatalog';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  wallet: UserWallet | null;
  isAdmin: boolean;
  activeVipPlan: VipPlan | null;
  vipDaysRemaining: number;
  unreadNotifsCount: number;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    username: string,
    referralCode?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['rnd92488@gmail.com', 'admin@romansmm.com', 'mianroman@romansmm.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine admin status
  const isAdmin = Boolean(
    currentUser &&
      (ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || '') ||
        userProfile?.role === 'admin')
  );

  // VIP computation
  const activeVipPlan = React.useMemo(() => {
    if (!userProfile?.vipPlanId) return DEFAULT_VIP_PLANS[0]; // Basic
    if (userProfile.vipExpiry) {
      const expDate = new Date(userProfile.vipExpiry);
      if (expDate < new Date()) {
        return DEFAULT_VIP_PLANS[0]; // Expired back to Basic
      }
    }
    return (
      DEFAULT_VIP_PLANS.find((p) => p.id === userProfile.vipPlanId) ||
      DEFAULT_VIP_PLANS[0]
    );
  }, [userProfile]);

  const vipDaysRemaining = React.useMemo(() => {
    if (!userProfile?.vipExpiry || userProfile.vipPlanId === 'vip-basic') return 0;
    const diff = new Date(userProfile.vipExpiry).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [userProfile]);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setWallet(null);
        setUnreadNotifsCount(0);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const walletRef = doc(db, 'wallets', user.uid);

        // Ensure user document exists
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const generatedReferral = 'ROMAN-' + user.uid.substring(0, 6).toUpperCase();
          const isOwnerEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
          const newProfile: UserProfile = {
            uid: user.uid,
            fullName: user.displayName || 'VIP Member',
            username: user.email?.split('@')[0] || 'roman_user',
            email: user.email || '',
            role: isOwnerEmail ? 'admin' : 'user',
            isBlocked: false,
            referralCode: generatedReferral,
            vipPlanId: 'vip-basic',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, newProfile);

          // Create wallet
          const newWallet: UserWallet = {
            userId: user.uid,
            balance: 0,
            totalDeposited: 0,
            totalSpent: 0,
            updatedAt: new Date().toISOString(),
          };
          await setDoc(walletRef, newWallet);

          // Create welcome notification
          const notifRef = doc(collection(db, 'notifications'));
          await setDoc(notifRef, {
            id: notifRef.id,
            userId: user.uid,
            title: 'Welcome to ROMAN SMM PANEL!',
            message: 'Your account is ready. Add funds via JazzCash, Easypaisa, or SadaPay to start boosting your social reach.',
            type: 'success',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Initial user profile bootstrap note:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Realtime user profile & wallet listeners
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubsUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    });

    const walletRef = doc(db, 'wallets', currentUser.uid);
    const unsubsWallet = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) {
        setWallet(snap.data() as UserWallet);
      } else {
        setWallet({
          userId: currentUser.uid,
          balance: 0,
          totalDeposited: 0,
          totalSpent: 0,
        });
      }
    });

    // Unread notifications count
    const notifsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('isRead', '==', false)
    );
    const unsubsNotifs = onSnapshot(notifsQuery, (snap) => {
      setUnreadNotifsCount(snap.size);
    });

    return () => {
      unsubsUser();
      unsubsWallet();
      unsubsNotifs();
    };
  }, [currentUser]);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    username: string,
    referralCode?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    const generatedReferral = 'ROMAN-' + uid.substring(0, 6).toUpperCase();
    const isOwnerEmail = ADMIN_EMAILS.includes(email.toLowerCase());

    const profileData: UserProfile = {
      uid,
      fullName,
      username: username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
      email,
      role: isOwnerEmail ? 'admin' : 'user',
      isBlocked: false,
      referralCode: generatedReferral,
      referredBy: referralCode || undefined,
      vipPlanId: 'vip-basic',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), profileData);
    await setDoc(doc(db, 'wallets', uid), {
      userId: uid,
      balance: 0,
      totalDeposited: 0,
      totalSpent: 0,
      updatedAt: new Date().toISOString(),
    });

    // Welcome Notification
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      id: notifRef.id,
      userId: uid,
      title: 'Welcome to ROMAN SMM PANEL!',
      message: `Welcome ${fullName}! Your social growth journey with ROMAN EMPIRE starts now.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUserData = async () => {
    if (!currentUser) return;
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    if (snap.exists()) setUserProfile(snap.data() as UserProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        wallet,
        isAdmin,
        activeVipPlan,
        vipDaysRemaining,
        unreadNotifsCount,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
