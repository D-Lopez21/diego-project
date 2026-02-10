// Archivo: LiquidationSection.tsx
// Copiar este contenido completo

import { Button, Input, Select } from '../common';

// Tipos de siniestro disponibles
const CLAIM_TYPES = [
  'AMBULATORIO',
  'APS',
  'CARTA AVAL',
  'FARMACIA',
  'HOSPITALIZACION',
  'JORNADA',
  'LABORATORIO',
  'ONCOLOGICO',
  'TRASLADO EN AMBULANCIA',
  'HOME CARE',
  'PREGRADO',
  'JUNTA MEDICA',
];

export default function LiquidationSection({
  data,
  setData,
  onSave,
  billExists,
  loading,
  analysts,
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
        if (!canEdit) {
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
            Tu rol: <span className="font-mono">{userRole}</span>. Se requiere: <span className="font-mono">liquidacion</span> o <span className="font-mono">admin</span>.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Fecha de Liquidación"
          type="date"
          value={data.fecha_liquidacion || ''}
          onChange={(e) =>
            setData({ ...data, fecha_liquidacion: e.target.value })
          }
          disabled={isReadOnly}
        />

        <Select
          label="Tipo de Siniestro"
          value={data.tipo_siniestro}
          onChange={(e) => setData({ ...data, tipo_siniestro: e.target.value })}
          disabled={isReadOnly}
          options={CLAIM_TYPES.map(type => ({
            value: type,
            label: type,
          }))}
        />

        <Input
          label="Monto Fact"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_fact}
          onChange={(e) => setData({ ...data, monto_fact: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="Monto AMP"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_amp}
          onChange={(e) => setData({ ...data, monto_amp: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="GNA"
          type="number"
          step="0.01"
          min="0"
          value={data.gna}
          onChange={(e) => setData({ ...data, gna: e.target.value })}
          disabled={isReadOnly}
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
          disabled={isReadOnly}
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
          disabled={isReadOnly}
        />

        {/* Campo calculado automáticamente - Solo lectura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ret. 5%
          </label>
          <input
            type="text"
            value={data.monto_fact ? (parseFloat(data.monto_fact) * 0.05).toFixed(2) : '0.00'}
            readOnly
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Calculado automáticamente (5% del Monto Fact)
          </p>
        </div>

        <Input
          label="Monto Indemniz"
          type="number"
          step="0.01"
          min="0"
          value={data.monto_indemniz}
          onChange={(e) => setData({ ...data, monto_indemniz: e.target.value })}
          disabled={isReadOnly}
        />

        <Input
          label="Nomenclatura de Lote"
          value={data.nomenclature_pile}
          onChange={(e) =>
            setData({ ...data, nomenclature_pile: e.target.value })}
          disabled={isReadOnly}
        />

        <Select
          label="Analista Liquidador"
          value={data.analyst_liquidador}
          onChange={(e) =>
            setData({ ...data, analyst_liquidador: e.target.value })
          }
          required
          disabled={isReadOnly}
          options={analysts?.map((a: any) => ({
            value: a.id,
            label: a.name,
          })) || []}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || isReadOnly}>
          {isReadOnly ? '🔒 Solo Lectura' : 'Guardar Liquidación'}
        </Button>
      </div>
    </form>
  );
}