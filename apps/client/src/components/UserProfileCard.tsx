import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EditIcon } from './icons';

export default function UserProfileCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';
  const role = user?.user_metadata?.role || user?.profile?.role || 'usuario';

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700 ring-blue-200' },
    recepcion: { label: 'Recepción', color: 'bg-violet-100 text-violet-700 ring-violet-200' },
    liquidacion: { label: 'Liquidación', color: 'bg-amber-100 text-amber-700 ring-amber-200' },
    auditoria: { label: 'Auditoría', color: 'bg-rose-100 text-rose-700 ring-rose-200' },
    pagos: { label: 'Pagos', color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
    finiquito: { label: 'Finiquito', color: 'bg-cyan-100 text-cyan-700 ring-cyan-200' },
    programacion: { label: 'Programación', color: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
    proveedor: { label: 'Proveedor', color: 'bg-orange-100 text-orange-700 ring-orange-200' },
  };

  const roleInfo = roleLabels[role] ?? { label: role, color: 'bg-slate-100 text-slate-600 ring-slate-200' };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
      {/* Header con gradiente — sin overflow-hidden aquí */}
      <div className="rounded-t-2xl bg-gradient-to-br from-blue-500 to-cyan-400 px-6 py-6 relative overflow-hidden">
        {/* Patrón decorativo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Avatar */}
        <div className="relative z-10 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center text-white font-bold text-2xl shadow-md ring-4 ring-white/40 select-none">
            {initials}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-6 pt-4 pb-6">
        {/* Badge de rol */}
        <div className="flex justify-center mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ring-1 ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        </div>

        {/* Nombre y email */}
        <div className="text-center mb-5">
          <h2 className="font-bold text-slate-800 text-lg leading-tight">{name}</h2>
          <p className="text-sm text-slate-400 mt-0.5 truncate">{email}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-4" />

        {/* Botón */}
        <button
          onClick={() => navigate('/change-password')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all duration-200 group"
        >
          <EditIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          Cambiar Contraseña
        </button>
      </div>
    </div>
  );
}