import { Button, Input } from '../common';

export default function AuditSection({
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
          label="Fecha de Auditoría"
          type="date"
          value={data.fecha_auditoria}
          onChange={(e) =>
            setData({ ...data, fecha_auditoria: e.target.value })
          }
        />

        <Input
          label="Auditor"
          value={data.auditor}
          onChange={(e) => setData({ ...data, auditor: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          Guardar Auditoría
        </Button>
      </div>
    </form>
  );
}
