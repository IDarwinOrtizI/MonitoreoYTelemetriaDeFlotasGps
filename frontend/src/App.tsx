import { Layout, VehicleMap, VehicleTable, StatisticsCards } from './components';
import styles from './styles/layout.module.css';

function App() {
  return (
    <Layout>
      <StatisticsCards />
      <div className={styles.grid}>
        <VehicleMap />
        <VehicleTable />
      </div>
    </Layout>
  );
}

export default App;
