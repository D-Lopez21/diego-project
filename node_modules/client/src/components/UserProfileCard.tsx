import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './common';
import { EditIcon } from './icons';

export default function UserProfileCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col gap-4">
      <h2 className="font-semibold text-neutral-700">Perfil de Usuario</h2>
      <div>
        <p className="text-sm text-neutral-500">
          Nombre:{' '}
          <span className="font-medium text-neutral-700">
            {user?.user_metadata?.name || 'N/A'}
          </span>
        </p>
        <p className="text-sm text-neutral-500">
          Email:{' '}
          <span className="font-medium text-neutral-700">{user?.email}</span>
        </p>
        <p className="text-sm text-neutral-500">
          Rol:{' '}
          <span className="font-medium text-neutral-700">
            {user?.user_metadata?.role || 'Usuario'}
          </span>
        </p>
      </div>
      <Button
        variant="secondary"
        className="gap-2 w-full justify-center"
        onClick={() => navigate('/change-password')}
      >
        <EditIcon /> Cambiar Contraseña
      </Button>
    </div>
  );
}
