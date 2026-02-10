// Archivo: ScheduleSection.tsx
// Copiar este contenido completo

import { Button, Input, Select } from '../common';

const ADMIN_DECISIONS = ['PROGRAMADO', 'DEVUELTO'];

export default function ScheduleSection({
  data,
  setData,
  onSave,
  billExists,
  loading,
  programadores,
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
            Tu rol: <span className="font-mono">{userRole}</span>. Se requiere: <span className="font-mono">programacion</span> o <span className="font-mono">admin</span>.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Fecha de Programación"
          type="date"
          value={data.fecha_programacion || ''}
          onChange={(e) =>
            setData({ ...data, fecha_programacion: e.target.value })
          }
          disabled={isReadOnly}
        />

        <Select
          label="Decisión ADM"
          value={data.decision_adm}
          onChange={(e) => setData({ ...data, decision_adm: e.target.value })}
          disabled={isReadOnly}
          options={ADMIN_DECISIONS.map(decision => ({
            value: decision,
            label: decision,
          }))}
        />

        <Select
          label="Analista"
          value={data.analyst_programador}
          onChange={(e) =>
            setData({ ...data, analyst_programador: e.target.value })
          }
          required
          disabled={isReadOnly}
          options={(programadores || []).map((a: any) => ({
            value: a.id,
            label: a.name,
          }))}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || isReadOnly}>
          {isReadOnly ? '🔒 Solo Lectura' : 'Guardar Programación'}
        </Button>
      </div>
    </form>
  );
}