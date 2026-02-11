import { EditIcon, TrashIcon } from './icons';
import type { Profile } from '../contexts/AuthContext';

interface Props {
  users: Profile[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterType: 'name' | 'role';
  onEdit: (user: Profile) => void;
  onDelete: (id: string, name: string) => void;
}

export default function UsersTable({ users, loading, error, searchTerm, filterType, onEdit, onDelete }: Props) {
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return filterType === 'name' 
      ? user?.name?.toLowerCase().includes(term) 
      : user?.role?.toLowerCase().includes(term);
  });

  if (loading) return <div className="py-10 text-center text-neutral-500 italic">Cargando usuarios...</div>;
  if (error) return <div className="py-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">{user.name || 'Sin nombre'}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{user.id.slice(0, 8)}...</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={`h-2 w-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    {user.active ? 'Activo' : 'Inactivo'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(user)} className="p-1.5 hover:bg-blue-50 rounded-lg text-neutral-400 hover:text-blue-600 transition-colors">
                      <EditIcon className="size-5" />
                    </button>
                    <button onClick={() => onDelete(user.id, user.name || '')} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition-colors">
                      <TrashIcon className="size-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}