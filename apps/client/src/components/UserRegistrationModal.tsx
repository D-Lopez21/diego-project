import React, { useState } from 'react';
import { Button, Input, Modal, Select } from './common';
import useGetRoles from '../hooks/useGetRoles';
import { useCreateEmployee } from '../hooks/useCreateEmployee';

type UserRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UserRegistrationModal({
  isOpen,
  onClose,
}: UserRegistrationModalProps) {
  const roles = useGetRoles();
  const filteredRoles = roles.filter(
    (role) =>  role !== 'proveedor',
  );

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState(false);

  const { inviteUser, loading, error } = useCreateEmployee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (role) {
      const result = await inviteUser(email, fullName, role);
      if (result) {
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Usuario">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="Nombre completo"
          placeholder="Ej. Juan Pérez"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          type="email"
          label="Correo electrónico"
          placeholder="admin@empresa.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Select
          options={filteredRoles.map((role) => ({ value: role, label: role }))}
          label="Rol"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Registrar
          </Button>
        </div>
        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md">
            Invitación de usuario enviada con éxito.
          </div>
        )}
      </form>
    </Modal>
  );
}
