import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useAuthInit } from './hooks/useAuth';
import { useThemeStore } from './context/themeStore';
import { useAuthStore } from './context/authStore';
import { reconnectFirestore } from './utils/network';

export default function App() {
  useAuthInit();

  useEffect(() => {
    useThemeStore.getState().init();
  }, []);

  useEffect(() => {
    const onOnline = () => {
      reconnectFirestore();
      const { user } = useAuthStore.getState();
      if (user) useAuthStore.getState().retryConnection();
    };
    window.addEventListener('online', onOnline);
    reconnectFirestore();
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return <AppRoutes />;
}

