# Monitoreo de Conectividad IP (Ping en Tiempo Real) 

Aplicación web diseñada para realizar pruebas de conectividad (*ping*) en tiempo real a diferentes direcciones IP. El sistema registra los estados de los equipos, almacena un historial y muestra de forma visual (mediante indicadores verde/rojo) si un dispositivo está activo o inactivo en la red física.

---

## Tecnologías Utilizadas

* **Python & Flask (Backend):** Procesa las peticiones web, ejecuta los comandos de diagnóstico *ping* nativos del sistema y envía los datos en tiempo real hacia la interfaz.
* **HTML5:** Define la estructura semántica de la página, los formularios de entrada para nuevas IPs y las tablas de visualización.
* **CSS3:** Controla el aspecto visual, estilos de los indicadores de estado, márgenes y diseño adaptativo.
* **JavaScript (Frontend):** Gestiona la actualización asíncrona de la interfaz en tiempo real mediante peticiones en segundo plano al servidor, eliminando la necesidad de recargar la página manualmente.
* **Archivo JSON (Persistencia):** Actúa como base de datos ligera. Toda la información y estados de las IPs registradas se almacenan en el archivo `datos.json`.
* **Ubuntu (Servidor de Despliegue):** Entorno de producción que aloja el entorno virtual de Python (`venv`), procesa las solicitudes en segundo plano y asegura la estabilidad del servicio.
* **pyproject.toml:** Archivo de configuración moderno para la gestión de dependencias, indicando las librerías necesarias (como Flask) para el entorno.

---

## Instrucciones de Ejecución

Sigue estos pasos para probar la aplicación en tu entorno local:

1. **Descomprimir** el archivo `.zip` del proyecto.
2. **Abrir una terminal** o línea de comandos dentro de la carpeta extraída.
3. **Ejecutar** el servidor según tu sistema operativo:

* **Linux / macOS:**
  ```bash
  python3 app.py
  ```

* **Windows:**
  ```cmd
  py app.py
  ```

4. **Acceder** a la aplicación abriendo tu navegador web e ingresando a la dirección local que te indique la terminal (por defecto `http://127.0.0.1:5000`).
