import React from 'react';
import { Button, DashboardLayout, Input } from './common';
import { PlusIcon } from './icons';
import BillsTable from './BillsTable';
import { useNavigate } from 'react-router';

export default function BillingPage() {
     const navigate = useNavigate();
  const [selectedBillId, setSelectedBillId] = React.useState<string | null>(null);

  const handleNewBill = () => {
    setSelectedBillId(null);
    navigate('create-bill');
  };

  return (
    <DashboardLayout title="Sistema de Facturación" returnTo="/">
      <div id="header-actions" className="w-full flex justify-end">
        {/* TODO: Implement search functionality */}
        <Input
          type="search"
          placeholder="Buscar factura..."
          className="mr-4 max-w-sm"
        />
        <Button
          icon={<PlusIcon className="size-6" />}
          className="mb-4 justify-start gap-2"
          onClick={handleNewBill}
        >
          Nueva Factura
        </Button>
      </div>
      <BillsTable />

    </DashboardLayout>
  );
}