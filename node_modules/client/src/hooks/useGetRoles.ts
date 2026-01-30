import React from 'react';

export default function useGetRoles() {
  const [roles, setRoles] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Simulamos una llamada a una API para obtener los roles
    const fetchRoles = async () => {
      // Aquí iría la lógica real para obtener los roles, por ahora usamos datos simulados
      const simulatedRoles = [
        'admin',
        'recepcion',
        'liquidacion',
        'auditoria',
        'pagos',
        'finiquito',
        'proveedor',
      ];
      setRoles(simulatedRoles);
    };

    fetchRoles();
  }, []);
  return roles;
}
