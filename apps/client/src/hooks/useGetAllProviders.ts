/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllProviders() {
  const [providers, setProviders] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 🔍 DEBUGGING
  console.log('🎣 useGetAllProviders ejecutado');

  React.useEffect(() => {
    let isMounted = true;
    console.log('🎣 useGetAllProviders: useEffect iniciado');

    // 🔥 Función dentro del useEffect para evitar dependencias circulares
    const fetchProviders = async () => {
      console.log('📥 Iniciando fetch de providers...');
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('profile')
          .select('*')
          .eq('role', 'proveedor')
          .order('name', { ascending: true });

        console.log('📥 Respuesta de Supabase:', {
          success: !supabaseError,
          dataLength: data?.length,
          error: supabaseError
        });

        if (supabaseError) throw supabaseError;

        if (isMounted) {
          console.log('✅ Seteando providers:', data?.length);
          setProviders(data || []);
        } else {
          console.log('⚠️ Componente desmontado, no se actualiza estado');
        }
      } catch (err: any) {
        console.error('❌ Error en fetchProviders:', err.message);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          console.log('✅ Finalizando loading');
          setLoading(false);
        }
      }
    };

    // Carga inicial
    fetchProviders();

    // 🔥 Suscripción Realtime
    console.log('🔌 Creando canal providers-changes...');
    
    const channel = supabase
      .channel('providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile',
          filter: 'role=eq.proveedor', // ← Solo escuchar proveedores
        },
        (payload) => {
          if (!isMounted) {
            console.log('⚠️ Evento recibido pero componente desmontado');
            return;
          }

          console.log('👤 Provider changed:', payload.eventType, payload);

          // Actualización optimista del estado
          if (payload.eventType === 'INSERT') {
            setProviders((prev) => 
              [...prev, payload.new as Profile].sort((a, b) => 
                a.name.localeCompare(b.name)
              )
            );
          } else if (payload.eventType === 'UPDATE') {
            setProviders((prev) =>
              prev.map((provider) =>
                provider.id === payload.new.id 
                  ? (payload.new as Profile) 
                  : provider
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProviders((prev) => 
              prev.filter((provider) => provider.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado del canal providers-changes:', status);
      });

    console.log('✅ Canal providers-changes creado');

    // 🔥 Cleanup
    return () => {
      console.log('🧹 Cleanup de useGetAllProviders');
      isMounted = false;
      supabase.removeChannel(channel);
      console.log('🗑️ Canal providers-changes removido');
    };
  }, []); // ← Sin dependencias

  // 🔥 Función de actualización separada (no afecta useEffect)
  const updateProvider = React.useCallback(
    async (id: string, updates: Partial<Profile>): Promise<boolean> => {
      console.log('📝 Actualizando provider:', id, updates);
      try {
        const { error: updateError } = await supabase
          .from('profile')
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        // Actualización optimista
        setProviders((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );

        console.log('✅ Provider actualizado exitosamente');
        return true;
      } catch (err: any) {
        console.error('❌ Error updating provider:', err.message);
        throw err;
      }
    },
    []
  );

  // 🔥 Función de eliminación separada
  const deleteProvider = React.useCallback(async (id: string): Promise<boolean> => {
    console.log('🗑️ Eliminando provider:', id);
    try {
      const { error: deleteError } = await supabase
        .from('profile')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Eliminación optimista
      setProviders((prev) => prev.filter((p) => p.id !== id));

      console.log('✅ Provider eliminado exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error deleting provider:', err.message);
      throw err;
    }
  }, []);

  // 🔥 Función de refetch manual (separada, no causa loops)
  const refetch = React.useCallback(async () => {
    console.log('🔄 Refetch manual de providers iniciado');
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .eq('role', 'proveedor')
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      
      setProviders(data || []);
      setError(null);
      console.log('✅ Refetch completado:', data?.length);
    } catch (err: any) {
      console.error('❌ Error en refetch:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    providers,
    loading,
    error,
    updateProvider,
    deleteProvider,
    refetch,
  };
}