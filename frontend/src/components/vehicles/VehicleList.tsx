import { useVehicles } from '../../hooks';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import type { VehicleStatus } from '../../types';

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatSpeed(speed: number | null): string {
  if (speed === null) return '-';
  return `${speed.toFixed(1)} km/h`;
}

function VehicleRow({ vehicle }: { vehicle: VehicleStatus }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-semibold text-gray-900">{vehicle.id}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <VehicleStatusBadge status={vehicle.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {vehicle.lastLatitude !== null && vehicle.lastLongitude !== null ? (
          <span>
            {vehicle.lastLatitude.toFixed(4)}, {vehicle.lastLongitude.toFixed(4)}
          </span>
        ) : (
          <span className="text-gray-400">Sin datos</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {formatSpeed(vehicle.lastSpeed)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {formatDateTime(vehicle.lastRecordedAt)}
      </td>
    </tr>
  );
}

export function VehicleList() {
  const { vehicles, loading, error, lastUpdated } = useVehicles();

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Cargando vehiculos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600 mr-2">!</span>
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Vehiculos ({vehicles.length})
        </h2>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}
          </span>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay vehiculos registrados
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posicion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Velocidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ultima Transmision
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((vehicle: VehicleStatus) => (
                <VehicleRow key={vehicle.id} vehicle={vehicle} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
