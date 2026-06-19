import { Layout, VehicleMap, VehicleList } from './components';

function App() {
  return (
    <Layout>
      <div className="space-y-6">
        <VehicleMap />
        <VehicleList />
      </div>
    </Layout>
  );
}

export default App;
