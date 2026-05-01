import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EngineProvider } from './context/EngineContext';
import RootLayout from './components/layout/RootLayout';
import PipelineLayout from './components/layout/PipelineLayout';

import Dashboard from './pages/Dashboard';
import Architecture from './pages/Architecture';
import Simulations from './pages/Simulations';
import Evaluation from './pages/Evaluation';

import DataExtraction from './pages/pipeline/DataExtraction';
import ClassicalModels from './pages/pipeline/ClassicalModels';
import DeepLearning from './pages/pipeline/DeepLearning';

function App() {
  return (
    <EngineProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/evaluation" element={<Evaluation />} />
            
            <Route path="/pipeline" element={<PipelineLayout />}>
              <Route index element={<Navigate to="/pipeline/data" replace />} />
              <Route path="data" element={<DataExtraction />} />
              <Route path="model" element={<ClassicalModels />} />
              <Route path="dl" element={<DeepLearning />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </EngineProvider>
  );
}

export default App;
