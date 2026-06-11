```markdown
# 🌐 Monitoreo de Conectividad IP y Servicios en Tiempo Real

> Aplicación web portátil diseñada para realizar pruebas de conectividad (ping) y escanear puertos activos en diferentes direcciones IP. El sistema registra los estados de los equipos de forma local, muestra visualmente si un dispositivo está activo y permite ajustar la frecuencia de monitoreo de forma individual.

---

## ✨ Características Principales

* 🟢 **Monitoreo Visual:** Indicadores de estado en tiempo real (Online/Offline) mediante un panel de tarjetas sin necesidad de recargar la página.
* 🔍 **Escáner de Puertos:** Detección automática de servicios activos (HTTP, SSH, MySQL, RDP, etc.) cuando un equipo está en línea.
* ⏱️ **Frecuencia Personalizable:** Cada equipo puede tener su propia "tasa de actualización" en segundos, modificable directamente desde la interfaz.
* 🚀 **Autoconfiguración (Plug & Play):** El sistema crea su propio entorno virtual, descarga las dependencias y abre el navegador automáticamente al ejecutarse.

---

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología | Función Principal |
| :--- | :--- | :--- |
| **Backend** | `Python` & `Flask` | Procesa peticiones, ejecuta comandos nativos (ping, sockets) y sirve la API. |
| **Frontend** | `JavaScript` | Gestiona temporizadores asíncronos (`setInterval`) y peticiones al servidor. |
| **Interfaz** | `HTML5` & `CSS3` | Estructura semántica y diseño visual interactivo basado en tarjetas de estado. |
| **Persistencia** | `JSON` | Base de datos local (`datos.json`) autogenerada al registrar el primer equipo. |
| **Dependencias** | `pyproject.toml` | Archivo de configuración para la auto-instalación de librerías necesarias. |

---

## 🚀 Instrucciones de Ejecución

El proyecto está diseñado para ser completamente portátil. No necesitas configurar servidores ni bases de datos complejas.

### Paso 1: Preparación
Descomprime el archivo `.zip` del proyecto en cualquier ubicación de tu equipo y abre una terminal (o símbolo del sistema) dentro de la carpeta extraída.

### Paso 2: Arranque del Sistema
Ejecuta el archivo principal según tu sistema operativo:

**Windows:**
```bash
python app.py

```

*(Nota: Si usas una versión reciente, también puedes usar `py app.py`)*

**Linux / macOS:**

```bash
python3 app.py

```

### 💡 ¿Qué pasará al ejecutar el comando?

1. El sistema detectará automáticamente si es su primera ejecución.
2. Creará un entorno virtual aislado (`venv`).
3. Instalará las dependencias necesarias en segundo plano.
4. **Abrirá tu navegador web** directamente en `http://127.0.0.1:5000` para empezar a registrar equipos.

---

## 📂 Portabilidad y Datos

Toda la información de los dispositivos registrados se guarda de forma segura en el archivo local `datos.json`.

> **Nota:** Si deseas compartir esta herramienta o instalarla en un equipo nuevo desde cero, simplemente asegúrate de **eliminar el archivo `datos.json**` antes de empaquetarlo. El sistema generará uno nuevo automáticamente en el nuevo destino.

```

```
