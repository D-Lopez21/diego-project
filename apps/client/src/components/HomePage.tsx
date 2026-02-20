import { Button, DashboardLayout } from './common';
import { BriefcaseIcon, ReceiptIcon, UserIcon } from './icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfileCard from './UserProfileCard';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color: 'blue' | 'green' | 'amber';
  stats?: { label: string; value: string }[];
}

const ActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
  stats,
}: ActionCardProps) => {
  const colorStyles = {
    blue: {
      icon: 'text-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100',
      accent: 'from-blue-500 to-cyan-500',
      hover: 'group-hover:shadow-blue-500/20',
      stat: 'bg-blue-50 text-blue-600 border-blue-100',
      pill: 'bg-blue-500/10 text-blue-600',
    },
    green: {
      icon: 'text-green-600 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
      accent: 'from-green-500 to-emerald-500',
      hover: 'group-hover:shadow-green-500/20',
      stat: 'bg-green-50 text-green-600 border-green-100',
      pill: 'bg-green-500/10 text-green-600',
    },
    amber: {
      icon: 'text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
      accent: 'from-amber-500 to-orange-500',
      hover: 'group-hover:shadow-amber-500/20',
      stat: 'bg-amber-50 text-amber-600 border-amber-100',
      pill: 'bg-amber-500/10 text-amber-600',
    },
  };

  const styles = colorStyles[color];

  return (
    <div className={`group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg ${styles.hover} transition-all duration-300 flex flex-col hover:-translate-y-1 relative overflow-hidden h-full`}>
      {/* Decorative gradient corner */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${styles.accent} opacity-5 rounded-bl-full transition-opacity duration-300 group-hover:opacity-10`} />

      {/* Icono + título */}
      <div className="relative z-10 flex items-start gap-4 mb-3">
        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border ${styles.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 my-4 relative z-10" />

      {/* Stats / features */}
      {stats && (
        <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl border px-3 py-2.5 ${styles.stat}`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-sm font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Botón */}
      <div className="mt-auto relative z-10">
        <Button
          onClick={onClick}
          className={`w-full bg-gradient-to-r ${styles.accent} hover:opacity-90 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all duration-300`}
        >
          Ver Tabla
        </Button>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Bienvenido de nuevo, ${user?.user_metadata?.name || 'Usuario'}`}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-stretch">

          {/* Perfil */}
          <div className="lg:col-span-1 animate-fade-in h-full">
            <UserProfileCard />
          </div>

          {/* Acciones */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {isAdmin ? (
              <>
                <div className="animate-fade-in-up flex" style={{ animationDelay: '100ms' }}>
                  <ActionCard
                    title="Usuarios"
                    description="Administra los roles y crea nuevos usuarios para el sistema."
                    icon={UserIcon}
                    color="blue"
                    onClick={() => navigate('/users')}
                    stats={[
                      { label: 'Roles disponibles', value: '8 roles' },
                      { label: 'Acceso', value: 'Admin' },
                    ]}
                  />
                </div>
                <div className="animate-fade-in-up flex" style={{ animationDelay: '200ms' }}>
                  <ActionCard
                    title="Proveedores"
                    description="Gestiona los proveedores y su información de contacto."
                    icon={BriefcaseIcon}
                    color="amber"
                    onClick={() => navigate('/providers')}
                    stats={[
                      { label: 'Gestión', value: 'Completa' },
                      { label: 'Acceso', value: 'Admin' },
                    ]}
                  />
                </div>
              </>
            ) : null}
            <div className="animate-fade-in-up flex" style={{ animationDelay: isAdmin ? '300ms' : '100ms' }}>
              <ActionCard
                title="Facturas"
                description="Visualiza, crea y gestiona el historial de facturación."
                icon={ReceiptIcon}
                color="green"
                onClick={() => navigate('/bills')}
                stats={[
                  { label: 'Historial', value: 'Completo' },
                  { label: 'Exportar', value: 'PDF / Excel' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out backwards; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite 2s; }
      `}</style>
    </DashboardLayout>
  );
}