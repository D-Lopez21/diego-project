// src/components/SignUpPage.tsx
import React, { useState } from 'react';
import { Button, Input } from './common';
import { CloseEyeIcon, OpenEyeIcon } from './icons';
import { useRegistration } from '../hooks/useSignUp';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp, loading, error } = useRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUp(email, password, fullName);
    if (result) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="w-full h-dvh flex flex-col justify-center items-center bg-neutral-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            ¡Cuenta creada!
          </h2>
          <p className="text-neutral-600 mb-6">
            Por favor, revisa tu correo electrónico para confirmar tu cuenta
            antes de iniciar sesión.
          </p>
          <a
            href="/sign-in"
            className="text-blue-600 font-medium hover:underline"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh flex justify-center items-center bg-neutral-100 p-4">
      <div className="p-8 bg-white w-full max-w-md rounded-xl border border-neutral-200 shadow-sm">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-800">
            Crear cuenta Admin
          </h1>
          <p className="text-neutral-500 text-sm">
            Regístrate para gestionar la plataforma
          </p>
        </header>

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
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="mt-2 w-full"
          >
            Registrarse
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿Ya tienes cuenta?{' '}
          <a
            href="/sign-in"
            className="text-blue-600 font-semibold hover:underline"
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
