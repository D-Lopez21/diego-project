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
}

const ActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
}: ActionCardProps) => {
  const colorStyles = {
    blue: {
      icon: 'text-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100',
      accent: 'from-blue-500 to-cyan-500',
      hover: 'group-hover:shadow-blue-500/20',
    },
    green: {
      icon: 'text-green-600 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
      accent: 'from-green-500 to-emerald-500',
      hover: 'group-hover:shadow-green-500/20',
    },
    amber: {
      icon: 'text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
      accent: 'from-amber-500 to-orange-500',
      hover: 'group-hover:shadow-amber-500/20',
    },
  };

  const styles = colorStyles[color];

  return (
    <div className={`group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg ${styles.hover} transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden h-full`}>
      {/* Decorative gradient corner */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${styles.accent} opacity-5 rounded-bl-full transition-opacity duration-300 group-hover:opacity-10`} />
      
      <div className="relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${styles.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {description}
        </p>
      </div>
      
      <Button
        onClick={onClick}
        className={`w-full bg-gradient-to-r ${styles.accent} hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300 relative z-10`}
      >
        Ver Tabla
      </Button>
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
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* ✅ Grid principal con items-stretch para que todas las celdas tengan el mismo alto */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-stretch">
          
          {/* Perfil — ocupa 1 columna y se estira al alto del row */}
          <div className="lg:col-span-1 animate-fade-in">
            <div className="h-full">
              <UserProfileCard />
            </div>
          </div>

          {/* Grid de Acciones — ocupa 3 columnas */}
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
                  />
                </div>
                <div className="animate-fade-in-up flex" style={{ animationDelay: '200ms' }}>
                  <ActionCard
                    title="Proveedores"
                    description="Gestiona los proveedores y su información de contacto."
                    icon={BriefcaseIcon}
                    color="amber"
                    onClick={() => navigate('/providers')}
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