import { Button, Input } from '../common';
import Modal from './BillModal';
import { useState, useEffect, useRef } from 'react';

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

  // Registra qué campo editó el usuario por última vez
  const lastEdited = useRef<'monto_bs' | 'ref_en_dolares' | null>(null);

  const showModal = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'warning') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  // ✅ Un solo useEffect que decide qué calcular según qué campo editó el usuario
  useEffect(() => {
    const tcr = parseFloat(data.tcr) || 0;
    if (tcr === 0) return;

    if (lastEdited.current === 'monto_bs') {
      // Usuario editó Monto Bs → calcular Ref. en Dólares
      const monto = parseFloat(data.monto_bs) || 0;
      const resultado = (monto / tcr).toFixed(2);
      if (data.ref_en_dolares !== resultado) {
        setData((prev: any) => ({ ...prev, ref_en_dolares: resultado }));
      }
    } else if (lastEdited.current === 'ref_en_dolares') {
      // Usuario editó Ref. en Dólares → calcular Monto Bs
      const ref = parseFloat(data.ref_en_dolares) || 0;
      const resultado = (ref * tcr).toFixed(2);
      if (data.monto_bs !== resultado) {
        setData((prev: any) => ({ ...prev, monto_bs: resultado }));
      }
    }
  }, [data.monto_bs, data.ref_en_dolares, data.tcr]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.value === '') {
      setData({ ...data, [fieldName]: '0' });
    }
    lastEdited.current = null;
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
          if (isReadOnly) {
            showModal('No tienes permisos para guardar cambios en esta sección', 'warning');
            return;
          }
          onSave(data);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Detalles de la Ejecución de Pago
            </h3>
          </div>

          <div className="p-8 space-y-7">
            {/* Fila 1: Fecha de Pago */}
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

            {/* Fila 2: Montos principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Monto Bs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Bs <span className="text-xs text-slate-400 font-normal">(Ref. $ × TCR)</span>
                </label>
                <input
                  type="number"
                  value={data.monto_bs || '0'}
                  onChange={(e) => {
                    lastEdited.current = 'monto_bs';
                    setData((prev: any) => ({ ...prev, monto_bs: e.target.value }));
                  }}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'monto_bs')}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all
                    ${isReadOnly
                      ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 text-slate-800'
                    }`}
                />
              </div>

              {/* TCR */}
              <Input
                label="TCR"
                type="number"
                value={data.tcr || '0'}
                onChange={(e) => setData({ ...data, tcr: e.target.value })}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, 'tcr')}
                disabled={isReadOnly}
              />

              {/* Ref. en Dólares */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ref. en Dólares <span className="text-xs text-slate-400 font-normal">(Monto Bs ÷ TCR)</span>
                </label>
                <input
                  type="number"
                  value={data.ref_en_dolares || '0'}
                  onChange={(e) => {
                    lastEdited.current = 'ref_en_dolares';
                    setData((prev: any) => ({ ...prev, ref_en_dolares: e.target.value }));
                  }}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, 'ref_en_dolares')}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all
                    ${isReadOnly
                      ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 text-slate-800'
                    }`}
                />
              </div>
            </div>

            {/* Fila 3: Referencias y Diferencias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Referencia Bancaria"
                value={data.ref_bancaria || ''}
                onChange={(e) => setData({ ...data, ref_bancaria: e.target.value })}
                disabled={isReadOnly}
              />

              <Input
                label="Diferencia Vértice"
                type="number"
                value={data.diferencia_vertice || '0'}
                onChange={(e) => setData({ ...data, diferencia_vertice: e.target.value })}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, 'diferencia_vertice')}
                disabled={isReadOnly}
              />

              <Input
                label="Diferencia Proveedor"
                type="number"
                value={data.diferencia_proveedor || '0'}
                onChange={(e) => setData({ ...data, diferencia_proveedor: e.target.value })}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, 'diferencia_proveedor')}
                disabled={isReadOnly}
              />
            </div>

            {/* Sección de Analista */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex justify-between items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                  ANALISTA PAGADOR
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-slate-700">
                    {getPagadorName()}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic text-right leading-tight max-w-[180px]">
                Se asigna automáticamente al usuario que guarda la ejecución.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || isReadOnly}
            className={`min-w-[220px] py-3 rounded-lg shadow-sm font-bold transition-all
              ${isReadOnly ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-[#1a56ff] hover:bg-[#0044ff] text-white'}`}
          >
            {isReadOnly ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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