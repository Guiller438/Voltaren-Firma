import { useNavigate } from "react-router-dom";
import "./App.css";

function Gracias() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <img src="/voltaren.png" alt="Logo Voltaren" style={{ maxWidth: "180px", marginBottom: "1rem" }} />

      <div className="mensaje-gracias">
        <div className="icono-check">✔️</div>
        <h1>¡Gracias por participar!</h1>
        <p>Tu documento ha sido recibido exitosamente.</p>
        <p style={{ fontSize: "0.9rem", color: "#004aad" }}>
          Gracias por tu compromiso con tu bienestar.
        </p>
        <button onClick={() => navigate("/")}>Firmar otro documento</button>
      </div>
    </div>
  );
}

export default Gracias;
