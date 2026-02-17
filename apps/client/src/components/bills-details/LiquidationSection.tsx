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

  // --- LÓGICA PARA REEMPLAZAR EL "0" INICIAL ---
  const handleInputChange = (fieldName: string, value: string) => {
    let cleanValue = value;
    if ((data[fieldName] === '0' || data[fieldName] === 0) && value.length > 1) {
      cleanValue = value.replace(/^0+/, '');
    }
    setData({ ...data, [fieldName]: cleanValue });
  };

  // --- CÁLCULOS DINÁMICOS ---
  const montoFactNum = parseFloat(data.monto_fact) || 0;
  const gna = parseFloat(data.gna) || 0;
  const honorarios = parseFloat(data.honorarios_medic) || 0;
  const servicios = parseFloat(data.servicios_clinicos) || 0;

  const montoAmp = gna + honorarios + servicios;
  const retencion = montoFactNum * 0.05; 
  const montoIndemniz = montoAmp - retencion;

  // Sincronización con el estado global
  React.useEffect(() => {
    if (
      data.monto_amp !== String(montoAmp) || 
      data.monto_indemniz !== String(montoIndemniz)
    ) {
      setData({
        ...data,
        monto_amp: String(montoAmp),
        monto_indemniz: String(montoIndemniz)
      });
    }
  }, [montoAmp, montoIndemniz]);

  // --- NOMBRES Y VALIDACIONES ---
  const montosCoinciden = Math.abs(montoAmp - montoFactNum) < 0.01;
  
  const receptorNombre = allUsers?.find((u: any) => u.id === currentBill?.analyst_receptor_id)?.full_name || 'Diego Lopez';

  const getLiquidadorName = () => {
    const user = allUsers?.find((u: any) => u.id === (data.analyst_liquidador || currentBill?.analyst_severance));
    return user ? user.full_name : 'Pendiente por liquidar';
  };

  if (!billExists) return null;

  return (
    <div className="space-y-6">
      {/* BARRA GRIS SUPERIOR (Estado y Acceso) */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Acceso: <span className="text-slate-800">{userRole || 'Admin'}</span></span>
        <span>Estado Factura: <span className="text-blue-600">{billState || 'Pendiente'}</span></span>
        <span>Receptor Original: <span className="text-slate-800">{receptorNombre}</span></span>
      </div>

      {/* CARD PRINCIPAL BLANCA */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Fecha de Liquidación" value={data.fecha_liquidacion} disabled readOnly />
          <Select 
            label="Tipo de Siniestro *" 
            value={data.tipo_siniestro} 
            onChange={(e) => setData({...data, tipo_siniestro: e.target.value})}
            options={CLAIM_TYPES.map(t => ({ value: t, label: t }))}
            disabled={!canEdit}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Monto Facturado *" value={data.monto_fact} disabled readOnly />
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Monto AMP (Auto)</label>
            <div className={`p-2.5 rounded-lg border font-bold ${montosCoinciden ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {montoAmp.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <Input 
            label="GNA" 
            type="number" 
            value={data.gna} 
            onChange={(e) => handleInputChange('gna', e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input 
            label="Honorarios Médicos" 
            type="number" 
            value={data.honorarios_medic} 
            onChange={(e) => handleInputChange('honorarios_medic', e.target.value)}
            disabled={!canEdit}
          />
          <Input 
            label="Servicios Clínicos" 
            type="number" 
            value={data.servicios_clinicos} 
            onChange={(e) => handleInputChange('servicios_clinicos', e.target.value)}
            disabled={!canEdit}
          />
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-400">Retención 5% (Calculada)</label>
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
              {retencion.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Monto Indemnizado</label>
            <div className={`p-2.5 rounded-lg border font-bold ${montoIndemniz > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              {montoIndemniz > 0 ? montoIndemniz.toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "0,00"}
            </div>
          </div>
          <Input 
            label="Nomenclatura de Lote *" 
            value={data.nomenclature_pile} 
            onChange={(e) => setData({...data, nomenclature_pile: e.target.value})}
            disabled={!canEdit}
          />
        </div>

        {/* --- SECCIÓN DE ANALISTA LIQUIDADOR (ESTILO IMAGEN 2) --- */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">
              Analista Liquidador
            </label>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-700">
                {getLiquidadorName()}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic max-w-[150px] text-right">
            Se registrará automáticamente al guardar la liquidación.
          </p>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <div className="flex justify-end">
        <Button 
          onClick={() => onSave(data)} 
          disabled={loading || !canEdit || !montosCoinciden || !data.tipo_siniestro}
        >
          {loading ? 'Guardando...' : 'Guardar Liquidación'}
        </Button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} message="Error" type="error" />
    </div>
  );
}