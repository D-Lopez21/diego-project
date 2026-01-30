import React from 'react';
import { Button, DashboardLayout, Input } from './common';
import { PlusIcon } from './icons';
import UsersTable from './UsersTable';
import UserRegistrationModal from './UserRegistrationModal';

export default function UsersPage() {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  return (
    <DashboardLayout title="Gestión de Usuarios" returnTo="/">
      <div id="header-actions" className="w-full flex justify-end">
        {/* TODO: Implement search functionality */}
        <Input
          type="search"
          placeholder="Buscar usuario..."
          className="mr-4 max-w-sm"
        />
        <Button
          icon={<PlusIcon className="size-6" />}
          className="mb-4 justify-start gap-2"
          onClick={() => setModalIsOpen(true)}
        >
          Nuevo Usuario
        </Button>
      </div>
      <UsersTable />

      <UserRegistrationModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />
    </DashboardLayout>
  );
}
