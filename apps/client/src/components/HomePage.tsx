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
  features: string[];
}

const ActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
  features,
}: ActionCardProps) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-400',
      accent: 'from-blue-500 to-cyan-500',
      hover: 'group-hover:shadow-blue-500/20',
      dot: 'bg-blue-400',
      border: 'border-blue-100',
      featureBg: 'bg-blue-50/60',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-400',
      accent: 'from-green-500 to-emerald-500',
      hover: 'group-hover:shadow-green-500/20',
      dot: 'bg-green-400',
      border: 'border-green-100',
      featureBg: 'bg-green-50/60',
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-400',
      accent: 'from-amber-500 to-orange-500',
      hover: 'group-hover:shadow-amber-500/20',
      dot: 'bg-amber-400',
      border: 'border-amber-100',
      featureBg: 'bg-amber-50/60',
    },
  };

  const styles = colorStyles[color];

  return (
    <div className={`group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl ${styles.hover} transition-all duration-300 flex flex-col hover:-translate-y-1 overflow-hidden h-full`}>
      
      {/* Header con gradiente suave */}
      <div className={`relative p-6 pb-4`}>
        {/* Icono con gradiente */}
        <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center shadow-md mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Features */}
      <div className={`mx-5 mb-5 rounded-xl ${styles.featureBg} border ${styles.border} p-4 flex flex-col gap-2`}>
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
            <span className="text-sm text-slate-600">{f}</span>
          </div>
        ))}
      </div>

      {/* Botón */}
      <div className="px-5 pb-5 mt-auto">
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
                    description="Administra los roles y permisos del sistema."
                    icon={UserIcon}
                    color="blue"
                    onClick={() => navigate('/users')}
                    features={[
                      'Crear y editar usuarios',
                      'Asignar roles y permisos',
                      'Activar o desactivar cuentas',
                    ]}
                  />
                </div>
                <div className="animate-fade-in-up flex" style={{ animationDelay: '200ms' }}>
                  <ActionCard
                    title="Proveedores"
                    description="Gestiona el directorio de proveedores."
                    icon={BriefcaseIcon}
                    color="amber"
                    onClick={() => navigate('/providers')}
                    features={[
                      'Registrar nuevos proveedores',
                      'Editar información de contacto',
                      'Consultar historial de facturas',
                    ]}
                  />
                </div>
              </>
            ) : null}
            <div className="animate-fade-in-up flex" style={{ animationDelay: isAdmin ? '300ms' : '100ms' }}>
              <ActionCard
                title="Facturas"
                description="Controla el historial de facturación."
                icon={ReceiptIcon}
                color="green"
                onClick={() => navigate('/bills')}
                features={[
                  'Crear y gestionar facturas',
                  'Filtrar por fecha y estado',
                  'Exportar reportes',
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