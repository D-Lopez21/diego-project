// Archivo: BillsDetailsPage.tsx
// Copiar este contenido completo
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importante para la redirección tras crear
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
import { useGetAllUsers } from '../../hooks/useGetAllUsers';
import { useGetAllProviders } from '../../hooks/useGetAllProviders';
import FinishSection from './FinishSection';
import PaymentSection from './PaymentSection';
import ScheduleSection from './ScheduleSection';
import AuditSection from './AuditSection';
import LiquidationSection from './LiquidationSection';
import ReceptionSection from './ReceptionSection';

// Utility para inputs de tipo date
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
  const { users: allUsers } = useGetAllUsers(); // Todos los usuarios para mostrar valores
  const { users: analysts } = useGetAllUsersFiltered('recepcion');
  const { users: analystsLiquidadores } = useGetAllUsersFiltered('liquidacion');
  const { users: auditores } = useGetAllUsersFiltered('auditoria');
  const { users: programadores } = useGetAllUsersFiltered('programacion');
  const { users: pagadores } = useGetAllUsersFiltered('pagos');
  const { users: finiquitadores } = useGetAllUsersFiltered('finiquito');

  // Estado para el rol del usuario actual
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Cargar rol del usuario actual
  React.useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Obtener el rol del perfil
        const { data: profile } = await supabase
          .from('profile')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUserRole(profile.role);
          console.log('👤 Usuario actual - Rol:', profile.role);
        }
      }
    };
    loadCurrentUser();
  }, []);

  // Función para verificar permisos de edición
  const canEditSection = (section: SectionId): boolean => {
    if (!currentUserRole) return false;
    
    // Admin puede editar todo
    if (currentUserRole === 'admin') return true;
    
    // Mapeo de secciones a roles permitidos
    const sectionRoleMap: Record<SectionId, string[]> = {
      recepcion: ['recepcion'],
      liquidacion: ['liquidacion'],
      auditoria: ['auditoria'],
      programacion: ['admin', 'programacion'], // Admin o programacion
      ejecucion: ['pagos'],
      finiquito: ['finiquito'],
    };
    
    return sectionRoleMap[section]?.includes(currentUserRole) || false;
  };

  // DEBUG: Check what hooks are returning
  React.useEffect(() => {
    console.log('🔍 BillsDetailsPage - Hooks data:');
    console.log('  providers:', providers);
    console.log('  analysts (recepcion):', analysts);
    console.log('  analystsLiquidadores:', analystsLiquidadores);
    console.log('  auditores:', auditores);
  }, [providers, analysts, analystsLiquidadores, auditores]);

  const [currentBill, setCurrentBill] = React.useState<Bill | null>(null);
  const [loading, setLoading] = React.useState(false);

  // --- ESTADOS DE LOS FORMULARIOS (TUS ORIGINALES) ---
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

  const [auditoriaData, setAuditoriaData] = React.useState<AuditoriaData>({
    fecha_auditoria: '',
    auditor: '',
  });

  const [programacionData, setProgramacionData] = React.useState<ProgramacionData>({
    fecha_programacion: '',
    decision_adm: '',
    analyst_programador: '',
  });

  const [ejecucionData, setEjecucionData] = React.useState<EjecucionData>({
    fecha_pago: '',
    monto_bs: '',
    tcr: '',
    ref_en_dolares: '',
    ref_bancaria: '',
    diferencia_vertice: '',
    diferencia_proveedor: '',
    analyst_pagador: '',
  });

  const [finiquitoData, setFiniquitoData] = React.useState<FiniquitoData>({
    fecha_envio: '',
    analyst_finiquito: '',
  });

  // --- CARGA DE DATOS ---
  const loadBillData = async (id: string) => {
    if (!id || id === 'create-bill') return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('bills').select('*').eq('id', id).single();

      if (error) throw error;

      if (data) {
        setCurrentBill(data);
        // Sincronización con nombres de columnas reales de Supabase
        setRecepcionData({
          arrival_date: formatDateForInput(data.arrival_date),
          suppliers_id: data.suppliers_id || '',
          n_claim: data.n_claim || '',
          type: data.type || '',
          n_billing: data.n_billing || '',
          n_control: data.n_control || '',
          currency_type: data.currency_type || '',
          total_billing: data.total_billing || '',
          analyst_receptor_id: data.analyst_receptor_id || '',
        });

        setLiquidacionData({
          fecha_liquidacion: data.severance_date ? formatDateForInput(data.severance_date) : '',
          tipo_siniestro: data.claim_type || '',
          monto_fact: data.total_billing != null ? String(data.total_billing) : '',
          monto_amp: data.monto_amp != null ? String(data.monto_amp) : '',
          gna: data.gna != null ? String(data.gna) : '',
          honorarios_medic: data.medical_honoraries != null ? String(data.medical_honoraries) : '',
          servicios_clinicos: data.clinical_services != null ? String(data.clinical_services) : '',
          retention_rate: data.retention_rate != null ? String(data.retention_rate) : '',
          monto_indemniz: data.indemnizable_rate != null ? String(data.indemnizable_rate) : '',
          nomenclature_pile: data.nomenclature_pile || '',
          analyst_liquidador: data.analyst_severance || '',
        });

        setAuditoriaData({
          fecha_auditoria: data.audit_date ? formatDateForInput(data.audit_date) : '',
          auditor: data.auditor || '',
        });

        setProgramacionData({
          fecha_programacion: data.programmed_date ? formatDateForInput(data.programmed_date) : '',
          decision_adm: data.admin_decision || '',
          analyst_programador: data.analyst_paid || '', // Ajusta si tienes otro campo
        });

        setEjecucionData({
          fecha_pago: data.paid_date ? formatDateForInput(data.paid_date) : '',
          monto_bs: data.bs_amount != null ? String(data.bs_amount) : '',
          tcr: data.tcr_amount != null ? String(data.tcr_amount) : '',
          ref_en_dolares: data.dollar_amount != null ? String(data.dollar_amount) : '',
          ref_bancaria: data.transfer_ref || '',
          diferencia_vertice: data.vertice_difference != null ? String(data.vertice_difference) : '',
          diferencia_proveedor: data.provider_difference != null ? String(data.provider_difference) : '',
          analyst_pagador: data.analyst_paid || '',
        });

        setFiniquitoData({
          fecha_envio: data.settlement_date ? formatDateForInput(data.settlement_date) : '',
          analyst_finiquito: data.analyst_settlement || '',
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

  // --- GUARDADO DE SECCIONES (AJUSTADO) ---
  const handleSaveSection = async (section: string, data: any) => {
    try {
      setLoading(true);
      const isCreating = !billId || billId === 'create-bill';

      if (isCreating && section === 'recepcion') {
        const { data: newBill, error } = await supabase
          .from('bills')
          .insert([
            {
              arrival_date: data.arrival_date || new Date().toISOString(),
              suppliers_id: data.suppliers_id || null,
              n_claim: data.n_claim || '',
              type: data.type === 'DNF' ? 'DNF' : 'FACTURA',
              n_billing: data.n_billing || '',
              n_control: data.n_control || '',
              currency_type: data.currency_type === 'USD' ? 'USD' : 'VES',
              total_billing: data.total_billing ? parseFloat(data.total_billing) : 0,
              analyst_receptor_id: data.analyst_receptor_id || null,
              state: 'recibida',
              state_sequence: 'recepcion',
              active: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        alert('Factura creada exitosamente');
        navigate(`/bills/${newBill.id}`, { replace: true });

      } else if (!isCreating && billId) {
        let updatePayload = {};

        // Mapeamos según la sección activa para actualizar solo lo necesario
        if (section === 'recepcion') {
          updatePayload = {
            arrival_date: data.arrival_date,
            suppliers_id: data.suppliers_id,
            n_claim: data.n_claim,
            type: data.type === 'DNF' ? 'DNF' : 'FACTURA',
            n_billing: data.n_billing,
            n_control: data.n_control,
            currency_type: data.currency_type,
            total_billing: parseFloat(data.total_billing),
            analyst_receptor_id: data.analyst_receptor_id,
          };
        } else if (section === 'liquidacion') {
          updatePayload = {
            severance_date: data.fecha_liquidacion || null,
            claim_type: data.tipo_siniestro || null,
            monto_amp: parseFloat(data.monto_amp) || 0,
            gna: parseFloat(data.gna) || 0,
            medical_honoraries: parseFloat(data.honorarios_medic) || 0,
            clinical_services: parseFloat(data.servicios_clinicos) || 0,
            // retention_rate se calcula automáticamente en Supabase (total_billing * 0.05)
            // NO incluir retention_rate aquí para evitar el error de actualización
            indemnizable_rate: parseFloat(data.monto_indemniz) || 0,
            nomenclature_pile: data.nomenclature_pile || null,
            analyst_severance: data.analyst_liquidador || null,
            state_sequence: 'liquidacion',
          };
        } else if (section === 'auditoria') {
          updatePayload = {
            audit_date: data.fecha_auditoria || null,
            auditor: data.auditor || null,
            state_sequence: 'auditoria',
          };
        } else if (section === 'programacion') {
          updatePayload = {
            programmed_date: data.fecha_programacion || null,
            admin_decision: data.decision_adm || null,
            analyst_paid: data.analyst_programador || null,
            state: 'programado', // Estado de la factura
            state_sequence: 'programacion', // Flujo del proceso
          };
        } else if (section === 'ejecucion') {
          updatePayload = {
            paid_date: data.fecha_pago || null,
            bs_amount: data.monto_bs ? parseFloat(data.monto_bs) : 0,
            tcr_amount: data.tcr ? parseFloat(data.tcr) : 0,
            dollar_amount: data.ref_en_dolares ? parseFloat(data.ref_en_dolares) : 0,
            transfer_ref: data.ref_bancaria || null,
            vertice_difference: data.diferencia_vertice ? parseFloat(data.diferencia_vertice) : 0,
            provider_difference: data.diferencia_proveedor ? parseFloat(data.diferencia_proveedor) : 0,
            analyst_paid: data.analyst_pagador || null,
            state: 'pagado', // Estado de la factura
            state_sequence: 'pagos', // Flujo del proceso (es 'pagos' no 'ejecucion')
          };
        } else if (section === 'finiquito') {
          updatePayload = {
            settlement_date: data.fecha_envio || null,
            analyst_settlement: data.analyst_finiquito || null,
            state_sequence: 'finiquito', // Flujo del proceso
          };
        }
        // ...

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
      } else {
        alert('Primero debes crear la factura en la sección de RECEPCION');
      }
    } catch (error: any) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'recepcion' as SectionId, label: 'RECEPCION' },
    { id: 'liquidacion' as SectionId, label: 'LIQUIDACION' },
    { id: 'auditoria' as SectionId, label: 'AUDITORIA' },
    { id: 'programacion' as SectionId, label: 'PROGRAMACION' },
    { id: 'ejecucion' as SectionId, label: 'EJECUCION' },
    { id: 'finiquito' as SectionId, label: 'FINIQUITO' },
  ];

  const billExists = !!billId && billId !== 'create-bill';

  return (
    <DashboardLayout title={billExists ? 'Editar Factura' : 'Nueva Factura'} returnTo="/bills">
      <TabSelector
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="min-h-100 p-4">
        {activeSection === 'recepcion' && (
          <ReceptionSection
            data={recepcionData}
            setData={setRecepcionData}
            providers={providers}
            analysts={analysts}
            allUsers={allUsers}
            onSave={() => handleSaveSection('recepcion', recepcionData)}
            isNewBill={!billExists}
            loading={loading}
            canEdit={canEditSection('recepcion')}
            userRole={currentUserRole}
          />
        )}

        {activeSection === 'liquidacion' && (
          <LiquidationSection
            data={liquidacionData}
            setData={setLiquidacionData}
            onSave={() => handleSaveSection('liquidacion', liquidacionData)}
            billExists={billExists}
            loading={loading}
            analysts={analystsLiquidadores}
            allUsers={allUsers}
            canEdit={canEditSection('liquidacion')}
            userRole={currentUserRole}
          />
        )}

        {activeSection === 'auditoria' && (
          <AuditSection
            data={auditoriaData}
            setData={setAuditoriaData}
            onSave={() => handleSaveSection('auditoria', auditoriaData)}
            billExists={billExists}
            loading={loading}
            auditores={auditores}
            allUsers={allUsers}
            canEdit={canEditSection('auditoria')}
            userRole={currentUserRole}
          />
        )}

        {activeSection === 'programacion' && (
          <ScheduleSection
            data={programacionData}
            setData={setProgramacionData}
            onSave={() => handleSaveSection('programacion', programacionData)}
            billExists={billExists}
            loading={loading}
            programadores={programadores}
            allUsers={allUsers}
            canEdit={canEditSection('programacion')}
            userRole={currentUserRole}
          />
        )}

        {activeSection === 'ejecucion' && (
          <PaymentSection
            data={ejecucionData}
            setData={setEjecucionData}
            onSave={() => handleSaveSection('ejecucion', ejecucionData)}
            billExists={billExists}
            loading={loading}
            pagadores={pagadores}
            allUsers={allUsers}
            canEdit={canEditSection('ejecucion')}
            userRole={currentUserRole}
          />
        )}

        {activeSection === 'finiquito' && (
          <FinishSection
            data={finiquitoData}
            setData={setFiniquitoData}
            onSave={() => handleSaveSection('finiquito', finiquitoData)}
            billExists={billExists}
            loading={loading}
            finiquitadores={finiquitadores}
            allUsers={allUsers}
            canEdit={canEditSection('finiquito')}
            userRole={currentUserRole}
          />
        )}
      </div>
    </DashboardLayout>
  );
}