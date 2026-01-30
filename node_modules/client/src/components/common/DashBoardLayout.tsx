import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeftIcon, HomeIcon, LogOutIcon } from '../icons'; // Asumiendo que tienes estos iconos
import { Button } from '.';
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
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-neutral-500">
          Cargando panel...
        </p>
      </div>
    );
  }

  const fullName =
    user?.user_metadata?.name || user?.user_metadata?.full_name || 'Usuario';
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh w-full bg-[#f8fafc] flex flex-col font-sans">
      {/* Navbar con Efecto Glassmorphism */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <HomeIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-neutral-900 tracking-tight">
              Admin<span className="text-blue-600">Panel</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-3 md:flex border-r pr-6 border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-bold text-neutral-900 leading-none mb-1">
                  {fullName}
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  {user?.email}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                {initial}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-500 hover:text-red-600 hover:bg-red-50 gap-2 transition-all cursor-pointer"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Área de Contenido */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-10 animate-in fade-in duration-500">
        <div className="flex flex-col gap-8">
          {/* Cabecera con Navegación */}
          <div className="space-y-4">
            {returnTo && (
              <button
                onClick={() => navigate(returnTo)}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
                Volver atrás
              </button>
            )}

            {(title || subtitle) && (
              <header className="border-b border-neutral-200 pb-6">
                {title && (
                  <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-lg text-neutral-500 mt-2 max-w-2xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </header>
            )}
          </div>

          {/* El contenido inyectado */}
          <section>{children}</section>
        </div>
      </main>

      {/* Footer Refinado */}
      <footer className="py-8 text-center border-t border-neutral-400 bg-white">
        <p className="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Diego Lopez
        </p>
        <p className="text-xs text-neutral-400 mt-1 flex items-center justify-center gap-1">
          Panel de Administración{' '}
          <span className="h-1 w-1 rounded-full bg-neutral-300"></span> Todos
          los derechos reservados
        </p>
      </footer>
    </div>
  );
};
