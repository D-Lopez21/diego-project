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

  // ✅ CORREGIDO: handleFocus usando parseFloat para detectar 0 correctamente
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    const val = parseFloat(e.target.value);
    if (val === 0 || isNaN(val)) {
      setData((prev: any) => ({ ...prev, [fieldName]: '' }));
    }
  };

  // ✅ Restaurar "0" si el campo queda vacío al perder el focus
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.value === '') {
      setData((prev: any) => ({ ...prev, [fieldName]: '0' }));
    }
  };

  // ✅ Cálculos automáticos en tiempo real
  useEffect(() => {
    const montoFact  = parseFloat(data.monto_fact)         || 0;
    const gna        = parseFloat(data.gna)                || 0;
    const honorarios = parseFloat(data.honorarios_medic)   || 0;
    const servicios  = parseFloat(data.servicios_clinicos) || 0;

    // Ret. 5% = Monto Facturado * 0.05
    const ret5 = montoFact * 0.05;

    // Monto AMP = GNA + Honorarios Médicos + Servicios Clínicos
    const montoAmp = gna + honorarios + servicios;

    // ✅ CORREGIDO: Monto Indemnizado nunca negativo
    const montoIndemniz = montoAmp > 0 ? montoAmp - ret5 : 0;

    setData((prev: any) => ({
      ...prev,
      monto_amp:      montoAmp.toFixed(2),
      monto_indemniz: montoIndemniz.toFixed(2),
      retention_rate: ret5.toFixed(2),
    }));
  }, [data.monto_fact, data.gna, data.honorarios_medic, data.servicios_clinicos]);

  if (!billExists) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <p className="text-sm font-medium">Primero crea la factura en la sección RECEPCIÓN</p>
      </div>
    );
  }

  const isReadOnly = !canEdit;
  const isDevuelto = billState === 'devuelto';

  const getAnalystName = () => {
    if (!currentBill?.analyst_severance) return 'No asignado';
    const analyst = allUsers?.find((u: any) => u.id === currentBill.analyst_severance);
    return analyst?.name || 'Desconocido';
  };

  const getFechaLiquidacion = () => {
    if (!currentBill?.severance_date) return 'Pendiente';
    const fechaLimpia = currentBill.severance_date.replace(/-/g, '\/');
    return new Date(fechaLimpia).toLocaleDateString('es-ES');
  };

  const isFormValid = () => {
    return (
      data.tipo_siniestro &&
      data.nomenclature_pile &&
      data.monto_fact &&
      parseFloat(data.monto_fact) > 0
    );
  };

  // Valores calculados para mostrar en pantalla
  const montoFact     = parseFloat(data.monto_fact)     || 0;
  const ret5          = montoFact * 0.05;
  const montoAmp      = parseFloat(data.monto_amp)      || 0;
  const montoIndemniz = parseFloat(data.monto_indemniz) || 0;

  const formatNumber = (value: number) =>
    value.toLocaleString('es-VE', { minimumFractionDigits: 2 });

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
            showModal('Por favor, completa todos los campos requeridos: Tipo de Siniestro, Nomenclatura de Lote y Monto Facturado.', 'warning');
            return;
          }
          onSave();
        }}
        className="space-y-6"
      >
        {/* Banner de Modo Lectura */}
        {isReadOnly && !isDevuelto && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 shadow-sm rounded-r-lg flex items-center">
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                Usted está en modo <span className="font-bold">Vista Previa</span>. Su rol actual (<span className="font-mono bg-amber-100 px-1 rounded">{userRole}</span>) no permite editar esta sección.
              </p>
            </div>
          </div>
        )}

        {/* Contenedor Principal */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Cabecera */}
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Detalles de la Liquidación
            </h3>
          </div>

          <div className="p-8 space-y-7">
            {/* Fila 1: Fecha y Tipo Siniestro */}
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

            {/* Fila 2: Monto Facturado, Monto AMP (auto), GNA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Monto Facturado *"
                type="number"
                value={data.monto_fact}
                onChange={(e) => setData({ ...data, monto_fact: e.target.value })}
                onFocus={(e) => handleFocus(e, 'monto_fact')}
                onBlur={(e) => handleBlur(e, 'monto_fact')}
                disabled={isReadOnly}
              />

              {/* Monto AMP - Calculado automáticamente */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Monto AMP
                  <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    Auto
                  </span>
                </label>
                <input
                  type="text"
                  value={formatNumber(montoAmp)}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">GNA + Hon. Médicos + Serv. Clínicos</p>
              </div>

              <Input
                label="GNA"
                type="number"
                value={data.gna || '0'}
                onChange={(e) => setData({ ...data, gna: e.target.value })}
                onFocus={(e) => handleFocus(e, 'gna')}
                onBlur={(e) => handleBlur(e, 'gna')}
                disabled={isReadOnly}
              />
            </div>

            {/* Fila 3: Honorarios, Servicios Clínicos, Ret. 5% */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Honorarios Médicos"
                type="number"
                value={data.honorarios_medic || '0'}
                onChange={(e) => setData({ ...data, honorarios_medic: e.target.value })}
                onFocus={(e) => handleFocus(e, 'honorarios_medic')}
                onBlur={(e) => handleBlur(e, 'honorarios_medic')}
                disabled={isReadOnly}
              />
              <Input
                label="Servicios Clínicos"
                type="number"
                value={data.servicios_clinicos || '0'}
                onChange={(e) => setData({ ...data, servicios_clinicos: e.target.value })}
                onFocus={(e) => handleFocus(e, 'servicios_clinicos')}
                onBlur={(e) => handleBlur(e, 'servicios_clinicos')}
                disabled={isReadOnly}
              />

              {/* Ret. 5% - Calculado automáticamente */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Ret. 5%
                  <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    Auto
                  </span>
                </label>
                <input
                  type="text"
                  value={formatNumber(ret5)}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Monto Facturado × 5%</p>
              </div>
            </div>

            {/* Fila 4: Monto Indemnizado (auto) y Lote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monto Indemnizado - Calculado automáticamente */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Monto Indemnizado
                  <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    Auto
                  </span>
                </label>
                <input
                  type="text"
                  value={formatNumber(montoIndemniz)}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
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

            {/* Sección de Analista */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex justify-between items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                  ANALISTA LIQUIDADOR
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-bold text-slate-700">
                    {getAnalystName()}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic text-right leading-tight max-w-[180px]">
                Se asigna automáticamente al usuario que guarda la liquidación.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={loading || isReadOnly || !isFormValid()}
            className={`min-w-[220px] py-3 rounded-lg shadow-sm font-bold transition-all
              ${isReadOnly ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-[#1a56ff] hover:bg-[#0044ff] text-white'}`}
          >
            {isReadOnly ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                MODO LECTURA
              </span>
            ) : 'Guardar Liquidación'}
          </Button>
        </div>
      </form>
    </>
  );
}