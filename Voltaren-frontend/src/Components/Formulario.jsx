import { useState } from "react";
import Layout from "./Layout";

/* Algoritmo módulo 10 — igual al que usa el backend */
function validarCedula(cedula) {
  if (cedula.length !== 10) return "La cédula debe tener 10 dígitos";
  if (!/^\d+$/.test(cedula)) return "La cédula debe contener solo números";

  const provincia = parseInt(cedula.slice(0, 2));
  if (provincia < 1 || provincia > 24) return "Código de provincia inválido";

  const tercero = parseInt(cedula[2]);
  if (tercero >= 6) return "Cédula inválida";

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula[i]) * coeficientes[i];
    if (val >= 10) val -= 9;
    total += val;
  }
  const verificador = (10 - (total % 10)) % 10;
  if (verificador !== parseInt(cedula[9])) return "Cédula inválida";

  return ""; // válida
}

export default function Formulario({ datos, onChange, onSiguiente }) {
  const [errores, setErrores] = useState({});

  const validar = () => {
    const e = {};
    const nom = datos.nombres.trim();
    const ced = datos.cedula.trim();
    const con = datos.contacto.trim();

    if (nom.length < 3) e.nombres = "Ingresa tu nombre completo";

    const errorCedula = validarCedula(ced);
    if (errorCedula) e.cedula = errorCedula;

    if (con.length < 9) e.contacto = "Ingresa un número de teléfono válido";

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const siguiente = () => {
    if (validar()) onSiguiente();
  };

  return (
    <Layout paso={1}>
      <h2 style={s.titulo}>Tus datos</h2>
      <p style={s.desc}>Completa la información para generar tu documento de participación.</p>

      <Campo
        label="Nombre completo"
        tipo="text"
        placeholder="Ej: María García López"
        valor={datos.nombres}
        error={errores.nombres}
        onChange={v => {
          const soloLetras = v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\']/g, "");
          onChange({ nombres: soloLetras });
          if (errores.nombres) setErrores(p => ({ ...p, nombres: "" }));
        }}
        inputMode="text"
        autoComplete="name"
      />

      <Campo
        label="Número de cédula"
        tipo="text"
        placeholder="1234567890"
        valor={datos.cedula}
        error={errores.cedula}
        onChange={v => {
          const soloNum = v.replace(/\D/g, "").slice(0, 10);
          onChange({ cedula: soloNum });
          if (errores.cedula) setErrores(p => ({ ...p, cedula: "" }));
        }}
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
      />

      <Campo
        label="Número de teléfono"
        tipo="tel"
        placeholder="0987654321"
        valor={datos.contacto}
        error={errores.contacto}
        onChange={v => {
          const soloNum = v.replace(/\D/g, "").slice(0, 10);
          onChange({ contacto: soloNum });
          if (errores.contacto) setErrores(p => ({ ...p, contacto: "" }));
        }}
        inputMode="numeric"
        autoComplete="tel"
        maxLength={10}
      />

      <button style={s.btn} onClick={siguiente}>
        Continuar →
      </button>
    </Layout>
  );
}

function Campo({ label, tipo, placeholder, valor, error, onChange, inputMode, autoComplete, maxLength }) {
  return (
    <div style={s.campoWrap}>
      <label style={s.label}>{label}</label>
      <input
        type={tipo}
        placeholder={placeholder}
        value={valor}
        onChange={e => onChange(e.target.value)}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        style={{ ...s.input, ...(error ? s.inputError : {}) }}
      />
      {error && <span style={s.error}>{error}</span>}
    </div>
  );
}

const s = {
  titulo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--azul)",
    marginBottom: "6px",
  },
  desc: {
    fontSize: "14px",
    color: "var(--texto-suave)",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  campoWrap: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--texto)",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1.5px solid var(--gris-borde)",
    borderRadius: "var(--radio-sm)",
    fontSize: "16px",
    color: "var(--texto)",
    outline: "none",
    transition: "border-color 0.2s",
    WebkitAppearance: "none",
  },
  inputError: {
    borderColor: "var(--error)",
    background: "#FFF5F5",
  },
  error: {
    display: "block",
    fontSize: "12px",
    color: "var(--error)",
    marginTop: "4px",
  },
  btn: {
    width: "100%",
    padding: "16px",
    marginTop: "8px",
    background: "var(--naranja)",
    color: "white",
    border: "none",
    borderRadius: "var(--radio-sm)",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
};
