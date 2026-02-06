import { Button, Input } from '../common';

export default function PaymentSection({
  data,
  setData,
  onSave,
  billExists,
  loading,
}: any) {
  if (!billExists) {
    return (
      <div className="text-center py-12 text-gray-500">
        Primero crea la factura en la sección RECEPCION
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Fecha de Pago"
          type="date"
          value={data.fecha_pago}
          onChange={(e) => setData({ ...data, fecha_pago: e.target.value })}
        />

        <Input
          label="Monto BS"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_bs}
          onChange={(e) => setData({ ...data, monto_bs: e.target.value })}
        />

        <Input
          label="TCR"
          type="number"
          step="0.01"
          min="0"
          value={data.tcr}
          onChange={(e) => setData({ ...data, tcr: e.target.value })}
        />

        <Input
          label="Ref en $"
          value={data.ref_en_dolares}
          onChange={(e) => setData({ ...data, ref_en_dolares: e.target.value })}
        />

        <Input
          label="Ref. Bancaria"
          value={data.ref_bancaria}
          onChange={(e) => setData({ ...data, ref_bancaria: e.target.value })}
        />

        <Input
          label="Diferencia +Vértice"
          type="number"
          step="0.01"
          value={data.diferencia_vertice}
          onChange={(e) =>
            setData({ ...data, diferencia_vertice: e.target.value })
          }
        />

        <Input
          label="Diferencia +Proveedor"
          type="number"
          step="0.01"
          value={data.diferencia_proveedor}
          onChange={(e) =>
            setData({ ...data, diferencia_proveedor: e.target.value })
          }
        />

        <Input
          label="Analista"
          value={data.analyst_pagador}
          onChange={(e) =>
            setData({ ...data, analyst_pagador: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          Guardar Ejecución
        </Button>
      </div>
    </form>
  );
}
