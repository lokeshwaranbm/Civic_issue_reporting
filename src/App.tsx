import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { CitizenDashboard } from './components/CitizenDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <AnimatePresence mode="wait">
          {currentUser.role === 'citizen' && (
            <motion.div
              key="citizen"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CitizenDashboard />
            </motion.div>
          )}
          {currentUser.role === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <StaffDashboard />
            </motion.div>
          )}
          {currentUser.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '2px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
