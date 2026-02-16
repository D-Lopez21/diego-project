import React, { useEffect, useRef } from 'react'; // ← Agrega useRef
import { DashboardLayout, Button } from './common';
import ProviderRegistrationModal from './ProviderRegistrationModal';
import ProvidersTable from './ProvidersTable';
import { useGetAllProviders } from '../hooks/useGetAllProviders';
import type { Profile } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProvidersPage() {
  const { providers, loading, updateProvider, deleteProvider, refetch } = useGetAllProviders();
  
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [providerToEdit, setProviderToEdit] = React.useState<Profile | null>(null);

  // 🔍 NUEVO: Rastrear qué causa re-renders
  const renderCount = useRef(0);
  const prevProviders = useRef(providers);
  const prevLoading = useRef(loading);
  const prevSearchTerm = useRef(searchTerm);
  const prevModalIsOpen = useRef(modalIsOpen);

  useEffect(() => {
    renderCount.current += 1;
    
    console.log('🔄 ===== RE-RENDER #', renderCount.current, '=====');
    
    if (prevProviders.current !== providers) {
      console.log('  📊 Cambió PROVIDERS:', prevProviders.current.length, '→', providers.length);
    }
    if (prevLoading.current !== loading) {
      console.log('  ⏳ Cambió LOADING:', prevLoading.current, '→', loading);
    }
    if (prevSearchTerm.current !== searchTerm) {
      console.log('  🔎 Cambió SEARCH:', prevSearchTerm.current, '→', searchTerm);
    }
    if (prevModalIsOpen.current !== modalIsOpen) {
      console.log('  🪟 Cambió MODAL:', prevModalIsOpen.current, '→', modalIsOpen);
    }

    // Actualizar refs
    prevProviders.current = providers;
    prevLoading.current = loading;
    prevSearchTerm.current = searchTerm;
    prevModalIsOpen.current = modalIsOpen;
  });

  // 🔍 DEBUGGING: Ver montaje y desmontaje
  useEffect(() => {
    console.log('🏢 ===== ProvidersPage MONTADA =====');
    
    return () => {
      console.log('🏢 ===== ProvidersPage DESMONTADA =====');
    };
  }, []);

  // 🔍 DEBUGGING: Ver cambios de estado
  useEffect(() => {
    console.log('📊 ProvidersPage - Estado actualizado:');
    console.log('  - Providers:', providers.length);
    console.log('  - Loading:', loading);
    console.log('  - Canales activos:', supabase.getChannels().length);
  }, [providers, loading]);

  console.log('🎨 ProvidersPage renderizando #', renderCount.current);

  const handleEdit = (provider: Profile) => {
    setProviderToEdit(provider);
    setModalIsOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${name}?`)) {
      try {
        await deleteProvider(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  return (
    <DashboardLayout title="Gestión de Proveedores" returnTo="/">
      
      {/* 🔍 DEBUGGING VISUAL */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.9)', 
        color: 'white', 
        padding: '12px',
        borderRadius: '8px',
        zIndex: 9999,
        fontSize: '11px',
        fontFamily: 'monospace',
        minWidth: '220px'
      }}>
        <div><strong>🔍 DEBUG INFO</strong></div>
        <div>📊 Providers: {providers.length}</div>
        <div>⏳ Loading: {loading ? 'SÍ' : 'NO'}</div>
        <div>📡 Canales: {supabase.getChannels().length}</div>
        <div>🔎 Búsqueda: {searchTerm || '(vacío)'}</div>
        <div>🔄 Renders: {renderCount.current}</div>
      </div>

      {/* SECCIÓN DE BOTÓN Y FILTRO */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        
        <div className="flex bg-white border border-neutral-200 rounded-lg p-1 shadow-sm w-full sm:w-auto">
          <div className="flex items-center px-3 text-neutral-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Buscar proveedor o RIF..."
            className="text-sm px-2 py-1.5 outline-none w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => { setProviderToEdit(null); setModalIsOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Proveedor</span>
        </Button>
      </div>

      <ProvidersTable 
        providers={providers} 
        loading={loading}
        searchTerm={searchTerm} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <ProviderRegistrationModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        providerToEdit={providerToEdit}
        onUpdate={updateProvider}
        onProviderRegistered={refetch}
      />
    </DashboardLayout>
  );
}