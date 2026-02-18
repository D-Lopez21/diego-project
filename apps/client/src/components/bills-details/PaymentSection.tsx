import { Button } from '../common';
import Modal from './BillModal';
import { useState, useRef } from 'react';

export default function PaymentSection({
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

  const lastEdited = useRef<'monto_bs' | 'ref_en_dolares' | null>(null);

  const showModal = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'warning') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  // ✅ Limpia ceros iniciales y solo permite números y punto decimal
  const cleanNumeric = (value: string) => {
    const clean = value.replace(/[^0-9.]/g, '');
    // Elimina ceros iniciales excepto "0." 
    return clean.replace(/^0+(\d)/, '$1');
  };

  const montoBsNum = parseFloat(data.monto_bs) || 0;
  const tcrNum = parseFloat(data.tcr) || 0;

  const handleMontoChange = (value: string) => {
    lastEdited.current = 'monto_bs';
    const clean = cleanNumeric(value);
    const monto = parseFloat(clean) || 0;
    const tcr = parseFloat(data.tcr) || 0;
    const ref = tcr > 0 ? (monto / tcr).toFixed(2) : data.ref_en_dolares;
    setData((prev: any) => ({ ...prev, monto_bs: clean, ref_en_dolares: ref }));
  };

  const handleRefChange = (value: string) => {
    lastEdited.current = 'ref_en_dolares';
    const clean = cleanNumeric(value);
    const ref = parseFloat(clean) || 0;
    const tcr = parseFloat(data.tcr) || 0;
    const monto = (ref * tcr).toFixed(2);
    setData((prev: any) => ({ ...prev, ref_en_dolares: clean, monto_bs: monto }));
  };

  const handleTcrChange = (value: string) => {
    const clean = cleanNumeric(value);
    const tcr = parseFloat(clean) || 0;
    if (lastEdited.current === 'ref_en_dolares') {
      const ref = parseFloat(data.ref_en_dolares) || 0;
      const monto = (ref * tcr).toFixed(2);
      setData((prev: any) => ({ ...prev, tcr: clean, monto_bs: monto }));
    } else {
      const monto = parseFloat(data.monto_bs) || 0;
      const ref = tcr > 0 ? (monto / tcr).toFixed(2) : data.ref_en_dolares;
      setData((prev: any) => ({ ...prev, tcr: clean, ref_en_dolares: ref }));
    }
  };

  const handleGenericChange = (field: string, value: string) => {
    const clean = cleanNumeric(value);
    setData((prev: any) => ({ ...prev, [field]: clean }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      setData((prev: any) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.value) {
      setData((prev: any) => ({ ...prev, [fieldName]: '' }));
    }
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

  const getPagadorName = () => {
    if (!currentBill?.analyst_paid) return 'No asignado';
    const pagador = allUsers?.find((u: any) => u.id === currentBill.analyst_paid);
    return pagador?.name || 'Desconocido';
  };

  const getFechaPago = () => {
    if (!currentBill?.paid_date) return 'Pendiente';
    const fechaLimpia = currentBill.paid_date.replace(/-/g, '\/');
    return new Date(fechaLimpia).toLocaleDateString('es-ES');
  };

  const getDataToSave = () => {
    const tcr = parseFloat(data.tcr) || 0;
    const monto = parseFloat(data.monto_bs) || 0;
    const ref = tcr > 0 ? parseFloat((monto / tcr).toFixed(2)) : parseFloat(data.ref_en_dolares) || 0;
    return { ...data, ref_en_dolares: String(ref) };
  };

  const inputClass = (readOnly: boolean) =>
    `w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
      readOnly
        ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
        : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 text-slate-800'
    }`;

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        type={modalType}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isReadOnly) {
            showModal('No tienes permisos para guardar cambios en esta sección', 'warning');
            return;
          }
          onSave(getDataToSave());
        }}
        className="space-y-6"
      >
        {/* Banner de Modo Lectura */}
        {isReadOnly && !isDevuelto && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 shadow-sm rounded-r-lg flex items-center">
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                Usted está en modo <span className="font-bold">Vista Previa</span>. Su rol actual (
                <span className="font-mono bg-amber-100 px-1 rounded">{userRole}</span>) no permite editar esta sección.
              </p>
            </div>
          </div>
        )}

        {/* Contenedor Principal */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Detalles de la Ejecución de Pago
            </h3>
          </div>

          <div className="p-8 space-y-7">

            {/* Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Pago</label>
                <input
                  type="text"
                  value={getFechaPago()}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Monto Bs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Bs <span className="text-xs text-slate-400 font-normal">(Ref. $ × TCR)</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="monto_bs"
                  value={data.monto_bs || ''}
                  placeholder="0"
                  onChange={(e) => handleMontoChange(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'monto_bs')}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              {/* TCR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TCR</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="tcr"
                  value={data.tcr || ''}
                  placeholder="0"
                  onChange={(e) => handleTcrChange(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'tcr')}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              {/* Ref. en Dólares — calculado automáticamente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ref. en Dólares <span className="text-xs text-slate-400 font-normal">(Monto Bs ÷ TCR)</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="ref_en_dolares"
                  value={tcrNum > 0 ? (montoBsNum / tcrNum).toFixed(2) : (data.ref_en_dolares || '')}
                  placeholder="0"
                  onChange={(e) => handleRefChange(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'ref_en_dolares')}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>
            </div>

            {/* Referencias y Diferencias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Referencia Bancaria — texto libre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia Bancaria</label>
                <input
                  type="text"
                  value={data.ref_bancaria || ''}
                  placeholder=""
                  onChange={(e) => setData((prev: any) => ({ ...prev, ref_bancaria: e.target.value }))}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              {/* Diferencia Vértice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diferencia Vértice</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="diferencia_vertice"
                  value={data.diferencia_vertice || ''}
                  placeholder="0"
                  onChange={(e) => handleGenericChange('diferencia_vertice', e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'diferencia_vertice')}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              {/* Diferencia Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diferencia Proveedor</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="diferencia_proveedor"
                  value={data.diferencia_proveedor || ''}
                  placeholder="0"
                  onChange={(e) => handleGenericChange('diferencia_proveedor', e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'diferencia_proveedor')}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>
            </div>

            {/* Analista */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex justify-between items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                  ANALISTA PAGADOR
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-slate-700">{getPagadorName()}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic text-right leading-tight max-w-[180px]">
                Se asigna automáticamente al usuario que guarda la ejecución.
              </p>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || isReadOnly}
            className={`min-w-[220px] py-3 rounded-lg shadow-sm font-bold transition-all
              ${isReadOnly
                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                : 'bg-[#1a56ff] hover:bg-[#0044ff] text-white'}`}
          >
            {isReadOnly ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                MODO LECTURA
              </span>
            ) : 'Guardar Ejecución'}
          </Button>
        </div>
      </form>
    </>
  );
}