import React from 'react';
import { Button, DashboardLayout } from './common';
import { PlusIcon } from './icons';
import { ProviderRegistrationModal, ProvidersTable } from './providers';
import { useGetAllProviders } from '../hooks/useGetAllProviders';
// Usamos 'import type' (image_1d1823)
import type { Profile } from '../contexts/AuthContext';

export default function ProvidersPage() {
  // Solo extraemos lo que usamos para evitar el error de "never read" (image_1d05b8)
  const { updateProvider, deleteProvider, refetch } = useGetAllProviders();
  
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [providerToEdit, setProviderToEdit] = React.useState<Profile | null>(null);

  const handleEdit = (provider: Profile) => {
    setProviderToEdit(provider);
    setModalIsOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${name}?`)) {
      await deleteProvider(id);
    }
  };

  return (
    <DashboardLayout title="Gestión de Proveedores" returnTo="/">
      <div className="flex justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="Buscar proveedor..." 
          className="border p-2 rounded-lg text-sm w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button icon={<PlusIcon className="size-5" />} onClick={() => { setProviderToEdit(null); setModalIsOpen(true); }}>
          Nuevo Proveedor
        </Button>
      </div>

      <ProvidersTable 
        searchTerm={searchTerm} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <ProviderRegistrationModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        providerToEdit={providerToEdit}
        onUpdate={updateProvider}
        onProviderRegistered={refetch}
      />
    </DashboardLayout>
  );
}