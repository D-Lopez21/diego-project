/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllProviders() {
  const [providers, setProviders] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('profile')
          .select('*')
          .eq('role', 'proveedor')
          .order('name', { ascending: true });

        if (supabaseError) throw supabaseError;

        if (isMounted) {
          setProviders(data || []);
        }
      } catch (err: any) {
        console.error('❌ Error en fetchProviders:', err.message);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProviders();

    // 🔍 DEBUGGING REALTIME - LOGS MUY VISIBLES
    const channel = supabase
      .channel('providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile',
          filter: 'role=eq.proveedor',
        },
        (payload) => {
          if (!isMounted) {
            console.log('⚠️⚠️⚠️ Evento recibido PERO componente desmontado');
            return;
          }

          // 🔍 LOGS PRINCIPALES - ESTOS SON LOS QUE DEBES BUSCAR
          console.log('');
          console.log('═══════════════════════════════════════');
          console.log('🔔 REALTIME EVENT RECIBIDO');
          console.log('   Tipo:', payload.eventType);
          console.log('   Hora:', new Date().toLocaleTimeString());
          console.log('═══════════════════════════════════════');
          console.log('');

          if (payload.eventType === 'INSERT') {
            console.log('➕ INSERTANDO NUEVO PROVIDER:');
            console.log('   Nombre:', payload.new?.name);
            console.log('   Email:', payload.new?.email);
            console.log('   RIF:', payload.new?.rif);
            
            setProviders((prev) => {
              const newProviders = [...prev, payload.new as Profile].sort((a, b) => 
                a.name.localeCompare(b.name)
              );
              console.log('✅ Lista actualizada, total proveedores:', newProviders.length);
              return newProviders;
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ ACTUALIZANDO PROVIDER:', payload.new?.name);
            setProviders((prev) =>
              prev.map((provider) =>
                provider.id === payload.new.id 
                  ? (payload.new as Profile) 
                  : provider
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ ELIMINANDO PROVIDER:', payload.old?.name);
            setProviders((prev) => 
              prev.filter((provider) => provider.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción Realtime:', status);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Función de actualización
  const updateProvider = React.useCallback(
    async (id: string, updates: Partial<Profile>): Promise<boolean> => {
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

        return true;
      } catch (err: any) {
        console.error('❌ Error updating provider:', err.message);
        throw err;
      }
    },
    []
  );

  // Función de eliminación
  const deleteProvider = React.useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('profile')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Eliminación optimista
      setProviders((prev) => prev.filter((p) => p.id !== id));

      return true;
    } catch (err: any) {
      console.error('❌ Error deleting provider:', err.message);
      throw err;
    }
  }, []);

  // 🔍 Función de refetch con LOGS DETALLADOS
  const refetch = React.useCallback(async () => {
    console.log('');
    console.log('🔄🔄🔄 REFETCH MANUAL INICIADO 🔄🔄🔄');
    console.log('   Hora:', new Date().toLocaleTimeString());
    
    try {
      setLoading(true);
      console.log('   ⏳ Loading activado');
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .eq('role', 'proveedor')
        .order('name', { ascending: true });

      console.log('   📥 Respuesta recibida:');
      console.log('      - Success:', !supabaseError);
      console.log('      - Data length:', data?.length);
      console.log('      - Error:', supabaseError?.message || 'ninguno');

      if (supabaseError) throw supabaseError;
      
      setProviders(data || []);
      setError(null);
      console.log('   ✅ Providers actualizados:', data?.length);
    } catch (err: any) {
      console.error('   ❌ ERROR en refetch:', err.message);
      setError(err.message);
    } finally {
      console.log('   🏁 Finalizando refetch...');
      setLoading(false);
      console.log('   ✅ Loading desactivado');
      console.log('🔄🔄🔄 REFETCH COMPLETADO 🔄🔄🔄');
      console.log('');
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