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

  // --- LÓGICA DE MANEJO DE INPUTS ---

  const handleInputChange = (fieldName: string, value: string) => {
    let cleanValue = value;
    
    // Evita el "0848": si el valor actual es "0" y escribes algo, quitamos el cero inicial
    if (data[fieldName] === '0' && value.length > 1) {
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

  // --- CÁLCULOS Y EFECTOS ---

  useEffect(() => {
    const montoFact  = parseFloat(data.monto_fact)         || 0;
    const gna        = parseFloat(data.gna)                || 0;
    const honorarios = parseFloat(data.honorarios_medic)   || 0;
    const servicios  = parseFloat(data.servicios_clinicos) || 0;

    const ret5 = montoFact * 0.05;
    const montoAmp = gna + honorarios + servicios;
    const montoIndemniz = montoAmp - ret5;

    setData((prev: any) => ({
      ...prev,
      monto_amp: montoAmp.toFixed(2),
      monto_indemniz: montoIndemniz.toFixed(2),
      retention_rate: ret5.toFixed(2),
    }));
  }, [data.monto_fact, data.gna, data.honorarios_medic, data.servicios_clinicos]);

  // --- VALIDACIONES ---

  const montoIndemnizNumerico = parseFloat(data.monto_indemniz) || 0;

  const isFormValid = () => {
    return (
      data.tipo_siniestro &&
      data.nomenclature_pile &&
      parseFloat(data.monto_fact) > 0 &&
      montoIndemnizNumerico > 0 // El botón se bloquea si el resultado es <= 0
    );
  };

  if (!billExists) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <p className="text-sm font-medium">Primero crea la factura en la sección RECEPCIÓN</p>
      </div>
    );
  }

  const isReadOnly = !canEdit;
  const isDevuelto = billState === 'devuelto';

  const formatNumber = (value: number) =>
    value.toLocaleString('es-VE', { minimumFractionDigits: 2 });

  const getAnalystName = () => {
    if (!currentBill?.analyst_severance) return 'No asignado';
    const analyst = allUsers?.find((u: any) => u.id === currentBill.analyst_severance);
    return analyst?.name || 'Desconocido';
  };

  const getFechaLiquidacion = () => {
    if (!currentBill?.severance_date) return 'Pendiente';
    const fechaLimpia = currentBill.severance_date.replace(/-/g, '/');
    return new Date(fechaLimpia).toLocaleDateString('es-ES');
  };

  return (
    <>
      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        type={modalType}
      />
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canEdit) return;
          if (!isFormValid()) {
            showModal('Por favor, asegúrese de que el Monto Indemnizado sea positivo y todos los campos obligatorios estén llenos.', 'warning');
            return;
          }
          onSave();
        }}
        className="space-y-6"
      >
        {isReadOnly && !isDevuelto && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 shadow-sm rounded-r-lg flex items-center">
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                Usted está en modo <span className="font-bold">Vista Previa</span>. Su rol actual (<span className="font-mono bg-amber-100 px-1 rounded">{userRole}</span>) no permite editar esta sección.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Detalles de la Liquidación
            </h3>
          </div>

          <div className="p-8 space-y-7">
            {/* Fila 1 */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Liquidación</label>
                <input
                  type="text"
                  value={getFechaLiquidacion()}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
              <div className="md:col-span-6">
                <Select
                  label="Tipo de Siniestro *"
                  value={data.tipo_siniestro}
                  onChange={(e) => setData({ ...data, tipo_siniestro: e.target.value })}
                  disabled={isReadOnly}
                  options={CLAIM_TYPES.map(type => ({ value: type, label: type }))}
                />
              </div>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Monto Facturado *"
                type="number"
                value={data.monto_fact}
                onChange={(e) => handleInputChange('monto_fact', e.target.value)}
                onFocus={(e) => handleFocus(e, 'monto_fact')}
                onBlur={(e) => handleBlur(e, 'monto_fact')}
                disabled={isReadOnly}
              />

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Monto AMP
                  <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Auto</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(parseFloat(data.monto_amp) || 0)}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">GNA + Hon. Médicos + Serv. Clínicos</p>
              </div>

              <Input
                label="GNA"
                type="number"
                value={data.gna}
                onChange={(e) => handleInputChange('gna', e.target.value)}
                onFocus={(e) => handleFocus(e, 'gna')}
                onBlur={(e) => handleBlur(e, 'gna')}
                disabled={isReadOnly}
              />
            </div>

            {/* Fila 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Honorarios Médicos"
                type="number"
                value={data.honorarios_medic}
                onChange={(e) => handleInputChange('honorarios_medic', e.target.value)}
                onFocus={(e) => handleFocus(e, 'honorarios_medic')}
                onBlur={(e) => handleBlur(e, 'honorarios_medic')}
                disabled={isReadOnly}
              />
              <Input
                label="Servicios Clínicos"
                type="number"
                value={data.servicios_clinicos}
                onChange={(e) => handleInputChange('servicios_clinicos', e.target.value)}
                onFocus={(e) => handleFocus(e, 'servicios_clinicos')}
                onBlur={(e) => handleBlur(e, 'servicios_clinicos')}
                disabled={isReadOnly}
              />
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Ret. 5%
                  <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Auto</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(parseFloat(data.retention_rate) || 0)}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Monto Facturado × 5%</p>
              </div>
            </div>

            {/* Fila 4: Monto Indemnizado (Lógica de ocultación de negativos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Monto Indemnizado
                  <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Auto</span>
                </label>
                <input
                  type="text"
                  // Solo mostramos si el valor es mayor a 0
                  value={montoIndemnizNumerico > 0 ? formatNumber(montoIndemnizNumerico) : ""}
                  placeholder={montoIndemnizNumerico <= 0 ? "Pendiente de cálculo positivo" : ""}
                  readOnly
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors ${
                    montoIndemnizNumerico > 0 
                    ? 'bg-blue-50/30 border-blue-100 text-blue-700 font-semibold' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1">Monto AMP − Ret. 5%</p>
              </div>

              <Input
                label="Nomenclatura de Lote *"
                value={data.nomenclature_pile}
                onChange={(e) => setData({ ...data, nomenclature_pile: e.target.value })}
                disabled={isReadOnly}
              />
            </div>

            {/* Analista */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex justify-between items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">ANALISTA LIQUIDADOR</label>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-bold text-slate-700">{getAnalystName()}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic text-right leading-tight max-w-[180px]">
                Se asigna automáticamente al usuario que guarda la liquidación.
              </p>
            </div>
          </div>
        </div>

        {/* Botón Guardar con validación de monto positivo */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={loading || isReadOnly || !isFormValid()}
            className={`min-w-[220px] py-3 rounded-lg shadow-sm font-bold transition-all
              ${(isReadOnly || !isFormValid()) ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-[#1a56ff] hover:bg-[#0044ff] text-white'}`}
          >
            {isReadOnly ? 'MODO LECTURA' : 'Guardar Liquidación'}
          </Button>
        </div>
      </form>
    </>
  );
}