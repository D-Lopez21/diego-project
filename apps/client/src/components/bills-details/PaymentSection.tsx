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

  const [localMonto, setLocalMonto] = useState<string | null>(null);
  const [localTcr, setLocalTcr] = useState<string | null>(null);
  const [localRef, setLocalRef] = useState<string | null>(null);

  const lastEdited = useRef<'monto_bs' | 'ref_en_dolares' | null>(null);

  const showModal = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'warning') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const cleanNumeric = (value: string): string => {
    let clean = String(value || '').replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
    clean = clean.replace(/^0+(\d)/, '$1');
    return clean;
  };

  // --- Lógica de Validación Blindada ---
  const isFormValid = () => {
    // Convertimos a String antes de validar para evitar el error .trim()
    const montoStr = String(data.monto_bs || '');
    const tcrStr = String(data.tcr || '');
    const refDolarStr = String(data.ref_en_dolares || '');
    const refBancariaStr = String(data.ref_bancaria || '');

    const tieneMonto = montoStr.length > 0;
    const tieneTcr = tcrStr.length > 0;
    const tieneRefDolar = refDolarStr.length > 0;
    const tieneReferencia = refBancariaStr.trim().length > 0;

    return tieneMonto && tieneTcr && tieneRefDolar && tieneReferencia;
  };

  // --- Handlers de cambio ---
  const handleMontoChange = (raw: string) => {
    lastEdited.current = 'monto_bs';
    const clean = cleanNumeric(raw);
    setLocalMonto(clean);
    const monto = parseFloat(clean) || 0;
    const tcr = parseFloat(localTcr ?? data.tcr) || 0;
    const ref = tcr > 0 ? (monto / tcr).toFixed(2) : '';
    setLocalRef(ref);
    setData((prev: any) => ({ ...prev, monto_bs: clean, ref_en_dolares: ref }));
  };

  const handleTcrChange = (raw: string) => {
    const clean = cleanNumeric(raw);
    setLocalTcr(clean);
    const tcr = parseFloat(clean) || 0;
    if (lastEdited.current === 'ref_en_dolares') {
      const ref = parseFloat(localRef ?? data.ref_en_dolares) || 0;
      const monto = tcr > 0 ? (ref * tcr).toFixed(2) : '';
      setLocalMonto(monto);
      setData((prev: any) => ({ ...prev, tcr: clean, monto_bs: monto }));
    } else {
      const monto = parseFloat(localMonto ?? data.monto_bs) || 0;
      const ref = tcr > 0 ? (monto / tcr).toFixed(2) : '';
      setLocalRef(ref);
      setData((prev: any) => ({ ...prev, tcr: clean, ref_en_dolares: ref }));
    }
  };

  const handleRefChange = (raw: string) => {
    lastEdited.current = 'ref_en_dolares';
    const clean = cleanNumeric(raw);
    setLocalRef(clean);
    const ref = parseFloat(clean) || 0;
    const tcr = parseFloat(localTcr ?? data.tcr) || 0;
    const monto = tcr > 0 ? (ref * tcr).toFixed(2) : '';
    setLocalMonto(monto);
    setData((prev: any) => ({ ...prev, ref_en_dolares: clean, monto_bs: monto }));
  };

  const onFocusMonto = () => setLocalMonto(String(data.monto_bs) === '0' ? '' : (String(data.monto_bs) || ''));
  const onFocusTcr = () => setLocalTcr(String(data.tcr) === '0' ? '' : (String(data.tcr) || ''));
  const onFocusRef = () => setLocalRef(String(data.ref_en_dolares) === '0' ? '' : (String(data.ref_en_dolares) || ''));

  const onBlurMonto = () => {
    const val = localMonto ?? data.monto_bs;
    setData((prev: any) => ({ ...prev, monto_bs: val || '' }));
    setLocalMonto(null);
  };
  const onBlurTcr = () => {
    const val = localTcr ?? data.tcr;
    setData((prev: any) => ({ ...prev, tcr: val || '' }));
    setLocalTcr(null);
  };
  const onBlurRef = () => {
    const val = localRef ?? data.ref_en_dolares;
    setData((prev: any) => ({ ...prev, ref_en_dolares: val || '' }));
    setLocalRef(null);
  };

  const montoDisplay = localMonto !== null ? localMonto : (data.monto_bs || '');
  const tcrDisplay = localTcr !== null ? localTcr : (data.tcr || '');
  const refDisplay = localRef !== null ? localRef : (data.ref_en_dolares || '');

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
    const fechaLimpia = currentBill.paid_date.replace(/-/g, '/');
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
          if (isReadOnly) return;
          if (!isFormValid()) {
            showModal('Por favor, complete todos los campos obligatorios.', 'error');
            return;
          }
          onSave(getDataToSave());
        }}
        className="space-y-6"
      >

        {isReadOnly && !isDevuelto && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 shadow-sm rounded-r-lg flex items-center">
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                Usted está en modo <span className="font-bold">Vista Previa</span>. 
                Su rol actual (<span className="font-mono bg-amber-100 px-1 rounded">{userRole}</span>) no permite editar esta sección.
              </p>
            </div>
          </div>
        )}

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Bs <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={montoDisplay}
                  onChange={(e) => handleMontoChange(e.target.value)}
                  onFocus={onFocusMonto}
                  onBlur={onBlurMonto}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TCR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={tcrDisplay}
                  onChange={(e) => handleTcrChange(e.target.value)}
                  onFocus={onFocusTcr}
                  onBlur={onBlurTcr}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ref. en Dólares <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={refDisplay}
                  onChange={(e) => handleRefChange(e.target.value)}
                  onFocus={onFocusRef}
                  onBlur={onBlurRef}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia Bancaria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.ref_bancaria || ''}
                  onChange={(e) => setData((prev: any) => ({ ...prev, ref_bancaria: e.target.value }))}
                  disabled={isReadOnly}
                  placeholder="Referencia"
                  className={inputClass(isReadOnly)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diferencia Vértice</label>
                <input
                  type="text"
                  value={data.diferencia_vertice || ''}
                  onChange={(e) => setData((prev: any) => ({ ...prev, diferencia_vertice: cleanNumeric(e.target.value) }))}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diferencia Proveedor</label>
                <input
                  type="text"
                  value={data.diferencia_proveedor || ''}
                  onChange={(e) => setData((prev: any) => ({ ...prev, diferencia_proveedor: cleanNumeric(e.target.value) }))}
                  disabled={isReadOnly}
                  className={inputClass(isReadOnly)}
                />
              </div>
            </div>

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
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || isReadOnly || !isFormValid()}
            className={`min-w-[220px] py-3 rounded-lg shadow-sm font-bold transition-all
              ${(isReadOnly || !isFormValid())
                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                : 'bg-[#1a56ff] hover:bg-[#0044ff] text-white'}`}
          >
            {isReadOnly ? 'MODO LECTURA' : 'Guardar Ejecución'}
          </Button>
        </div>
      </form>
    </>
  );
}