import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineFolderOpen,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineBolt,
} from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/projects', label: 'Projects', icon: HiOutlineFolderOpen },
  { to: '/analytics', label: 'Analytics & Export', icon: HiOutlineChartBar },
  { to: '/profile', label: 'Profile', icon: HiOutlineUser },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-light bg-card-light transition-transform duration-300 dark:border-border-dark dark:bg-card-dark lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-border-light px-6 dark:border-border-dark">
      <div className="flex items-center gap-2.5">
  <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden">
    <img
      src="/AmanArts.png"
      alt="BizTrack Logo"
      className="h-full w-full object-cover"
    />
  </div>

  <span className="text-lg font-bold bg-gradient-to-r from-teal-300 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
    BizTrack
  </span>
</div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 lg:hidden"
        >
          <IoClose className="h-6 w-6 text-slate-500" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border-light p-4 dark:border-border-dark">
        <p className="text-xs text-slate-500">
          BizTrack - Developed By Aman Mishra
        </p>
        <div className="flex gap-3 mt-2 justify-center md:justify-start">
          {/* Instagram */}
          <a 
            href="https://www.instagram.com/aman_mishra_692/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-pink-600 transition-colors"
            aria-label="Instagram"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* GitHub */}
          <a 
            href="https://github.com/Aman567mishra" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026.797-.222 1.649-.332 2.498-.336.85.004 1.703.114 2.502.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>

          {/* Email */}
          <a 
            href="mailto:aman5678mishra@outlook.com" 
            className="text-slate-500 hover:text-blue-500 transition-colors"
            aria-label="Email"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>

          {/* Website/Portfolio */}
          <a 
            href="https://aman567mishra.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-purple-500 transition-colors"
            aria-label="Website"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}