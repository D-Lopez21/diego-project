/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';

export const useUpdatePassword = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    console.log('--- Iniciando RPC ---'); // Debug 1

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'user_self_update_password',
        {
          new_password: newPassword,
        },
      );

      console.log('--- Respuesta recibida ---', { data, rpcError }); // Debug 2

      if (rpcError) throw rpcError;
      setSuccess(true);
    } catch (err: any) {
      console.error('Error atrapado:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return { updatePassword, loading, error, success };
};
