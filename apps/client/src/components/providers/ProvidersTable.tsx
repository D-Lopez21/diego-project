import { useGetAllProviders } from "../../hooks/useGetAllProviders";
import { EditIcon, TrashIcon } from "../icons";
// Usamos 'import type' para cumplir con verbatimModuleSyntax (image_1d1863)
import type { Profile } from "../../contexts/AuthContext";

interface ProvidersTableProps {
  searchTerm: string;
  onEdit: (provider: Profile) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ProvidersTable({ searchTerm, onEdit, onDelete }: ProvidersTableProps) {
  const { providers, loading, error } = useGetAllProviders();

  const filteredProviders = (providers || []).filter((provider) =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (provider.rif && provider.rif.toLowerCase().includes(searchTerm.toLowerCase())) // 👈 Validación de rif (image_1d1863)
  );

  if (loading) return <div className="py-10 text-center text-neutral-500 italic">Cargando proveedores...</div>;
  if (error) return <div className="py-10 text-center text-red-500 text-sm">Error: {error}</div>;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">RIF</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProviders.map((provider) => (
              <tr key={provider.id} className="hover:bg-neutral-50/50">
                <td className="px-6 py-4 font-medium text-neutral-900">{provider.name}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">
                    {provider.rif || 'N/A'} {/* 👈 Ya no dará error (image_1d1844) */}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${provider.active ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    {provider.active ? 'Activo' : 'Inactivo'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(provider)} className="p-1.5 text-neutral-400 hover:text-blue-600">
                      <EditIcon className="size-4" />
                    </button>
                    <button onClick={() => onDelete(provider.id, provider.name)} className="p-1.5 text-neutral-400 hover:text-red-600">
                      <TrashIcon className="size-4" />
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