import { useNavigate } from "react-router-dom";
import voltarenLogo from "/voltaren.png";

export default function Gracias() {
  const navigate = useNavigate();

  return (
    <div style={s.pantalla}>
      <div style={s.tarjeta}>
        <div style={s.header}>
          <img src={voltarenLogo} alt="Voltaren" style={s.logo} />
        </div>

        <div style={s.cuerpo}>
          <div style={s.check}>✓</div>

          <h1 style={s.titulo}>¡Registro completado!</h1>

          <p style={s.texto}>
            Tu liberación de responsabilidad fue firmada y registrada
            exitosamente. Ya puedes disfrutar de la actividad.
          </p>

          <div style={s.chip}>
            <span style={s.chipDot} />
            Documento guardado correctamente
          </div>

          <button
            style={s.boton}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  pantalla: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },

  tarjeta: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "400px",
    overflow: "hidden",
    animation: "aparecer 0.4s ease",
  },

  header: {
    background: "linear-gradient(135deg, #FF8C00, #E8622A)",
    padding: "24px 20px",
    textAlign: "center",
  },

  logo: {
    height: "40px",
    objectFit: "contain",
    filter: "brightness(0) invert(1)",
  },

  cuerpo: {
    padding: "32px 24px 36px",
    textAlign: "center",
  },

  check: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "var(--exito)",
    color: "white",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },

  titulo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--azul)",
    marginBottom: "12px",
  },

  texto: {
    fontSize: "15px",
    color: "var(--texto-suave)",
    lineHeight: "1.6",
    marginBottom: "24px",
  },

  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#EAF3DE",
    color: "var(--exito)",
    fontSize: "13px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "20px",
  },

  chipDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--exito)",
    flexShrink: 0,
  },

  boton: {
    marginTop: "24px",
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #FF8C00, #E8622A)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};