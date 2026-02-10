// Archivo: PaymentSection.tsx
// Copiar este contenido completo

import { Button, Input, Select } from '../common';

export default function PaymentSection({
  data,
  setData,
  onSave,
  billExists,
  loading,
  pagadores,
  canEdit,
  userRole,
}: any) {
  if (!billExists) {
    return (
      <div className="text-center py-12 text-gray-500">
        Primero crea la factura en la sección RECEPCION
      </div>
    );
  }

  const isReadOnly = !canEdit;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isReadOnly) {
          alert('No tienes permisos para guardar cambios en esta sección');
          return;
        }
        onSave();
      }}
      className="space-y-4"
    >
      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Solo lectura:</strong> No tienes permisos para editar esta sección.
            Tu rol: <span className="font-mono">{userRole}</span>. Se requiere: <span className="font-mono">pagos</span> o <span className="font-mono">admin</span>.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Fecha de Pago"
          type="date"
          value={data.fecha_pago || ''}
          onChange={(e) =>
            setData({ ...data, fecha_pago: e.target.value })
          }
          disabled={isReadOnly}
        />

        <Input
          label="Monto Bs"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_bs}
          onChange={(e) => setData({ ...data, monto_bs: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="TCR"
          type="number"
          step="0.01"
          min="0"
          value={data.tcr}
          onChange={(e) => setData({ ...data, tcr: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="Ref. en Dólares"
          type="number"
          step="0.01"
          min="0"
          value={data.ref_en_dolares}
          onChange={(e) => setData({ ...data, ref_en_dolares: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="Referencia Bancaria"
          value={data.ref_bancaria}
          onChange={(e) => setData({ ...data, ref_bancaria: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="Diferencia Vértice"
          type="number"
          step="0.01"
          value={data.diferencia_vertice}
          onChange={(e) => setData({ ...data, diferencia_vertice: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="Diferencia Proveedor"
          type="number"
          step="0.01"
          value={data.diferencia_proveedor}
          onChange={(e) => setData({ ...data, diferencia_proveedor: e.target.value })}
          disabled={isReadOnly}
        />

        <Select
          label="Analista Pagador"
          value={data.analyst_pagador}
          onChange={(e) =>
            setData({ ...data, analyst_pagador: e.target.value })
          }
          required
          disabled={isReadOnly}
          options={(pagadores || []).map((a: any) => ({
            value: a.id,
            label: a.name,
          }))}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || isReadOnly}>
          {isReadOnly ? '🔒 Solo Lectura' : 'Guardar Ejecución'}
        </Button>
      </div>
    </form>
  );
}