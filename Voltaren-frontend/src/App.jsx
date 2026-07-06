import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Formulario from "./components/Formulario";
import Terminos   from "./components/Terminos";
import PanelFirma from "./components/PanelFirma";
import Gracias    from "./components/Gracias";

/*
  App maneja el estado global del flujo:
    paso 0 → Datos personales
    paso 1 → Términos y condiciones
    paso 2 → Firma
    /gracias → Confirmación

  Los datos se acumulan en `formData` y se envían todos juntos
  desde PanelFirma cuando el participante termina de firmar.
*/
function FlujoRegistro() {
  const [paso, setPaso] = useState(0);
  const [formData, setFormData] = useState({
    nombres:  "",
    cedula:   "",
    contacto: "",
  });

  const irAPaso = (n) => setPaso(n);
  const actualizar = (campos) => setFormData(prev => ({ ...prev, ...campos }));

  if (paso === 0) return (
    <Formulario
      datos={formData}
      onChange={actualizar}
      onSiguiente={() => irAPaso(1)}
    />
  );

  if (paso === 1) return (
    <Terminos
      nombre={formData.nombres}
      onVolver={() => irAPaso(0)}
      onSiguiente={() => irAPaso(2)}
    />
  );

  if (paso === 2) return (
    <PanelFirma
      datos={formData}
      onVolver={() => irAPaso(1)}
    />
  );

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<FlujoRegistro />} />
        <Route path="/gracias" element={<Gracias />} />
      </Routes>
    </BrowserRouter>
  );
}
