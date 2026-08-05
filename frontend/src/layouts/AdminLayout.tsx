import { CreditCard, Receipt, SignOut, Users } from '@phosphor-icons/react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/plans', label: 'Plans', icon: Receipt },
  { to: '/subscribers', label: 'Subscribers', icon: Users },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-accent-600 text-xs font-semibold text-white">
                SB
              </span>
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Subscription Billing
              </span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-accent-700 dark:text-accent-400'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`
                  }
                >
                  <item.icon size={16} weight="bold" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <SignOut size={16} />
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
}
