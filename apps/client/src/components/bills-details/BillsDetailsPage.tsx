import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DashboardLayout, TabSelector } from '../common';
import type {
  AuditoriaData,
  Bill,
  EjecucionData,
  FiniquitoData,
  LiquidacionData,
  ProgramacionData,
  RecepcionData,
  SectionId,
} from './interfaces';
import { useGetAllUsersFiltered } from '../../hooks/useGetAllUsersFiltered';
import { useGetAllProviders } from '../../hooks/useGetAllProviders';
import FinishSection from './FinishSection';
import PaymentSection from './PaymentSection';
import ScheduleSection from './ScheduleSection';
import AuditSection from './AuditSection';
import LiquidationSection from './LiquidationSection';
import ReceptionSection from './ReceptionSection';

// Función para formatear fechas y evitar el warning de consola
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

export default function BillsDetailsPage({
  billId,
}: {
  billId?: string | null;
}) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState<SectionId>('recepcion');
  const { providers } = useGetAllProviders();
  const { users: analysts } = useGetAllUsersFiltered('recepcion');

  const [currentBill, setCurrentBill] = React.useState<Bill | null>(null);
  const [loading, setLoading] = React.useState(false);

  // --- ESTADOS DE LOS FORMULARIOS ---
  const [recepcionData, setRecepcionData] = React.useState<RecepcionData>({
    arrival_date: '',
    suppliers_id: '',
    n_claim: '',
    type: '', 
    n_billing: '',
    n_control: '',
    currency_type: '',
    total_billing: '',
    analyst_receptor_id: '', 
  });

  const [liquidacionData, setLiquidacionData] = React.useState<LiquidacionData>({
    fecha_liquidacion: '',
    tipo_siniestro: '',
    monto_fact: '',
    monto_amp: '',
    gna: '',
    honorarios_medic: '',
    servicios_clinicos: '',
    retention_rate: '',
    monto_indemniz: '',
    nomenclature_pile: '',
    analyst_liquidador: '',
  });

  // --- LÓGICA DE CARGA DE DATOS ---
  const loadBillData = async (id: string) => {
    if (!id || id === 'create-bill') return; // Evita error de sintaxis UUID
    try {
      setLoading(true);
      const { data, error } = await supabase.from('bills').select('*').eq('id', id).single();
      
      if (error) throw error;

      if (data) {
        setCurrentBill(data);
        setRecepcionData({
          arrival_date: formatDateForInput(data.arrival_date), // Mapeo arrival_date
          suppliers_id: data.suppliers_id || '',
          n_claim: data.n_claim || '',
          type: data.type || '', // Mapeo type (ENUM document_type)
          n_billing: data.n_billing || '',
          n_control: data.n_control || '',
          currency_type: data.currency_type || '',
          total_billing: data.total_billing || '',
          analyst_receptor_id: data.analyst_reception_id || '', // Mapeo analyst_reception_id
        });
        
        // Carga de datos de liquidación
        setLiquidacionData({
          fecha_liquidacion: formatDateForInput(data.severance_date), //
          tipo_siniestro: data.claim_type || '',
          monto_fact: data.total_billing || '',
          monto_amp: '', // Ajustar según columnas adicionales
          gna: '', 
          honorarios_medic: data.medical_honoraries || '', //
          servicios_clinicos: data.clinical_services || '', //
          retention_rate: data.retention_rate || '',
          monto_indemniz: data.indemnizable_rate || '',
          nomenclature_pile: data.nomenclature_pile || '',
          analyst_liquidador: data.analyst_severance || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading bill:', error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (billId && billId !== 'create-bill') {
      loadBillData(billId);
    }
  }, [billId]);

  // --- LÓGICA DE GUARDADO ---
  const handleSaveSection = async (section: string, data: any) => {
    try {
      setLoading(true);
      const isCreating = !billId || billId === 'create-bill';

      if (isCreating && section === 'recepcion') {
        // CREACIÓN DE NUEVA FACTURA
        const { data: newBill, error } = await supabase
          .from('bills')
          .insert([
            {
              arrival_date: data.arrival_date || new Date().toISOString(),
              suppliers_id: data.suppliers_id || null,
              n_claim: data.n_claim || '',
              type: data.type === 'DNF' ? 'DNF' : 'FACTURA', //
              n_billing: data.n_billing || '',
              n_control: data.n_control || '',
              currency_type: data.currency_type === 'USD' ? 'USD' : 'VES', //
              total_billing: data.total_billing ? parseFloat(data.total_billing) : 0,
              analyst_reception_id: data.analyst_receptor_id || null, //
              state: 'recibida', //
              state_sequence: 'recepcion', //
              active: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        alert('Factura creada exitosamente');
        navigate(`/bills/${newBill.id}`, { replace: true });

      } else if (!isCreating && billId) {
        // ACTUALIZACIÓN DE SECCIONES
        let updatePayload = {};

        if (section === 'recepcion') {
          updatePayload = {
            arrival_date: data.arrival_date,
            suppliers_id: data.suppliers_id,
            n_claim: data.n_claim,
            type: data.type,
            n_billing: data.n_billing,
            n_control: data.n_control,
            currency_type: data.currency_type,
            total_billing: parseFloat(data.total_billing),
            analyst_reception_id: data.analyst_receptor_id,
          };
        } else if (section === 'liquidacion') {
          updatePayload = {
            severance_date: data.fecha_liquidacion,
            medical_honoraries: parseFloat(data.honorarios_medic) || 0,
            clinical_services: parseFloat(data.servicios_clinicos) || 0,
            retention_rate: parseFloat(data.retention_rate) || 0,
            indemnizable_rate: parseFloat(data.monto_indemniz) || 0,
            analyst_severance: data.analyst_liquidador || null,
            state_sequence: 'liquidacion', // Avanza la secuencia
          };
        }

        const { error } = await supabase
          .from('bills')
          .update({
            ...updatePayload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', billId);

        if (error) throw error;
        alert(`Sección ${section.toUpperCase()} guardada exitosamente`);
        await loadBillData(billId);
      }
    } catch (error: any) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const billExists = !!billId && billId !== 'create-bill';

  return (
    <DashboardLayout title={billExists ? 'Editar Factura' : 'Nueva Factura'} returnTo="/bills">
      {/* Eliminado 'color' para evitar error de TypeScript */}
      <TabSelector
        sections={[
          { id: 'recepcion', label: 'RECEPCION' },
          { id: 'liquidacion', label: 'LIQUIDACION' },
          { id: 'auditoria', label: 'AUDITORIA' },
          { id: 'programacion', label: 'PROGRAMACION' },
          { id: 'ejecucion', label: 'EJECUCION' },
          { id: 'finiquito', label: 'FINIQUITO' },
        ]}
        activeSection={activeSection}
        onSectionChange={(id) => setActiveSection(id as SectionId)}
      />

      <div className="p-4">
        {activeSection === 'recepcion' && (
          <ReceptionSection
            data={recepcionData}
            setData={setRecepcionData}
            providers={providers}
            analysts={analysts}
            onSave={() => handleSaveSection('recepcion', recepcionData)}
            isNewBill={!billExists}
            loading={loading}
          />
        )}

        {activeSection === 'liquidacion' && (
          <LiquidationSection
            data={liquidacionData}
            setData={setLiquidacionData}
            onSave={() => handleSaveSection('liquidacion', liquidacionData)}
            billExists={billExists}
            loading={loading}
          />
        )}
        
        {/* Aquí puedes seguir añadiendo las demás secciones bajo el mismo patrón */}
      </div>
    </DashboardLayout>
  );
}