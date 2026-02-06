import { Button, Input } from '../common';

export default function ScheduleSection({
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Fecha de Programación"
          type="date"
          value={data.fecha_programacion}
          onChange={(e) =>
            setData({ ...data, fecha_programacion: e.target.value })
          }
        />

        <Input
          label="Decisión ADM"
          value={data.decision_adm}
          onChange={(e) => setData({ ...data, decision_adm: e.target.value })}
        />

        <Input
          label="Analista"
          value={data.analyst_programador}
          onChange={(e) =>
            setData({ ...data, analyst_programador: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          Guardar Programación
        </Button>
      </div>
    </form>
  );
}
