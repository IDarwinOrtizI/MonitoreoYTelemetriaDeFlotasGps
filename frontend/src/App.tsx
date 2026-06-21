import { Layout, VehicleMap, VehicleTable, StatisticsCards } from './components';
import { useVehicles } from './hooks';
import styles from './styles/layout.module.css';

function App() {
  const { loading, error } = useVehicles();

  return (
    <Layout>
      <StatisticsCards loading={loading} error={error} />
      <div className={styles.grid}>
        <VehicleMap loading={loading} error={error} />
        <VehicleTable />
      </div>
    </Layout>
  );
}

export default App;
