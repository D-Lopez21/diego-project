import { useGetAllProviders } from "../../hooks/useGetAllProviders";
import { EditIcon, TrashIcon } from "../icons";


export default function ProvidersTable() {
  const { providers, loading, error } = useGetAllProviders();

  if (loading)
    return (
      <div className="py-10 text-center text-neutral-500">
        Cargando proveedores...
      </div>
    );

  if (error)
    return <div className="py-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Nombre</th>
              <th className="px-6 py-4 font-semibold">RIF</th>
              <th className="px-6 py-4 font-semibold">Rol</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Cambio Pass</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {providers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-neutral-400"
                >
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr
                  key={provider.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">
                      {provider?.name || 'Sin nombre'}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {provider.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-neutral-700">
                      {provider?.rif || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        provider.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {provider.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${provider.active ? 'bg-green-500' : 'bg-neutral-300'}`}
                      />
                      {provider.active ? 'Activo' : 'Inactivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {provider.password_change_required ? (
                      <span className="text-orange-600 text-xs font-medium italic">
                        Pendiente
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs italic">
                        Al día
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        title="Editar"
                        className="rounded p-1 hover:bg-neutral-100 text-neutral-500 hover:text-blue-600"
                      >
                        <EditIcon />
                      </button>
                      <button
                        title="Eliminar"
                        className="rounded p-1 hover:bg-neutral-100 text-neutral-500 hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}