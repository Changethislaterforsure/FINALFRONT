import { Routes, Route } from "react-router-dom";
import Airports from "./pages/Airports";
import AirportDetails from "./pages/AirportDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Airports />} />
      <Route path="/airports/:id" element={<AirportDetails />} />
    </Routes>
  );
}

export default App;