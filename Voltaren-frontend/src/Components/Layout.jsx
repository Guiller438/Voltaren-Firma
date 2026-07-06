import voltarenLogo from "/voltaren.png";

/*
  Layout común para los 3 pasos del flujo.

  Props:
    paso      (1|2|3)  — paso actual
    children           — contenido de la pantalla
*/

export default function Layout({ paso, children }) {
  return (
    <div style={s.pantalla}>
      <div style={s.tarjeta}>
        {/* Header */}
        <div style={s.header}>
          <img
            src={voltarenLogo}
            alt="Voltaren"
            style={s.logo}
          />

          <h2 style={s.titulo}>
            Liberación de
            <br />
            Responsabilidad
          </h2>
        </div>

        {/* Barra de progreso */}
        <div style={s.progreso}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={s.pasoWrap}>
              <div
                style={{
                  ...s.circulo,
                  background:
                    n <= paso
                      ? "var(--naranja)"
                      : "var(--gris-borde)",
                  color:
                    n <= paso
                      ? "#FFFFFF"
                      : "var(--texto-suave)",
                }}
              >
                {n < paso ? "✓" : n}
              </div>

              <span
                style={{
                  ...s.pasoLabel,
                  color:
                    n <= paso
                      ? "var(--naranja)"
                      : "var(--texto-suave)",
                  fontWeight: n === paso ? 600 : 400,
                }}
              >
                {["Datos", "Términos", "Firma"][n - 1]}
              </span>
            </div>
          ))}

          {/* Líneas conectoras */}
          <div
            style={{
              ...s.linea,
              left: "calc(16.6% + 16px)",
              width: "calc(33.3% - 32px)",
            }}
          />

          <div
            style={{
              ...s.linea,
              left: "calc(50% + 16px)",
              width: "calc(33.3% - 32px)",
            }}
          />
        </div>

        {/* Contenido */}
        <div style={s.cuerpo}>
          {children}
        </div>
      </div>
    </div>
  );
}

const s = {
  pantalla: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    padding: "16px 12px 32px",
  },

  tarjeta: {
    background: "#FFFFFF",
    borderRadius: "24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "520px",
    overflow: "hidden",
  },

  header: {
    background: "linear-gradient(135deg, #FF8C00, #E8622A)",
    padding: "20px 24px 28px",
    textAlign: "center",
  },

  logo: {
    width: "90px",
    height: "90px",
    objectFit: "contain",
    display: "block",
    margin: "0 auto 8px",
  },

  titulo: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "30px",
    fontWeight: "800",
    lineHeight: "1.15",
    textAlign: "center",
    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
  },

  progreso: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "18px 20px 14px",
    borderBottom: "1px solid var(--gris-borde)",
    position: "relative",
  },

  pasoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    zIndex: 1,
  },

  circulo: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all .3s ease",
  },

  pasoLabel: {
    fontSize: "11px",
  },

  linea: {
    position: "absolute",
    top: "35px",
    height: "2px",
    background: "var(--gris-borde)",
    zIndex: 0,
  },

  cuerpo: {
    padding: "24px",
  },
};