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

// Variable fuera del hook para persistir datos entre navegaciones de menú
let cachedBills: Bill[] = [];
let cachedProviders: Provider[] = [];

export function useGetAllBills() {
  // Inicializamos con el caché para que la tabla no aparezca vacía al volver del menú
  const [bills, setBills] = React.useState<Bill[]>(cachedBills);
  const [providers, setProviders] = React.useState<Provider[]>(cachedProviders);
  
  // Solo mostramos loading si realmente no tenemos nada que mostrar
  const [loading, setLoading] = React.useState(cachedBills.length === 0);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Sincronizando datos...");
      const { data, error: sbError } = await supabase
        .from('bills')
        .select('*')
        .order('arrival_date', { ascending: false });

      if (sbError) throw sbError;
      
      const result = data || [];
      cachedBills = result; // Actualizamos caché global
      setBills(result);
      console.log("✅ Datos actualizados en el estado.");
    } catch (err: any) {
      console.error("❌ Error en refetch:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // Si ya tenemos caché, no bloqueamos la UI
      if (cachedBills.length === 0) setLoading(true);

      try {
        const [bRes, pRes] = await Promise.all([
          supabase.from('bills').select('*').order('arrival_date', { ascending: false }),
          supabase.from('profile').select('*').eq('role', 'proveedor').eq('active', true)
        ]);

        if (bRes.error) throw bRes.error;
        if (pRes.error) throw pRes.error;

        if (isMounted) {
          cachedBills = bRes.data || [];
          cachedProviders = pRes.data || [];
          setBills(cachedBills);
          setProviders(cachedProviders);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        refetch(false); // Refresco silencioso
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    const channel = supabase
      .channel('bills-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => {
        if (isMounted) refetch(false);
      })
      .subscribe();

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const deleteBill = React.useCallback(async (id: string) => {
    try {
      const { error: delError } = await supabase.from('bills').delete().eq('id', id);
      if (delError) throw delError;
      setBills(prev => {
        const filtered = prev.filter(b => b.id !== id);
        cachedBills = filtered;
        return filtered;
      });
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