import React from 'react';
import { Button, DashboardLayout } from './common';
import { PlusIcon } from './icons';
import BillsTable from './BillsTable';
import { useNavigate } from 'react-router';
import { useGetAllBills } from '../hooks/useGetAllBills';

type FilterType = 'number' | 'provider' | 'lot';

export default function BillingPage() {
  const navigate = useNavigate();
  const { bills, loading, error, getProviderName, deleteBill } = useGetAllBills();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<FilterType>('number');

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('number');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta factura?')) {
      const success = await deleteBill(id);
      if (!success) alert('Error al eliminar la factura');
    }
  };

  return (
    <DashboardLayout title="Sistema de Facturación" returnTo="/">
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        {/* Buscador unificado */}
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
            placeholder={`Buscar...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm px-4 py-1.5 outline-none w-full md:w-80 bg-transparent"
          />

          {searchTerm && (
            <button onClick={handleClearFilters} className="pr-2 text-xs text-neutral-400 hover:text-red-500 font-bold">✕</button>
          )}
        </div>

        <Button icon={<PlusIcon className="size-5" />} onClick={() => navigate('create-bill')}>
          Nueva Factura
        </Button>
      </div>

      <BillsTable 
        bills={bills}
        loading={loading}
        error={error}
        searchTerm={searchTerm} 
        filterType={filterType} 
        getProviderName={getProviderName}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
}