import React from 'react';
import { Button, Input, Select } from '../common';
import Modal from './BillModal';

const CLAIM_TYPES = [
  'AMBULATORIO', 'APS', 'CARTA AVAL', 'FARMACIA', 'HOSPITALIZACION',
  'JORNADA', 'LABORATORIO', 'ONCOLOGICO', 'TRASLADO EN AMBULANCIA',
  'HOME CARE', 'PREGRADO', 'JUNTA MEDICA',
];

export default function LiquidationSection({
  data,
  setData,
  onSave,
  billExists,
  loading,
  allUsers,
  canEdit,
  userRole,
  billState,
  currentBill,
}: any) {
  const [modalOpen, setModalOpen] = React.useState(false);

  // --- LÓGICA DE INPUTS ---
  const handleInputChange = (fieldName: string, value: string) => {
    let cleanValue = value;
    if ((data[fieldName] === '0' || data[fieldName] === 0) && value.length > 1) {
      cleanValue = value.replace(/^0+/, '');
    }
    setData({ ...data, [fieldName]: cleanValue });
  };

  // --- CÁLCULOS ---
  const montoFactNum = parseFloat(data.monto_fact) || 0;
  const gna = parseFloat(data.gna) || 0;
  const honorarios = parseFloat(data.honorarios_medic) || 0;
  const servicios = parseFloat(data.servicios_clinicos) || 0;

  const montoAmp = gna + honorarios + servicios;
  const retencion = montoFactNum * 0.05;
  const montoIndemniz = montoAmp - retencion;

  React.useEffect(() => {
    if (data.monto_amp !== String(montoAmp) || data.monto_indemniz !== String(montoIndemniz)) {
      setData({ ...data, monto_amp: String(montoAmp), monto_indemniz: String(montoIndemniz) });
    }
  }, [montoAmp, montoIndemniz]);

  const montosCoinciden = Math.abs(montoAmp - montoFactNum) < 0.01;

  const receptorNombre =
    allUsers?.find((u: any) => u.id === currentBill?.analyst_receptor_id)?.full_name || allUsers?.find((u: any) => u.id === currentBill?.analyst_receptor_id)?.name || 'DIEGO LOPEZ';

  // Mismo patrón que getAnalystName() en ReceptionSection
  const getLiquidadorName = () => {
    const analystId = data.analyst_liquidador || currentBill?.analyst_severance;
    if (!analystId) return 'Pendiente';
    const analyst = allUsers?.find((u: any) => u.id === analystId);
    return analyst?.full_name || analyst?.name || 'Desconocido';
  };

  if (!billExists) return null;

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR DE ESTADO */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span>
          Acceso: <span className="text-slate-800">{userRole || 'ADMIN'}</span>
        </span>
        <span>
          Estado Factura: <span className="text-blue-600">{billState || 'PENDIENTE'}</span>
        </span>
        <span>
          Receptor Original: <span className="text-slate-800">{receptorNombre}</span>
        </span>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Header de la card */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Detalles de la Liquidación
          </h3>
        </div>

        {/* Cuerpo de la card */}
        <div className="p-6 space-y-6">

          {/* Fila 1: Fecha y Tipo de Siniestro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Input
              label="Fecha de Liquidación"
              value={data.fecha_liquidacion}
              disabled
              readOnly
            />
            <Select
              label="Tipo de Siniestro *"
              value={data.tipo_siniestro}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setData({ ...data, tipo_siniestro: e.target.value })
              }
              options={CLAIM_TYPES.map((t) => ({ value: t, label: t }))}
              disabled={!canEdit}
            />
          </div>

          {/* Fila 2: Monto Facturado, Monto AMP, GNA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
            <Input
              label="Monto Facturado *"
              value={data.monto_fact}
              disabled
              readOnly
            />

            {/* Monto AMP con indicador de color */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto AMP (Auto)
              </label>
              <div
                className={`w-full px-4 py-2.5 rounded-lg border font-bold transition-all
                  ${montosCoinciden
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                  }`}
              >
                {montoAmp.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <Input
              label="GNA"
              type="number"
              value={data.gna}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('gna', e.target.value)
              }
              disabled={!canEdit}
            />
          </div>

          {/* Fila 3: Honorarios, Servicios Clínicos, Retención */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
            <Input
              label="Honorarios Médicos"
              type="number"
              value={data.honorarios_medic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('honorarios_medic', e.target.value)
              }
              disabled={!canEdit}
            />
            <Input
              label="Servicios Clínicos"
              type="number"
              value={data.servicios_clinicos}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('servicios_clinicos', e.target.value)
              }
              disabled={!canEdit}
            />

            {/* Retención (solo lectura, tono apagado) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Retención 5% (Calculada)
              </label>
              <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                {retencion.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Fila 4: Monto Indemnizado y Nomenclatura de Lote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Indemnizado
              </label>
              <div
                className={`w-full px-4 py-2.5 rounded-lg border font-bold transition-all
                  ${montoIndemniz > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
              >
                {montoIndemniz > 0
                  ? montoIndemniz.toLocaleString('es-VE', { minimumFractionDigits: 2 })
                  : '0,00'}
              </div>
            </div>

            <Input
              label="Nomenclatura de Lote *"
              value={data.nomenclature_pile}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData({ ...data, nomenclature_pile: e.target.value })
              }
              disabled={!canEdit}
            />
          </div>

          {/* Sección Analista Liquidador — fuera del grid, ancho completo */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">
                Analista Liquidador
              </label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-slate-700">
                  {currentBill ? getLiquidadorName() : 'Pendiente por asignar'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic max-w-[150px] text-right">
              Se registrará automáticamente al guardar la liquidación.
            </p>
          </div>

        </div>
      </div>

      {/* BOTÓN DE GUARDAR */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => onSave(data)}
          disabled={loading || !canEdit || !montosCoinciden || !data.tipo_siniestro}
          className="min-w-[200px] py-2.5 rounded-lg shadow-sm font-bold transition-all active:scale-95 hover:shadow-md"
        >
          {loading ? 'Guardando...' : 'Guardar Liquidación'}
        </Button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} message="Error" type="error" />
    </div>
  );
}