/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../components/bills-details/interfaces';
import { useAuth } from './useAuth'; // ✅ Importar useAuth

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
  const { user } = useAuth(); // ✅ Obtener usuario actual
  
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
      
      // ✅ Construir query base
      let query = supabase
        .from('bills')
        .select('*');
      
      // ✅ Si el usuario es proveedor, filtrar por su suppliers_id
      if (user?.profile?.role === 'proveedor' && user?.profile?.suppliers_id) {
        console.log('👤 Usuario proveedor detectado, filtrando por suppliers_id:', user.profile.suppliers_id);
        query = query.eq('suppliers_id', user.profile.suppliers_id);
      }
      
      // ✅ Ordenar por fecha
      query = query.order('arrival_date', { ascending: false });

      const { data, error: sbError } = await query;

      if (sbError) throw sbError;
      
      const result = data || [];
      cachedBills = result; // Actualizamos caché global
      setBills(result);
      console.log(`✅ Datos actualizados: ${result.length} facturas.`);
    } catch (err: any) {
      console.error("❌ Error en refetch:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ Agregar user como dependencia

  React.useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // Si ya tenemos caché, no bloqueamos la UI
      if (cachedBills.length === 0) setLoading(true);

      try {
        // ✅ Construir query base para bills
        let billsQuery = supabase
          .from('bills')
          .select('*');
        
        // ✅ Si el usuario es proveedor, filtrar por su suppliers_id
        if (user?.profile?.role === 'proveedor' && user?.profile?.suppliers_id) {
          console.log('👤 Usuario proveedor, filtrando facturas...');
          billsQuery = billsQuery.eq('suppliers_id', user.profile.suppliers_id);
        }
        
        billsQuery = billsQuery.order('arrival_date', { ascending: false });

        const [bRes, pRes] = await Promise.all([
          billsQuery,
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
          
          console.log(`✅ Carga inicial: ${cachedBills.length} facturas cargadas`);
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

    // ✅ Configurar suscripción en tiempo real con filtro
    const channelName = user?.profile?.role === 'proveedor' 
      ? `bills-changes-${user.profile.suppliers_id}` 
      : 'bills-changes';

    let channel = supabase.channel(channelName);

    // ✅ Si es proveedor, solo escuchar cambios en sus facturas
    if (user?.profile?.role === 'proveedor' && user?.profile?.suppliers_id) {
      channel = channel.on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bills',
          filter: `suppliers_id=eq.${user.profile.suppliers_id}` // ✅ Filtro en tiempo real
        }, 
        () => {
          if (isMounted) {
            console.log('🔔 Cambio detectado en facturas del proveedor');
            refetch(false);
          }
        }
      );
    } else {
      // ✅ Admin y otros roles ven todas las facturas
      channel = channel.on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'bills' }, 
        () => {
          if (isMounted) {
            console.log('🔔 Cambio detectado en facturas');
            refetch(false);
          }
        }
      );
    }

    channel.subscribe();

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [refetch, user]); // ✅ Agregar user como dependencia

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
    } catch (err: any) { 
      console.error('Error eliminando factura:', err);
      return false; 
    }
  }, []);

  const getProviderName = React.useCallback((id?: string) => {
    if (!id) return 'Sin proveedor';
    const p = providers.find(p => p.id === id);
    return p ? `${p.name}${p.rif ? ` - ${p.rif}` : ''}` : 'Cargando...';
  }, [providers]);

  return { bills, loading, error, getProviderName, deleteBill, refetch };
}