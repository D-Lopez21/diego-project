import React, { useState } from 'react';
import { Button, Input, Modal } from './common';
import { useCreateEmployee } from '../hooks/useCreateEmployee';

type SupplierRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SupplierRegistrationModal({
  isOpen,
  onClose,
}: SupplierRegistrationModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [rif, setRif] = useState('');
  const [rifError, setRifError] = useState('');
  const [success, setSuccess] = useState(false);

  const { inviteUser, loading, error } = useCreateEmployee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setRifError('');

    // Validar formato RIF (J/V/E/G-12345678-9)
    const rifRegex = /^[JVEG]-\d{8,9}-?\d?$/i;
    if (!rifRegex.test(rif)) {
      setRifError('El RIF debe tener el formato: J-12345678-9 o V-12345678-9');
      return;
    }

    // El rol siempre es 'proveedor'
    const result = await inviteUser(email, fullName, 'proveedor', rif);
    if (result) {
      setSuccess(true);
      // Limpiar formulario
      setEmail('');
      setFullName('');
      setRif('');
      setRifError('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setEmail('');
    setFullName('');
    setRif('');
    setRifError('');
    setSuccess(false);
    onClose();
  };

  const formatRif = (value: string) => {
    // Remover caracteres no permitidos y convertir a mayúsculas
    let formatted = value.toUpperCase().replace(/[^JVEG0-9-]/g, '');
    
    // Limitar longitud a 13 caracteres
    if (formatted.length > 13) {
      formatted = formatted.substring(0, 13);
    }
    
    // Auto-agregar guiones si es necesario
    if (formatted.length === 1 && /[JVEG]/.test(formatted)) {
      formatted += '-';
    }
    
    return formatted;
  };

  const handleRifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRif(e.target.value);
    setRif(formatted);
    // Limpiar error al escribir
    if (rifError) setRifError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Nuevo Proveedor">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="Nombre completo o Razón Social"
          placeholder="Ej. Distribuidora ABC C.A."
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div>
          <Input
            label="RIF"
            placeholder="J-12345678-9"
            required
            value={rif}
            onChange={handleRifChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Formato: J-12345678-9, V-12345678-9, E-12345678-9, o G-12345678-9
          </p>
          {rifError && (
            <p className="mt-1 text-xs text-red-600">
              {rifError}
            </p>
          )}
        </div>

        <Input
          type="email"
          label="Correo electrónico"
          placeholder="proveedor@empresa.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-md">
          ℹ️ El proveedor recibirá un correo de invitación para establecer su contraseña.
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Registrar Proveedor
          </Button>
        </div>

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md">
            ✅ Proveedor registrado exitosamente. Invitación enviada.
          </div>
        )}
      </form>
    </Modal>
  );
}