# exer

# 💪 Rastreador de Ejercicios

¡Bienvenido al Rastreador de Ejercicios! Esta es una aplicación web sencilla y amigable diseñada para ayudarte a registrar y visualizar tu progreso en diferentes actividades físicas. Podrás llevar un seguimiento de tus entrenamientos diarios, ver estadísticas semanales, mensuales y anuales, y revisar un historial completo de tus registros.

## ✨ Características

- **Registro Sencillo:** Registra fácilmente diferentes tipos de ejercicios (sentadillas, flexiones, correr, etc.) con sus respectivas métricas (repeticiones, tiempo, distancia, pasos, saltos).
- **Estadísticas Interactivas:** Visualiza tu progreso con gráficos dinámicos que muestran tu rendimiento por semana, mes o año.
- **Historial Detallado:** Accede a un historial completo de todos tus entrenamientos, con la opción de eliminar registros individuales.
- **Almacenamiento Local:** Los datos se guardan directamente en tu navegador utilizando IndexedDB, lo que garantiza que tus registros se mantengan seguros y accesibles sin necesidad de un servidor.
- **Interfaz Responsiva:** Diseñado con Tailwind CSS para una experiencia de usuario consistente en dispositivos de diferentes tamaños.

## 🚀 Tecnologías Utilizadas

- **HTML5:** Estructura de la aplicación.
- **CSS3 (Tailwind CSS):** Estilos y diseño responsivo.
- **JavaScript (ES6+):** Lógica principal de la aplicación, manejo del DOM, interactividad.
- **IndexedDB:** Base de datos del lado del cliente para almacenamiento persistente de los registros.
- **Chart.js:** Biblioteca JavaScript para la creación de gráficos interactivos de las estadísticas.

## ⚙️ Cómo Usarlo (Desarrollo Local)

Para ejecutar esta aplicación en tu entorno local, sigue estos pasos:

1.  **Clona el repositorio:**

    ```bash
    git clone [https://github.com/tu-usuario/nombre-de-tu-repositorio.git](https://github.com/tu-usuario/nombre-de-tu-repositorio.git)
    ```

    (Reemplaza `tu-usuario/nombre-de-tu-repositorio` con la URL real de tu repositorio.)

2.  **Navega al directorio del proyecto:**

    ```bash
    cd nombre-de-tu-repositorio
    ```

3.  **Abre `index.html`:**
    Simplemente abre el archivo `index.html` en tu navegador web preferido (Chrome, Firefox, Edge, etc.). No necesitas un servidor web para ejecutar esta aplicación, ya que todo es del lado del cliente.

## 💡 Uso de la Aplicación

1.  **Registrar Ejercicio:**

    - Haz clic en el botón "Registrar Ejercicio".
    - Selecciona el tipo de ejercicio de las tarjetas disponibles.
    - Ingresa el valor correspondiente (repeticiones, pasos, tiempo, distancia, saltos).
    - Haz clic en "Guardar Registro".

2.  **Ver Estadísticas:**

    - Haz clic en el botón "Ver Estadísticas".
    - Utiliza los botones "Semana", "Mes" o "Año" para cambiar el período de visualización.
    - Usa los botones "&lt; Anterior" y "Siguiente &gt;" para navegar entre períodos.
    - Las tarjetas de estadísticas resumen tu rendimiento total para cada ejercicio en el período seleccionado.
    - El gráfico muestra la distribución de tus actividades.

3.  **Historial de Registros:**
    - Haz clic en el botón "Historial de Registros".
    - Verás una lista de todos tus registros de ejercicios, ordenados por fecha.
    - Puedes eliminar cualquier registro haciendo clic en el botón "Eliminar" junto a él.

## 📄 Estructura del Proyecto

.
├── index.html # Estructura principal de la aplicación
├── script.js # Lógica JavaScript y manejo de IndexedDB
├── style.css # Estilos personalizados (adicional a Tailwind)
└── README.md # Este archivo

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un error o tienes una sugerencia de mejora, por favor, abre un "issue" o envía un "pull request".

**Configuración Inicial del Repositorio (para nuevos colaboradores o si inicias un nuevo repositorio):**

Si estás iniciando un nuevo repositorio en GitHub y quieres subir este proyecto, puedes seguir estos pasos. **Si ya tienes el repositorio configurado y solo estás clonándolo, esta sección no es necesaria.**

```bash
# Inicializa un nuevo repositorio Git en tu directorio de proyecto
git init

# Agrega todos los archivos del proyecto al área de stage
git add .

# Confirma los cambios con un mensaje
git commit -m "feat: Initial commit for Exercise Tracker application"

# Renombra la rama principal a 'main' (estándar moderno)
git branch -M main

# Conecta tu repositorio local con el repositorio remoto en GitHub
# Asegúrate de reemplazar 'rodrigoquezadab/exer.git' con la URL de tu propio repositorio
git remote add origin [https://github.com/rodrigoquezadab/exer.git](https://github.com/rodrigoquezadab/exer.git)

# Sube tus archivos al repositorio remoto
git push -u origin main
```
