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

  // --- REFETCH SEGURO ---
  const refetch = React.useCallback(async () => {
    // Si ya hay facturas cargadas, NO mostramos el texto de "Cargando..."
    // Esto evita que la pantalla se quede en blanco si el refetch tarda.
    if (bills.length === 0) setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Sincronizando datos...");
      const { data, error: sbError } = await supabase
        .from('bills')
        .select('*')
        .order('arrival_date', { ascending: false });

      if (sbError) throw sbError;
      
      setBills(data || []);
      console.log(`✅ Datos en estado: ${data?.length} facturas.`);
    } catch (err: any) {
      console.error("❌ Error en refetch:", err.message);
      setError(err.message);
    } finally {
      setLoading(false); 
    }
  }, [bills.length]);

  React.useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      // Forzamos un estado de carga limpio al iniciar
      if (isMounted) setLoading(true);
      
      try {
        const [bRes, pRes] = await Promise.all([
          supabase.from('bills').select('*').order('arrival_date', { ascending: false }),
          supabase.from('profile').select('*').eq('role', 'proveedor').eq('active', true)
        ]);

        if (bRes.error) throw bRes.error;
        if (pRes.error) throw pRes.error;

        if (isMounted) {
          setBills(bRes.data || []);
          setProviders(pRes.data || []);
          setError(null);
          console.log("🔥 Carga inicial completada con éxito");
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllData();

    // --- RE-SINCRO AL VOLVER DE YOUTUBE ---
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --- REALTIME ---
    const billsChannel = supabase
      .channel('bills-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => {
        if (isMounted) refetch();
      })
      .subscribe();

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(billsChannel);
    };
  }, [refetch]);

  const deleteBill = React.useCallback(async (id: string) => {
    try {
      const { error: delError } = await supabase.from('bills').delete().eq('id', id);
      if (delError) throw delError;
      setBills(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err: any) { return false; }
  }, []);

  const getProviderName = React.useCallback((id?: string) => {
    if (!id) return 'Sin proveedor';
    const p = providers.find(p => p.id === id);
    return p ? `${p.name}${p.rif ? ` - ${p.rif}` : ''}` : 'Cargando...';
  }, [providers]);

  return { bills, loading, error, getProviderName, deleteBill, refetch };
}