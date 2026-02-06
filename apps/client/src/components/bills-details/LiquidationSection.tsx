import { Button, Input } from '../common';

export default function LiquidationSection({
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
          label="Fecha de Liquidación"
          type="date"
          value={data.fecha_liquidacion}
          onChange={(e) =>
            setData({ ...data, fecha_liquidacion: e.target.value })
          }
        />

        <Input
          label="Tipo de Siniestro"
          value={data.tipo_siniestro}
          onChange={(e) => setData({ ...data, tipo_siniestro: e.target.value })}
        />

        <Input
          label="Monto Fact"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_fact}
          onChange={(e) => setData({ ...data, monto_fact: e.target.value })}
        />

        <Input
          label="Monto AMP"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_amp}
          onChange={(e) => setData({ ...data, monto_amp: e.target.value })}
        />

        <Input
          label="GNA"
          type="number"
          step="0.01"
          min="0"
          value={data.gna}
          onChange={(e) => setData({ ...data, gna: e.target.value })}
        />

        <Input
          label="Honorarios Médicos"
          type="number"
          step="0.01"
          min="0"
          value={data.honorarios_medic}
          onChange={(e) =>
            setData({ ...data, honorarios_medic: e.target.value })
          }
        />

        <Input
          label="Servicios Clínicos"
          type="number"
          step="0.01"
          min="0"
          value={data.servicios_clinicos}
          onChange={(e) =>
            setData({ ...data, servicios_clinicos: e.target.value })
          }
        />

        <Input
          label="Ret. 5%"
          type="number"
          step="0.01"
          min="0"
          value={data.retention_rate}
          onChange={(e) => setData({ ...data, retention_rate: e.target.value })}
        />

        <Input
          label="Monto Indemniz"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_indemniz}
          onChange={(e) => setData({ ...data, monto_indemniz: e.target.value })}
        />

        <Input
          label="Nomenclatura de Lote"
          value={data.nomenclature_pile}
          onChange={(e) =>
            setData({ ...data, nomenclature_pile: e.target.value })
          }
        />

        <Input
          label="Analista Liquidador"
          value={data.analyst_liquidador}
          onChange={(e) =>
            setData({ ...data, analyst_liquidador: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          Guardar Liquidación
        </Button>
      </div>
    </form>
  );
}
