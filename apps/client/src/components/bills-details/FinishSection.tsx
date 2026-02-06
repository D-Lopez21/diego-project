import { Button, Input } from '../common';

export default function FinishSection({
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de Envío"
          type="date"
          value={data.fecha_envio}
          onChange={(e) => setData({ ...data, fecha_envio: e.target.value })}
        />

        <Input
          label="Analista"
          value={data.analyst_finiquito}
          onChange={(e) =>
            setData({ ...data, analyst_finiquito: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          Guardar Finiquito
        </Button>
      </div>
    </form>
  );
}
