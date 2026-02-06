import { useGetAllBills } from '../hooks/useGetAllBills';
import { EditIcon, TrashIcon } from './icons';


export default function BillsTable() {
  const { bills, loading, error, getProviderName, deleteBill } = useGetAllBills();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta factura?')) {
      const success = await deleteBill(id);
      if (!success) {
        alert('Error al eliminar la factura');
      }
    }
  };

  function onEditBill(billId: string) {
    // Navegar a la página de detalles de la factura
    window.location.href = `/bills/${billId}`;
  }

  if (loading)
    return (
      <div className="py-10 text-center text-neutral-500">
        Cargando facturas...
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
              <th className="px-6 py-4 font-semibold">N° Factura</th>
              <th className="px-6 py-4 font-semibold">Proveedor</th>
              <th className="px-6 py-4 font-semibold">N° Siniestro</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Moneda</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {bills.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-neutral-400"
                >
                  No hay facturas registradas.
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr
                  key={bill.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">
                      {bill.n_billing || 'Sin N°'}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {bill.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">
                      {getProviderName(bill.suppliers_id)}
                    </div>
                    {bill.suppliers_id && (
                      <div className="text-xs text-neutral-400">
                        {bill.suppliers_id.slice(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700">
                      {bill.n_claim || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        bill.state === 'Recepción'
                          ? 'bg-pink-100 text-pink-700'
                          : bill.state === 'Liquidación'
                            ? 'bg-green-100 text-green-700'
                            : bill.state === 'Auditoría'
                              ? 'bg-orange-100 text-orange-700'
                              : bill.state === 'Programación'
                                ? 'bg-blue-100 text-blue-700'
                                : bill.state === 'Ejecución'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : bill.state === 'Finiquito'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {bill.state || 'Sin estado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">
                      {bill.total_billing || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700">
                      {bill.currency_type || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${bill.active ? 'bg-green-500' : 'bg-neutral-300'}`}
                      />
                      {bill.active ? 'Activo' : 'Inactivo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        title="Editar"
                        onClick={() => onEditBill(bill.id)}
                        className="rounded p-1 hover:bg-neutral-100 text-neutral-500 hover:text-blue-600"
                      >
                        <EditIcon />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => handleDelete(bill.id)}
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