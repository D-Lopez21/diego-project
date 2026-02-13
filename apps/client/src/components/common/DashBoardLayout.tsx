import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeftIcon, HomeIcon, LogOutIcon } from '../icons';
import { useSignOut } from '../../hooks/useSignOut';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  returnTo?: string;
}

export const DashboardLayout = ({
  children,
  title,
  subtitle,
  returnTo,
}: DashboardLayoutProps) => {
  const signOut = useSignOut();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/sign-in');
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-100 animate-ping"></div>
        </div>
        <p className="mt-6 text-sm font-semibold text-slate-700 tracking-wide">
          Cargando Panel
        </p>
      </div>
    );
  }

  const fullName =
    user?.user_metadata?.name || user?.user_metadata?.full_name || 'Usuario';
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh w-full flex flex-col font-sans relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-cyan-50 -z-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDF2MWgtNDF6IiBmaWxsPSJyZ2JhKDU5LDEzMCwyNDYsLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="sticky top-0 z-50 border-b border-blue-200/50 bg-white/80 backdrop-blur-2xl shadow-lg shadow-blue-500/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-2xl border border-blue-300/30 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <HomeIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Admin<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Panel</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-4 md:flex">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                  {fullName}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {user?.email}
                </p>
              </div>
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300/50 flex items-center justify-center text-blue-700 font-bold shadow-sm">
                {initial}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-white/80 hover:bg-white backdrop-blur-xl border border-slate-200 text-slate-600 hover:text-red-600 px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:border-red-200"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-10 animate-fade-in">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="space-y-4">
            {returnTo && (
              <button
                onClick={() => navigate(returnTo)}
                className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group bg-white/80 backdrop-blur-xl border border-blue-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
                Volver
              </button>
            )}

            {(title || subtitle) && (
              <header className="bg-white/80 backdrop-blur-2xl border border-blue-200/50 rounded-2xl p-6 shadow-xl shadow-blue-500/5">
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
                    {subtitle}
                  </p>
                )}
              </header>
            )}
          </div>

          {/* Content */}
          <section>{children}</section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center bg-white/80 backdrop-blur-xl border-t border-blue-200/50 shadow-inner">
        <p className="text-sm text-slate-700 font-semibold">
          © {new Date().getFullYear()} Diego Lopez
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Panel de Administración · Todos los derechos reservados
        </p>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 12s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  );
};