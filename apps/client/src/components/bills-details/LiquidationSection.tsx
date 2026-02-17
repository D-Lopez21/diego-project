import { Button, Input, Select } from '../common';
import Modal from './BillModal';
import { useState, useEffect } from 'react';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'info' | 'error' | 'success' | 'warning'>('info');

  const showModal = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'warning') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  // --- MANEJO DE INPUTS (Limpieza de ceros iniciales) ---
  const handleInputChange = (fieldName: string, value: string) => {
    let cleanValue = value;
    if ((data[fieldName] === '0' || data[fieldName] === 0) && value.length > 1) {
      cleanValue = value.replace(/^0+/, '');
    }
    setData({ ...data, [fieldName]: cleanValue });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    const val = parseFloat(e.target.value);
    if (val === 0 || isNaN(val)) {
      setData((prev: any) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
      setData((prev: any) => ({ ...prev, [fieldName]: '0' }));
    }
  };

  // --- CÁLCULOS LOCALES ---
  const montoFactNum  = parseFloat(data.monto_fact)         || 0;
  const gna           = parseFloat(data.gna)                || 0;
  const honorarios    = parseFloat(data.honorarios_medic)   || 0;
  const servicios     = parseFloat(data.servicios_clinicos) || 0;

  const montoAmpCalculado = gna + honorarios + servicios;
  const ret5Calculada     = montoFactNum * 0.05;
  const montoIndemniz     = montoAmpCalculado - ret5Calculada;

  useEffect(() => {
    setData((prev: any) => ({
      ...prev,
      monto_amp: montoAmpCalculado.toFixed(2),
      monto_indemniz: montoIndemniz.toFixed(2),
      // ELIMINAMOS retention_rate de aquí para evitar el error de base de datos al guardar
    }));
  }, [gna, honorarios, servicios, montoFactNum]);

  // --- VALIDACIONES ---
  const montosCoinciden = Math.abs(montoAmpCalculado - montoFactNum) < 0.01;
  const montoIndemnizPositivo = montoIndemniz > 0;

  const isFormValid = () => {
    return (
      data.tipo_siniestro &&
      data.nomenclature_pile &&
      montoFactNum > 0 &&
      montosCoinciden &&
      montoIndemnizPositivo
    );
  };

  // --- FUNCIONES QUE USAN LAS PROPS (Para quitar advertencias amarillas) ---
  const getAnalystDisplay = () => {
    const analystId = currentBill?.analyst_severance;
    const analyst = allUsers?.find((u: any) => u.id === analystId);
    return analyst?.name || 'Asignación Automática';
  };

  const getFechaFormateada = () => {
    if (!currentBill?.severance_date) return new Date().toLocaleDateString('es-ES');
    return new Date(currentBill.severance_date.replace(/-/g, '/')).toLocaleDateString('es-ES');
  };

  if (!billExists) return null;

  const formatNumber = (value: number) =>
    value.toLocaleString('es-VE', { minimumFractionDigits: 2 });

  return (
    <>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage} type={modalType} />
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canEdit) return;
          if (!isFormValid()) {
            showModal('La suma de los componentes debe ser igual al monto facturado.', 'error');
            return;
          }
          // Antes de guardar, nos aseguramos que retention_rate no vaya en el objeto
          const { retention_rate, ...sendData } = data;
          onSave(sendData);
        }}
        className="space-y-6"
      >
        {/* Banner que usa userRole y billState para eliminar advertencias */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center text-[11px] text-slate-500">
          <span>ROL: <b className="text-slate-700">{userRole}</b></span>
          <span>ESTADO: <b className="uppercase text-slate-700">{billState || 'Nuevo'}</b></span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Liquidación</label>
              <input type="text" value={getFechaFormateada()} readOnly className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 outline-none" />
            </div>
            <Select
              label="Tipo de Siniestro *"
              value={data.tipo_siniestro}
              onChange={(e) => setData({ ...data, tipo_siniestro: e.target.value })}
              disabled={!canEdit}
              options={CLAIM_TYPES.map(t => ({ value: t, label: t }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Monto Facturado *</label>
              <input type="text" value={formatNumber(montoFactNum)} readOnly className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Monto AMP (Auto)</label>
              <input
                type="text"
                value={formatNumber(montoAmpCalculado)}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg font-bold transition-colors ${montosCoinciden ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
              />
            </div>
            <Input
              label="GNA"
              type="number"
              value={data.gna}
              onChange={(e) => handleInputChange('gna', e.target.value)}
              onFocus={(e) => handleFocus(e, 'gna')}
              onBlur={(e) => handleBlur(e, 'gna')}
              disabled={!canEdit}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Honorarios Médicos"
              type="number"
              value={data.honorarios_medic}
              onChange={(e) => handleInputChange('honorarios_medic', e.target.value)}
              onFocus={(e) => handleFocus(e, 'honorarios_medic')}
              onBlur={(e) => handleBlur(e, 'honorarios_medic')}
              disabled={!canEdit}
            />
            <Input
              label="Servicios Clínicos"
              type="number"
              value={data.servicios_clinicos}
              onChange={(e) => handleInputChange('servicios_clinicos', e.target.value)}
              onFocus={(e) => handleFocus(e, 'servicios_clinicos')}
              onBlur={(e) => handleBlur(e, 'servicios_clinicos')}
              disabled={!canEdit}
            />
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ret. 5% (Solo Vista)</label>
              <input type="text" value={formatNumber(ret5Calculada)} readOnly className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Monto Indemnizado</label>
              <input
                type="text"
                value={montoIndemnizPositivo && montosCoinciden ? formatNumber(montoIndemniz) : ""}
                placeholder={!montosCoinciden ? "No hay coincidencia" : "Calculando..."}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg font-bold ${montoIndemnizPositivo && montosCoinciden ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              />
            </div>
            <Input
              label="Nomenclatura de Lote *"
              value={data.nomenclature_pile}
              onChange={(e) => setData({ ...data, nomenclature_pile: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Analista: {getAnalystDisplay()}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || !canEdit || !isFormValid()}
            className={`min-w-[220px] py-3 rounded-lg font-bold transition-all ${(!isFormValid() || !canEdit) ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-[#1a56ff] hover:bg-[#0044ff] text-white'}`}
          >
            {!montosCoinciden ? 'DIFERENCIA EN MONTOS' : 'Guardar Liquidación'}
          </Button>
        </div>
      </form>
    </>
  );
}