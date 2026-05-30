import { useEffect } from 'react';
import { useAuthStore } from '../context/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return { user, profile, loading, error, login, register, logout, refreshProfile };
}

export function useAuthInit() {
  useEffect(() => {
    const unsub = useAuthStore.getState().init();
    return () => unsub();
  }, []);
}
