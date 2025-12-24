import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import SimulationDashboard from "./components/SimulationDashboard";
import ScenarioSelection from "./components/ScenarioSelection";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ScenarioSelection />} />
          <Route path="/simulation/:sessionId" element={<SimulationDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
