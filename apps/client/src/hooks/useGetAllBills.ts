/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../components/bills-details/interfaces';

interface Provider {
  id: string;
  name: string;
  rif?: string;
  role: string;
  active: boolean;
}

export function useGetAllBills() {
  const [bills, setBills] = React.useState<Bill[]>([]);
  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // --- FUNCIÓN DE REFETCH MEJORADA ---
  // Actualiza los datos en segundo plano para no bloquear la UI si ya hay información.
  const refetch = React.useCallback(async () => {
    // Solo mostramos el loader principal si la lista está vacía
    if (bills.length === 0) setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Sincronizando datos con Supabase...");
      
      const { data, error: supabaseError } = await supabase
        .from('bills')
        .select('*')
        .order('arrival_date', { ascending: false });

      if (supabaseError) {
        console.error("❌ Error de Supabase en refetch:", supabaseError);
        throw supabaseError;
      }
      
      setBills(data || []);
      console.log("✅ Sincronización exitosa:", data?.length, "facturas cargadas.");
    } catch (err: any) {
      console.error("❌ Error crítico en refetch:", err);
      setError(err.message || 'Error al sincronizar datos');
    } finally {
      // Garantizamos que el estado de carga se apague siempre
      setLoading(false);
    }
  }, [bills.length]);

  React.useEffect(() => {
    let isMounted = true;

    // Carga inicial optimizada de facturas y proveedores
    const loadInitialData = async () => {
      if (!isMounted) return;
      setLoading(true);
      
      try {
        const [billsRes, providersRes] = await Promise.all([
          supabase.from('bills').select('*').order('arrival_date', { ascending: false }),
          supabase.from('profile').select('*').eq('role', 'proveedor').eq('active', true)
        ]);

        if (billsRes.error) throw billsRes.error;
        if (providersRes.error) throw providersRes.error;

        if (isMounted) {
          setBills(billsRes.data || []);
          setProviders(providersRes.data || []);
          setError(null);
        }
      } catch (err: any) {
        console.error("❌ Error en carga inicial:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    // --- RE-SINCRONIZACIÓN AL VOLVER DE OTRA PESTAÑA (YouTube, etc) ---
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Pestaña activa detectada. Refrescando datos...');
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --- SUSCRIPCIÓN REALTIME ---
    const billsChannel = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          if (!isMounted) return;
          console.log('📊 Cambio en base de datos detectado:', payload.eventType);
          // Refrescamos todo el estado para mantener consistencia absoluta
          refetch(); 
        }
      )
      .subscribe((status) => {
        console.log('🔌 Estado Realtime:', status);
      });

    // Cleanup: Limpieza de eventos y canales
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(billsChannel);
    };
  }, [refetch]);

  // Función para eliminar facturas
  const deleteBill = React.useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error eliminando factura:', err.message);
      return false;
    }
  }, []);

  // Función para obtener el nombre del proveedor
  const getProviderName = React.useCallback(
    (providerId?: string) => {
      if (!providerId) return 'Sin proveedor';
      const provider = providers.find((p) => p.id === providerId);
      return provider
        ? `${provider.name}${provider.rif ? ` - ${provider.rif}` : ''}`
        : 'Cargando...';
    },
    [providers]
  );

  return { bills, loading, error, getProviderName, deleteBill, refetch };
}