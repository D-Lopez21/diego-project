import React from 'react';
import { Button, DashboardLayout, Input } from './common';
import { PlusIcon } from './icons';
import { ProviderRegistrationModal, ProvidersTable } from './providers';

export default function ProvidersPage() {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const handleProviderRegistered = () => {
    // La tabla se actualiza sola gracias a la suscripción de Supabase
    setModalIsOpen(false);
  };

  return (
    <DashboardLayout title="Gestión de Proveedores" returnTo="/">
      <div id="header-actions" className="w-full flex justify-end">
        {/* TODO: Implement search functionality */}
        <Input
          type="search"
          placeholder="Buscar proveedor..."
          className="mr-4 max-w-sm"
        />
        <Button
          icon={<PlusIcon className="size-6" />}
          className="mb-4 justify-start gap-2"
          onClick={() => setModalIsOpen(true)}
        >
          Nuevo Proveedor
        </Button>
      </div>
      <ProvidersTable />

      <ProviderRegistrationModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onProviderRegistered={handleProviderRegistered}
      />
    </DashboardLayout>
  );
}
