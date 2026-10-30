import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { testConnection } from './firebase/config';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { UserSidebar } from './components/layout/UserSidebar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AuthModal } from './components/auth/AuthModal';

// User pages
import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { NewOrder } from './pages/user/NewOrder';
import { ServicesPage } from './pages/user/ServicesPage';
import { AddFunds } from './pages/user/AddFunds';
import { WalletPage } from './pages/user/WalletPage';
import { OrderHistory } from './pages/user/OrderHistory';
import { DepositHistory } from './pages/user/DepositHistory';
import { VipMembership } from './pages/user/VipMembership';
import { PromoCodesPage } from './pages/user/PromoCodesPage';
import { ReferEarn } from './pages/user/ReferEarn';
import { SupportTickets } from './pages/user/SupportTickets';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { ProfileSettings } from './pages/user/ProfileSettings';

// Admin pages
import { AdminAuthGate } from './pages/admin/AdminAuthGate';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDeposits } from './pages/admin/AdminDeposits';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminVipPlans } from './pages/admin/AdminVipPlans';
import { AdminPromoCodes } from './pages/admin/AdminPromoCodes';
import { AdminReferrals } from './pages/admin/AdminReferrals';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const { systemConfig } = useData();

  // Route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [referralCodeParam, setReferralCodeParam] = useState<string>('');

  // Initial connection test and URL params check
  useEffect(() => {
    testConnection();

    // Check for referral code in search params
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCodeParam(ref);
      if (!currentUser) {
        setAuthModalMode('register');
        setAuthModalOpen(true);
      }
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const isAdminRoute = currentRoute.startsWith('/admin');
  const isDashboardRoute =
    currentRoute.startsWith('/dashboard') ||
    currentRoute === '/new-order' ||
    currentRoute === '/add-funds' ||
    currentRoute === '/wallet' ||
    currentRoute === '/orders' ||
    currentRoute === '/deposits' ||
    currentRoute === '/refer' ||
    currentRoute === '/promo-codes' ||
    currentRoute === '/notifications' ||
    currentRoute === '/support' ||
    currentRoute === '/profile';

  // Guard: if user is not logged in and visits user route, open login modal
  useEffect(() => {
    if (!loading && !currentUser && isDashboardRoute) {
      openAuth('login');
    }
  }, [loading, currentUser, isDashboardRoute]);

  // Render current view
  const renderView = () => {
    // Admin routes
    if (isAdminRoute) {
      return (
        <AdminAuthGate navigate={navigate}>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {currentRoute === '/admin' || currentRoute === '/admin/dashboard' ? (
              <AdminDashboard navigate={navigate} />
            ) : currentRoute === '/admin/users' ? (
              <AdminUsers navigate={navigate} />
            ) : currentRoute === '/admin/orders' ? (
              <AdminOrders navigate={navigate} />
            ) : currentRoute === '/admin/deposits' ? (
              <AdminDeposits navigate={navigate} />
            ) : currentRoute === '/admin/services' ? (
              <AdminServices navigate={navigate} />
            ) : currentRoute === '/admin/vip' ? (
              <AdminVipPlans navigate={navigate} />
            ) : currentRoute === '/admin/promo-codes' ? (
              <AdminPromoCodes navigate={navigate} />
            ) : currentRoute === '/admin/referrals' || currentRoute === '/admin/rewards' ? (
              <AdminReferrals navigate={navigate} />
            ) : currentRoute === '/admin/support' ? (
              <AdminSupport navigate={navigate} />
            ) : currentRoute === '/admin/reports' ? (
              <AdminReports navigate={navigate} />
            ) : currentRoute === '/admin/settings' ? (
              <AdminSettings navigate={navigate} />
            ) : (
              <AdminDashboard navigate={navigate} />
            )}
          </div>
        </AdminAuthGate>
      );
    }

    // User dashboard internal routes
    if (currentUser && isDashboardRoute) {
      return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentRoute === '/dashboard' ? (
            <UserDashboard navigate={navigate} />
          ) : currentRoute === '/new-order' ? (
            <NewOrder navigate={navigate} />
          ) : currentRoute === '/add-funds' ? (
            <AddFunds navigate={navigate} />
          ) : currentRoute === '/wallet' ? (
            <WalletPage navigate={navigate} />
          ) : currentRoute === '/orders' ? (
            <OrderHistory navigate={navigate} />
          ) : currentRoute === '/deposits' ? (
            <DepositHistory navigate={navigate} />
          ) : currentRoute === '/refer' ? (
            <ReferEarn navigate={navigate} />
          ) : currentRoute === '/promo-codes' ? (
            <PromoCodesPage navigate={navigate} />
          ) : currentRoute === '/notifications' ? (
            <NotificationsPage navigate={navigate} />
          ) : currentRoute === '/support' ? (
            <SupportTickets navigate={navigate} />
          ) : currentRoute === '/profile' ? (
            <ProfileSettings navigate={navigate} />
          ) : (
            <UserDashboard navigate={navigate} />
          )}
        </div>
      );
    }

    // Public / Shared Routes
    if (currentRoute === '/services') {
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ServicesPage navigate={navigate} />
        </div>
      );
    }

    if (currentRoute === '/membership' || currentRoute === '/vip') {
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <VipMembership navigate={navigate} />
        </div>
      );
    }

    // Default Landing Page
    return <LandingPage navigate={navigate} openAuth={openAuth} />;
  };

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar currentRoute={currentRoute} navigate={navigate} openAuth={openAuth} />

      {/* Main Content Layout */}
      <div className="flex-1 flex">
        {/* Sidebar for Admin */}
        {isAdminRoute && (
          <div className="hidden lg:block">
            <AdminSidebar currentRoute={currentRoute} navigate={navigate} />
          </div>
        )}

        {/* Sidebar for Authenticated Users inside dashboard */}
        {currentUser && isDashboardRoute && (
          <div className="hidden lg:block">
            <UserSidebar currentRoute={currentRoute} navigate={navigate} />
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">{renderView()}</main>
      </div>

      {/* Global Footer (shown on landing and public pages) */}
      {!isAdminRoute && !isDashboardRoute && <Footer navigate={navigate} />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        referralCode={referralCodeParam}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
