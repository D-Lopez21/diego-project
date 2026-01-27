import React from 'react';
import { Button, Input } from './common';
import { CloseEyeIcon, OpenEyeIcon } from './icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  // Estados para UX
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Si todo sale bien, onAuthStateChange en el Context detectará la sesión
      console.log('Login exitoso');
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="h-dvh flex items-center justify-center">Cargando...</div>
    );
  }

  return (
    <div className="w-full h-dvh flex justify-center items-center gap-4 bg-neutral-100 p-4">
      <div className="p-8 bg-white w-full max-w-md text-center rounded-xl border border-neutral-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-neutral-800">Sign In</h1>
        <p className="text-neutral-500 mb-6 text-sm">
          Ingresa tus credenciales para acceder
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errorMsg}
            </div>
          )}

          <Input
            type="email"
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type={passwordVisible ? 'text' : 'password'}
            label="Contraseña"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightIcon={
              <button
                type="button" // Importante: evita que este botón haga submit al form
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
              >
                {passwordVisible ? <OpenEyeIcon /> : <CloseEyeIcon />}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="mt-2"
          >
            Entrar
          </Button>
        </form>

        <p className="pt-6 text-sm text-neutral-600">
          ¿No tienes una cuenta?{' '}
          <a
            href="/sign-up"
            className="underline font-medium text-blue-600 hover:text-blue-700"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
