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

  // --- FUNCIÓN DE REFETCH (Definida con useCallback para estabilidad) ---
  const refetch = React.useCallback(async () => {
    // Si ya tenemos datos, no mostramos el loader principal para evitar parpadeos
    if (bills.length === 0) setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Intentando sincronizar con Supabase...");
      
      const { data, error: supabaseError } = await supabase
        .from('bills')
        .select('*')
        .order('arrival_date', { ascending: false });

      if (supabaseError) {
        console.error("❌ Error de Supabase en refetch:", supabaseError);
        throw supabaseError;
      }
      
      setBills(data || []);
      console.log("✅ Datos sincronizados correctamente.");
    } catch (err: any) {
      console.error("❌ Error en el catch de refetch:", err);
      setError(err.message || 'Error desconocido al sincronizar');
    } finally {
      setLoading(false);
    }
  }, [bills.length]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchBills = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('bills')
          .select('*')
          .order('arrival_date', { ascending: false });

        if (supabaseError) throw supabaseError;
        
        if (isMounted) {
          setBills(data || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchProviders = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('profile')
          .select('*')
          .eq('role', 'proveedor')
          .eq('active', true);

        if (supabaseError) throw supabaseError;
        if (isMounted) setProviders(data || []);
      } catch (err: any) {
        console.error('Error fetching providers:', err.message);
      }
    };

    // 1. Carga inicial de datos
    fetchBills();
    fetchProviders();

    // 2. Escuchador de visibilidad (YouTube/Otras pestañas)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Pestaña visible: Disparando refetch...');
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Suscripción Realtime (WebSockets)
    const billsChannel = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          if (!isMounted) return;
          console.log('📊 Cambio detectado vía Realtime:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            setBills((prev) => [payload.new as Bill, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBills((prev) =>
              prev.map((bill) =>
                bill.id === payload.new.id ? (payload.new as Bill) : bill
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setBills((prev) => prev.filter((bill) => bill.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Estado del canal Realtime:', status);
      });

    // Cleanup al desmontar el componente
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
      
      // Actualización optimista local
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error al eliminar factura:', err.message);
      return false;
    }
  }, []);

  // Formateador de nombres de proveedor
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