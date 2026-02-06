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
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
      </div>
      <Button
        onClick={onClick}
        className="w-full transition-colors flex justify-between"
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Perfil más estilizado a la izquierda */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <UserProfileCard />
            </div>
          </div>

          {/* Grid de Acciones */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isAdmin ? (
              <>
                <ActionCard
                  title="Usuarios"
                  description="Administra los roles y crea nuevos usuarios para el sistema."
                  icon={UserIcon}
                  color="blue"
                  onClick={() => navigate('/users')}
                />
                <ActionCard
                  title="Proveedores"
                  description="Gestiona los proveedores y su información de contacto."
                  icon={BriefcaseIcon}
                  color="amber"
                  onClick={() => navigate('/providers')}
                />
              </>
            ) : null}
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
    </DashboardLayout>
  );
}
