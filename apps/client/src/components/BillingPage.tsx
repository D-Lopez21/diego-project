import React from 'react';
import { Button, DashboardLayout } from './common'; // Quitamos Input de common si usaremos el personalizado
import { PlusIcon } from './icons';
import BillsTable from './BillsTable';
import { useNavigate } from 'react-router';

type FilterType = 'number' | 'provider' | 'lot';

export default function BillingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<FilterType>('number');

  const handleNewBill = () => {
    navigate('create-bill');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('number');
  };

  return (
    <DashboardLayout title="Sistema de Facturación" returnTo="/">
      {/* Contenedor principal con justify-between para separar búsqueda de botón */}
      <div id="header-actions" className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        {/* GRUPO IZQUIERDO: Filtro y Búsqueda unificados */}
        <div className="flex items-center gap-0 w-full md:w-auto">
          <div className="flex bg-white border border-neutral-200 rounded-lg p-1 shadow-sm w-full md:w-auto items-center">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="bg-transparent text-sm font-medium px-3 outline-none border-r border-neutral-200 cursor-pointer text-neutral-600 h-9"
            >
              <option value="number">N° Factura</option>
              <option value="provider">Proveedor</option>
              <option value="lot">Lote</option>
            </select>

            <input
              type="text"
              placeholder={`Buscar ${filterType === 'number' ? 'número...' : filterType === 'provider' ? 'proveedor...' : 'lote...'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm px-4 py-1.5 outline-none w-full md:w-80 bg-transparent"
            />

            {/* Botón de Limpiar compacto dentro del buscador */}
            {searchTerm && (
              <button
                onClick={handleClearFilters}
                className="pr-2 text-xs text-neutral-400 hover:text-red-500 transition-colors font-bold"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* LADO DERECHO: Botón Nueva Factura */}
        <Button
          icon={<PlusIcon className="size-5" />}
          className="w-full md:w-auto justify-center gap-2"
          onClick={handleNewBill}
        >
          Nueva Factura
        </Button>
      </div>

      <BillsTable searchTerm={searchTerm} filterType={filterType} />
    </DashboardLayout>
  );
}