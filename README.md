# Voltaren Firma

Sistema de registro digital para liberación de responsabilidad de participantes de eventos Voltaren.

## Descripción

La aplicación permite:

- Registro de participantes.
- Aceptación de términos y condiciones.
- Captura de firma digital desde dispositivos móviles o escritorio.
- Generación automática de PDF firmado.
- Almacenamiento de registros en PostgreSQL.
- Carga automática del PDF a Google Drive.
- Interfaz responsive optimizada para teléfonos móviles.

---

## Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- FastAPI
- Python 3.12
- ReportLab
- Pillow
- PostgreSQL

### Integraciones

- Google Drive API (OAuth 2.0)
- Google Cloud Platform

---

## Estructura del proyecto

```text
Voltaren/
│
├── Voltaren-backend/
│   ├── App/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── drive.py
│   │   ├── pdf_generator.py
│   │   └── utils.py
│   │
│   ├── templates/
│   ├── Static/
│   └── requirements.txt
│
├── Voltaren-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── render.yaml
└── README.md
```

---

## Flujo de funcionamiento

1. El participante ingresa sus datos.
2. Acepta la liberación de responsabilidad.
3. Firma digitalmente.
4. El backend genera un PDF firmado.
5. El registro se almacena en PostgreSQL.
6. El PDF se carga automáticamente a Google Drive.
7. Se muestra la confirmación al usuario.

---

## Variables de entorno

### Backend

```env
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

DRIVE_FOLDER_ID=
HALEON_CONTACTO=
```

---

## Ejecución local

### Backend

```bash
cd Voltaren-backend

pip install -r requirements.txt

python -m uvicorn App.main:app --reload --port 8000
```

Backend disponible en:

```text
http://localhost:8000
```

---

### Frontend

```bash
cd Voltaren-frontend

npm install

npm run dev
```

Frontend disponible en:

```text
http://localhost:5173
```

---

## Despliegue

La aplicación está preparada para desplegarse mediante:

- Render
- PostgreSQL
- Google Drive API

---

## Características principales

- Responsive para dispositivos móviles.
- Firma digital integrada.
- Generación automática de PDF.
- Persistencia en base de datos.
- Integración con Google Drive.
- Arquitectura Frontend + Backend desacoplada.

---

## Autor

Guillermo Alvarez

Proyecto desarrollado para la gestión digital de liberaciones de responsabilidad en actividades promocionales Voltaren.