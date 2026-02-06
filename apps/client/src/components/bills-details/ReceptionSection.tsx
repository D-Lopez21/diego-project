import { Button, Input, Select } from '../common';

export default function ReceptionSection({
  data,
  setData,
  providers,
  analysts,
  onSave,
  isNewBill,
  loading,
}: any) {
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
          label="Fecha de Recepción"
          type="date"
          value={data.arrival_date}
          onChange={(e) =>
            setData({ ...data, arrival_date: e.target.value })
          }
        />

        <Select
          label="Proveedor"
          value={data.suppliers_id}
          onChange={(e) => setData({ ...data, suppliers_id: e.target.value })}
          required
          options={providers.map((p: any) => ({
            value: p.id,
            label: `${p.name}${p.rif ? ` - ${p.rif}` : ''}`,
          }))}
        />

        <Input
          label="N° de Siniestro"
          value={data.n_claim}
          onChange={(e) => setData({ ...data, n_claim: e.target.value })}
        />

        <Input
          label="Fact / Proform"
          value={data.type}
          onChange={(e) => setData({ ...data, type: e.target.value })}
        />

        <Input
          label="N° de Fact"
          value={data.n_billing}
          onChange={(e) => setData({ ...data, n_billing: e.target.value })}
        />

        <Input
          label="N° de Control"
          value={data.n_control}
          onChange={(e) => setData({ ...data, n_control: e.target.value })}
        />

        <Select
          label="Moneda"
          value={data.currency_type}
          onChange={(e) => setData({ ...data, currency_type: e.target.value })}
          options={[
            { label: 'Dólares', value: 'USD' }, // El value debe ser USD
            { label: 'Bolívares', value: 'VES' }, // El value debe ser VES
          ]}
          />  

        <Input
          label="Monto Total Facturado"
          type="number"
          step="0.01"
          min="0"
          value={data.total_billing}
          onChange={(e) => setData({ ...data, total_billing: e.target.value })}
        />

        <Select
          label="Analista Receptor"
          value={data.analyst_receptor_id}
          onChange={(e) => setData({ ...data, analyst_receptor_id: e.target.value })}
          required
          options={analysts.map((a: any) => ({
            value: a.id,
            label: a.name,
          }))}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {isNewBill ? 'Crear Factura' : 'Guardar Recepción'}
        </Button>
      </div>
    </form>
  );
}