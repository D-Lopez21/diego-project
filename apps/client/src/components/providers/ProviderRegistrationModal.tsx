import React, { useState } from 'react';
import { useRegistration } from '../../hooks/useSignUp';
import { Button, Input, Modal } from '../common';

type UserRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProviderRegistered: () => void;
};

export default function UserRegistrationModal({
  isOpen,
  onClose,
  onProviderRegistered,
}: UserRegistrationModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [rif, setRif] = useState('');
  // const [password, setPassword] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading, error } = useRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUp(email, 'password', fullName);
    if (result) {
      onProviderRegistered();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Proveedor">
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

        <Input
          type="text"
          label="Rif"
          placeholder="J-12345678-9"
          required
          value={rif}
          onChange={(e) => setRif(e.target.value)}
        />

        {/* <Input
          type={showPassword ? 'text' : 'password'}
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
            >
              {showPassword ? <OpenEyeIcon /> : <CloseEyeIcon />}
            </button>
          }
        /> */}

        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
