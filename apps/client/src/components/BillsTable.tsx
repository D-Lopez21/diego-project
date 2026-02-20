import { EditIcon, TrashIcon } from './icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface BillsTableProps {
  bills: any[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterType: 'number' | 'provider' | 'lot';
  getProviderName: (id: string) => string;
  onDelete: (id: string) => void;
}

export default function BillsTable({ 
  bills, loading, error, searchTerm, filterType, getProviderName, onDelete 
}: BillsTableProps) {

  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.user_metadata?.role || user?.profile?.role || '';
  const isAdmin    = role === 'admin';
  const isProveedor = role === 'proveedor';

  const filteredBills = bills.filter((bill) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();

    switch (filterType) {
      case 'number':   return bill.n_billing?.toLowerCase().includes(term);
      case 'provider': return getProviderName(bill.suppliers_id).toLowerCase().includes(term);
      case 'lot':      return bill.nomenclature_pile?.toLowerCase().includes(term);
      default:         return true;
    }
  });

  if (loading) return <div className="py-10 text-center text-neutral-500 italic">Cargando facturas...</div>;
  if (error)   return <div className="py-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 font-semibold">
            <tr>
              <th className="px-6 py-4">N° Factura</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Lote</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-neutral-400">No hay facturas.</td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{bill.n_billing || 'S/N'}</td>
                  <td className="px-6 py-4">{getProviderName(bill.suppliers_id)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium">
                      {bill.nomenclature_pile || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${bill.state === 'Liquidación' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {bill.state || 'Recibido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">

                      {/* Editar — visible para todos */}
                      <button
                        onClick={() => navigate(`/bills/${bill.id}`)}
                        className="p-1.5 text-neutral-400 hover:text-blue-600 transition-colors"
                      >
                        <EditIcon className="size-5" />
                      </button>

                      {/* Eliminar — oculto para proveedor, deshabilitado para no-admin */}
                      {!isProveedor && (
                        <button
                          onClick={() => isAdmin && onDelete(bill.id)}
                          disabled={!isAdmin}
                          title={!isAdmin ? 'Solo administradores pueden eliminar facturas' : 'Eliminar factura'}
                          className={`p-1.5 transition-colors ${
                            isAdmin
                              ? 'text-neutral-400 hover:text-red-600 cursor-pointer'
                              : 'text-neutral-200 cursor-not-allowed'
                          }`}
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      )}

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