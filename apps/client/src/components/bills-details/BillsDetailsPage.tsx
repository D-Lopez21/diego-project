import React from 'react';
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

export default function BillsDetailsPage({
  billId,
}: {
  billId?: string | null;
}) {
  const [activeSection, setActiveSection] =
    React.useState<SectionId>('recepcion');
  // TODO: DESCOMENTAR CUANDO ESTEN LOS PROVEEDORES
  const { providers } = useGetAllProviders();

  const {users:  analysts } = useGetAllUsersFiltered('recepcion');

  const [currentBill, setCurrentBill] = React.useState<Bill | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [recepcionData, setRecepcionData] = React.useState<RecepcionData>({
    fecha_recepcion: '',
    suppliers_id: '',
    n_siniestro: '',
    fact_proform: '',
    n_fact: '',
    n_control: '',
    currency_type: '',
    total_billing: '',
    analyst_receptor_id: '',
  });

  const [liquidacionData, setLiquidacionData] = React.useState<LiquidacionData>(
    {
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
    }
  );

  const [auditoriaData, setAuditoriaData] = React.useState<AuditoriaData>({
    fecha_auditoria: '',
    auditor: '',
  });

  const [programacionData, setProgramacionData] =
    React.useState<ProgramacionData>({
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

  const loadBillData = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentBill(data);
        setRecepcionData({
          fecha_recepcion: data.fecha_recepcion || '',
          suppliers_id: data.suppliers_id || '',
          n_siniestro: data.n_siniestro || '',
          fact_proform: data.fact_proform || '',
          n_fact: data.n_fact || '',
          n_control: data.n_control || '',
          currency_type: data.currency_type || '',
          total_billing: data.total_billing || '',
          analyst_receptor_id: data.analyst_receptor_id || '',
        });

        setLiquidacionData({
          fecha_liquidacion: data.fecha_liquidacion || '',
          tipo_siniestro: data.tipo_siniestro || '',
          monto_fact: data.monto_fact || '',
          monto_amp: data.monto_amp || '',
          gna: data.gna || '',
          honorarios_medic: data.honorarios_medic || '',
          servicios_clinicos: data.servicios_clinicos || '',
          retention_rate: data.retention_rate || '',
          monto_indemniz: data.monto_indemniz || '',
          nomenclature_pile: data.nomenclature_pile || '',
          analyst_liquidador: data.analyst_liquidador || '',
        });

        setAuditoriaData({
          fecha_auditoria: data.fecha_auditoria || '',
          auditor: data.auditor || '',
        });

        setProgramacionData({
          fecha_programacion: data.fecha_programacion || '',
          decision_adm: data.decision_adm || '',
          analyst_programador: data.analyst_programador || '',
        });

        setEjecucionData({
          fecha_pago: data.fecha_pago || '',
          monto_bs: data.monto_bs || '',
          tcr: data.tcr || '',
          ref_en_dolares: data.ref_en_dolares || '',
          ref_bancaria: data.ref_bancaria || '',
          diferencia_vertice: data.diferencia_vertice || '',
          diferencia_proveedor: data.diferencia_proveedor || '',
          analyst_pagador: data.analyst_pagador || '',
        });

        setFiniquitoData({
          fecha_envio: data.fecha_envio || '',
          analyst_finiquito: data.analyst_finiquito || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading bill:', error.message);
      alert('Error al cargar la factura');
    } finally {
      setLoading(false);
    }
  };

  const resetAllForms = () => {
    setRecepcionData({
      fecha_recepcion: '',
      suppliers_id: '',
      n_siniestro: '',
      fact_proform: '',
      n_fact: '',
      n_control: '',
      currency_type: '',
      total_billing: '',
      analyst_receptor_id: '',
    });
    setLiquidacionData({
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
    setAuditoriaData({ fecha_auditoria: '', auditor: '' });
    setProgramacionData({
      fecha_programacion: '',
      decision_adm: '',
      analyst_programador: '',
    });
    setEjecucionData({
      fecha_pago: '',
      monto_bs: '',
      tcr: '',
      ref_en_dolares: '',
      ref_bancaria: '',
      diferencia_vertice: '',
      diferencia_proveedor: '',
      analyst_pagador: '',
    });
    setFiniquitoData({ fecha_envio: '', analyst_finiquito: '' });
  };

  const handleSaveSection = async (section: string, data: any) => {
    try {
      setLoading(true);

      if (!billId && section === 'recepcion') {
        // Crear nueva factura
        const { data: newBill, error } = await supabase
          .from('bills')
          .insert([
            {
              ...data,
              state: 'Recepción',
              active: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setCurrentBill(newBill);
        alert('Factura creada exitosamente');
      } else if (billId) {
        // Actualizar factura existente
        const { error } = await supabase
          .from('bills')
          .update({
            ...data,
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
      console.error('Error saving section:', error.message);
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'recepcion' as SectionId, label: 'RECEPCION', color: 'pink' },
    { id: 'liquidacion' as SectionId, label: 'LIQUIDACION', color: 'green' },
    { id: 'auditoria' as SectionId, label: 'AUDITORIA', color: 'orange' },
    { id: 'programacion' as SectionId, label: 'PROGRAMACION', color: 'blue' },
    { id: 'ejecucion' as SectionId, label: 'EJECUCION', color: 'yellow' },
    { id: 'finiquito' as SectionId, label: 'FINIQUITO', color: 'pink' },
  ];

  return (
    <DashboardLayout title={billId ? 'Editar Factura' : 'Nueva Factura'} returnTo="/bills">
      <TabSelector
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Contenido de la sección activa */}
      <div className="min-h-100">
        {activeSection === 'recepcion' && (
          <ReceptionSection
            data={recepcionData}
            setData={setRecepcionData}
            providers={providers}
            analysts={analysts}
            onSave={() => handleSaveSection('recepcion', recepcionData)}
            isNewBill={!billId}
            loading={loading}
          />
        )}

        {activeSection === 'liquidacion' && (
          <LiquidationSection
            data={liquidacionData}
            setData={setLiquidacionData}
            onSave={() => handleSaveSection('liquidacion', liquidacionData)}
            billExists={!!billId}
            loading={loading}
          />
        )}

        {activeSection === 'auditoria' && (
          <AuditSection
            data={auditoriaData}
            setData={setAuditoriaData}
            onSave={() => handleSaveSection('auditoria', auditoriaData)}
            billExists={!!billId}
            loading={loading}
          />
        )}

        {activeSection === 'programacion' && (
          <ScheduleSection
            data={programacionData}
            setData={setProgramacionData}
            onSave={() => handleSaveSection('programacion', programacionData)}
            billExists={!!billId}
            loading={loading}
          />
        )}

        {activeSection === 'ejecucion' && (
          <PaymentSection
            data={ejecucionData}
            setData={setEjecucionData}
            onSave={() => handleSaveSection('ejecucion', ejecucionData)}
            billExists={!!billId}
            loading={loading}
          />
        )}

        {activeSection === 'finiquito' && (
          <FinishSection
            data={finiquitoData}
            setData={setFiniquitoData}
            onSave={() => handleSaveSection('finiquito', finiquitoData)}
            billExists={!!billId}
            loading={loading}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
