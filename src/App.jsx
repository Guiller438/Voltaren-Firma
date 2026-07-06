import { BrowserRouter, Routes, Route } from "react-router-dom";
import Formulario from "./Formulario";
import Gracias from "./Gracias";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Formulario />} />
        <Route path="/gracias" element={<Gracias />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
