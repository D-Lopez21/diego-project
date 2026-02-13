import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning';
}

export default function Modal({ isOpen, onClose, title, message, type = 'info' }: ModalProps) {
  if (!isOpen) return null;

  const config = {
    error: {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      ),
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    success: {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
    },
    warning: {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
    },
    info: {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  const style = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay con desenfoque suave */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Contenedor del Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Cabecera con Icono Flotante o Minimalista */}
        <div className={`flex flex-col items-center pt-8 pb-4 px-6`}>
          <div className={`${style.bg} ${style.color} p-4 rounded-2xl mb-4`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {style.icon}
            </svg>
          </div>
          
          <h3 className="text-xl font-extrabold text-slate-900 text-center">
            {title || 'Atención'}
          </h3>
        </div>

        {/* Mensaje */}
        <div className="px-8 pb-8">
          <p className="text-slate-500 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer con Botón Estilizado */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 text-white font-semibold rounded-xl shadow-lg transition-all 
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}