import React, { useState } from 'react';
import { useCreateProvider } from '../../hooks/useCreateProvider';
import { Button, Input, Modal } from '../common';

type ProviderRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProviderRegistered: () => void;
};

export default function ProviderRegistrationModal({
  isOpen,
  onClose,
  onProviderRegistered,
}: ProviderRegistrationModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [rif, setRif] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { inviteSupplier } = useCreateProvider();

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('hola')
      await inviteSupplier({ email, fullName, rif });
      
      // Limpiar formulario
      setEmail('');
      setFullName('');
      setRif('');
      
      onProviderRegistered();
      onClose();
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invitar Nuevo Proveedor">
      <form className="flex flex-col gap-4" onSubmit={handleCreateProvider}>
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
          placeholder="proveedor@empresa.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="text"
          label="RIF"
          placeholder="J-12345678-9"
          required
          value={rif}
          onChange={(e) => setRif(e.target.value.toUpperCase())}
        />

        <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-md">
          ℹ️ Se enviará un correo de invitación al proveedor para que configure su contraseña
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Enviar Invitación
          </Button>
        </div>
      </form>
    </Modal>
  );
}