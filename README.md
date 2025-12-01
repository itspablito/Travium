# Travium

Travium es una aplicación diseñada para gestionar reservas de alojamientos, vehículos, vuelos y experiencias, proporcionando una experiencia de usuario fluida y eficiente.

---

## Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalados los siguientes programas:

1. **Node.js** (versión 16 o superior)
   - Puedes descargarlo desde [Node.js](https://nodejs.org/).
2. **npm** (incluido con Node.js) o **yarn** como gestor de paquetes.
3. **Git** (opcional, para clonar el repositorio)
   - Descárgalo desde [Git](https://git-scm.com/).

---

## Instalación

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/itspablito/Travium.git
   cd Travium
   ```

2. **Instalar dependencias**
   Ejecuta el siguiente comando para instalar todas las dependencias necesarias:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crea un archivo `.env` en la raíz del proyecto.
   - Agrega las variables necesarias para la configuración del entorno. Por ejemplo:
     ```env
     REACT_APP_API_URL=https://api.travium.com
     REACT_APP_GOOGLE_MAPS_KEY=tu_clave_de_google_maps
     ```

---

## Scripts Disponibles

En el archivo `package.json` se encuentran definidos varios scripts útiles. Los más importantes son:

- **Iniciar el servidor de desarrollo:**
  ```bash
  npm run dev
  ```
  Esto iniciará el servidor de desarrollo utilizando Vite.

- **Construir el proyecto para producción:**
  ```bash
  npm run build
  ```
  Genera los archivos optimizados para producción en la carpeta `dist`.

- **Previsualizar la construcción de producción:**
  ```bash
  npm run preview
  ```
  Sirve los archivos de producción localmente para pruebas.

- **Linter:**
  ```bash
  npm run lint
  ```
  Verifica el código para asegurarse de que sigue las reglas de estilo definidas.

---

## Estructura del Proyecto

```
Travium/
├── public/               # Archivos estáticos
├── src/                  # Código fuente principal
│   ├── assets/           # Recursos como imágenes y fuentes
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Vistas principales de la aplicación
│   ├── index.css         # Estilos globales
│   ├── main.jsx          # Punto de entrada de la aplicación
├── package.json          # Configuración del proyecto y dependencias
├── vite.config.js        # Configuración de Vite
└── README.md             # Documentación del proyecto
```

---

## Tecnologías Utilizadas

- **React**: Biblioteca para construir interfaces de usuario.
- **Vite**: Herramienta de construcción rápida para proyectos modernos de frontend.
- **React Router**: Manejo de rutas en la aplicación.
- **Axios**: Cliente HTTP para realizar solicitudes a APIs.
- **ESLint**: Herramienta para mantener un código limpio y consistente.

---

## Ejecución

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Abre tu navegador y accede a `http://localhost:5173` para ver la aplicación en funcionamiento.

2. **Construir para producción**
   ```bash
   npm run build
   ```
   Los archivos optimizados se generarán en la carpeta `dist`.

3. **Previsualizar la construcción de producción**
   ```bash
   npm run preview
   ```
   Esto sirve los archivos de producción localmente para pruebas.

---

## Contribuir

Si deseas contribuir a este proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección de errores:
   ```bash
   git checkout -b nombre-de-tu-rama
   ```
3. Realiza tus cambios y realiza commits descriptivos.
4. Envía un pull request detallando los cambios realizados.

---

## Contacto

Si tienes preguntas o necesitas ayuda, no dudes en contactar al equipo de desarrollo a través de [correo electrónico](juan.rodriguez.g@correounivalle.edu.co).

---

¡Gracias por usar Travium!
