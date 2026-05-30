import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineMoon,
  HiOutlineSun,
} from 'react-icons/hi2';
import { IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../context/themeStore';
import Button from '../ui/Button';

export default function Navbar({ onMenuClick }) {
  const { user, profile, logout } = useAuth();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/projects?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials =
    profile?.displayName?.[0] ||
    user?.displayName?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    'U';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full min-w-0 max-w-full shrink-0 items-center gap-2 border-b border-border-light bg-card-light/80 px-3 backdrop-blur-md sm:gap-4 sm:px-6 dark:border-border-dark dark:bg-card-dark/80">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <HiOutlineBars3 className="h-6 w-6" />
      </button>

      <form onSubmit={handleSearch} className="hidden flex-1 sm:block sm:max-w-md">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search projects or customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border-light bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:border-border-dark dark:bg-slate-800 dark:text-white"
          />
        </div>
      </form>

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={toggle}
          className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <HiOutlineSun className="h-5 w-5" />
          ) : (
            <HiOutlineMoon className="h-5 w-5" />
          )}
        </button>

        <div className="hidden items-center gap-3 rounded-xl border border-border-light px-3 py-1.5 dark:border-border-dark sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {profile?.displayName || user?.displayName || 'User'}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="!px-2.5">
          <IoLogOutOutline className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
