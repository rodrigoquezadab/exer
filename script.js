document.addEventListener("DOMContentLoaded", () => {
  // --- Configuración y Estado ---
  const EXERCISES = {
    // Aeróbico / Cardio
    Correr: { type: "Distancia", unit: "km", icon: "🏃", baseUnit: "Tiempo", conversion: 5 }, // 1km = 5 min Cardio
    Caminar: { type: "Pasos", unit: "pasos", icon: "🚶", baseUnit: "Tiempo", conversion: 1 / 1000 }, // 1000 pasos = 1 min Cardio
    Bicicleta: { type: "Tiempo", unit: "min", icon: "🚴", baseUnit: "Tiempo", conversion: 1 }, // 1 min = 1 min Cardio
    
    // Fuerza General
    "Levantar Pesas": { type: "Repeticiones", unit: "reps", icon: "🏋️", baseUnit: "Repeticiones", conversion: 1 }, 
    Sentadillas: { type: "Repeticiones", unit: "reps", icon: "🍑", baseUnit: "Repeticiones", conversion: 1 },
    Flexiones: { type: "Repeticiones", unit: "reps", icon: "💪", baseUnit: "Repeticiones", conversion: 1 },
    
    // Abdominales y Core
    "Plancha": { type: "Tiempo", unit: "min", icon: "🪵", baseUnit: "Tiempo", conversion: 1 }, // Contribuye a Cardio/Tiempo
    "Crunches": { type: "Repeticiones", unit: "reps", icon: "🍫", baseUnit: "Repeticiones", conversion: 1 },
    "Elev. Piernas": { type: "Repeticiones", unit: "reps", icon: "🦵", baseUnit: "Repeticiones", conversion: 1 },
    "Giros Rusos": { type: "Repeticiones", unit: "reps", icon: "🌪️", baseUnit: "Repeticiones", conversion: 1 },
    "Escaladores": { type: "Repeticiones", unit: "reps", icon: "🧗", baseUnit: "Repeticiones", conversion: 1 },
    "Tijeras": { type: "Repeticiones", unit: "reps", icon: "✂️", baseUnit: "Repeticiones", conversion: 1 }
  };

  let currentExercise = null;
  let chartInstance = null;
  let weightChartInstance = null;
  
  // Metas por defecto
  let goals = {
      cardioMin: 90,
      strengthReps: 300
  };

  // --- IndexedDB Setup ---
  const DB_NAME = "FitTrackDB";
  const DB_VERSION = 2; 
  const STORE_RECORDS = "exerciseRecords"; 
  const STORE_WEIGHTS = "weightRecords"; 
  let db;

  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        db = e.target.result;
        // 1. Store de Ejercicios
        if (!db.objectStoreNames.contains(STORE_RECORDS)) {
          db.createObjectStore(STORE_RECORDS, { keyPath: "date" });
        }
        // 2. Store de Peso
        if (!db.objectStoreNames.contains(STORE_WEIGHTS)) {
          db.createObjectStore(STORE_WEIGHTS, { keyPath: "date" });
        }
      };
      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      request.onerror = (e) => reject(e);
    });
  };

  const dbAction = (storeName, mode, callback) => {
    // CORRECCIÓN CLAVE: Se eliminó un 'new' para que la función devuelva una nueva promesa correctamente.
    return new Promise(async (resolve, reject) => { 
      if (!db) await initDB();
      if (!db.objectStoreNames.contains(storeName)) {
        console.error(`Store name ${storeName} not found.`);
        return reject(new Error(`Store name ${storeName} not found.`));
      }
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const req = callback(store);
      
      // Gestión de la promesa usando los eventos de la transacción
      tx.oncomplete = (e) => resolve(req.result); 
      tx.onerror = (e) => reject(e.target.error); 
      req.onerror = (e) => reject(e.target.error); 
    });
  };

  // --- Funciones de Gestión de Datos (NUEVAS/MODIFICADAS) ---

  // ... (deleteAllData, restoreData, saveRecord, getAllRecords, deleteRecord, saveWeightRecord, getAllWeightRecords se mantienen igual o con la corrección de dbAction aplicada) ...
  
  // NUEVA: Función para eliminar TODOS los registros y metas
  async function deleteAllData() {
      if (!confirm("¡ADVERTENCIA! Estás a punto de eliminar TODOS tus datos de ejercicios y peso, así como tus metas. Esta acción es IRREVERSIBLE. ¿Continuar?")) {
          return false;
      }

      try {
          // 1. Eliminar Registros de Ejercicios
          await dbAction(STORE_RECORDS, "readwrite", (store) => store.clear());
          
          // 2. Eliminar Registros de Peso
          await dbAction(STORE_WEIGHTS, "readwrite", (store) => store.clear());

          // 3. Eliminar Metas
          localStorage.removeItem('fitTrackGoals');
          goals = { cardioMin: 90, strengthReps: 300 };
          
          alert("Todos los datos (ejercicios, peso y metas) han sido eliminados exitosamente. La aplicación se recargará.");
          window.location.reload(); 
          return true;
      } catch (error) {
          console.error("Error al eliminar todos los datos:", error);
          alert("Ocurrió un error al intentar eliminar los datos.");
          return false;
      }
  }

  // MODIFICADA: Lógica de Restauración con Opciones
  async function restoreData(file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const data = JSON.parse(e.target.result);
              
              // 1. Preguntar al usuario qué tipo de importación quiere
              const choice = prompt(
                  "¿Cómo desea importar los datos?\n\n" +
                  "1. REEMPLAZAR TODO: Elimina todos los datos locales y los reemplaza con el respaldo.\n" +
                  "2. AGREGAR REGISTROS (Recomendado): Conserva los datos locales y añade los del respaldo (los registros con FECHAS duplicadas serán SOBRESCRITOS por los del respaldo).\n\n" +
                  "Ingrese '1' o '2'."
              );

              if (choice !== '1' && choice !== '2') {
                  alert("Importación cancelada.");
                  return;
              }

              let addedRecords = 0;
              let addedWeights = 0;

              if (choice === '1') {
                  // Opción 1: REEMPLAZAR TODO
                  if (!confirm("Confirmar REEMPLAZO TOTAL. ¿Está seguro de que desea eliminar todos los datos locales ANTES de restaurar el respaldo?")) {
                      return;
                  }
                  
                  // Limpiar ambas bases de datos y metas antes de restaurar
                  await dbAction(STORE_RECORDS, "readwrite", (store) => store.clear());
                  await dbAction(STORE_WEIGHTS, "readwrite", (store) => store.clear());
                  localStorage.removeItem('fitTrackGoals');
              }
              
              // 2. Restaurar Metas
              if(data.goals) {
                  goals = data.goals;
                  localStorage.setItem('fitTrackGoals', JSON.stringify(goals));
              }

              // Función auxiliar para restaurar registros en un store
              const restoreStore = async (storeName, recordsArray) => {
                  if (recordsArray && Array.isArray(recordsArray)) {
                      const tx = db.transaction(storeName, "readwrite");
                      const store = tx.objectStore(storeName);
                      let count = 0;

                      for (const record of recordsArray) {
                          try {
                              // Usamos .put() que inserta o actualiza si la clave (date) existe.
                              store.put(record); 
                              count++;
                          } catch (err) {
                              // Error al insertar (ej. dato mal formado)
                              console.warn(`Skipping record in ${storeName} due to error:`, record, err);
                          }
                      }
                      await new Promise(resolve => { tx.oncomplete = resolve; });
                      return count;
                  }
                  return 0;
              };

              // 3. Restaurar Registros de Ejercicio
              addedRecords = await restoreStore(STORE_RECORDS, data.records);
              
              // 4. Restaurar Registros de Peso
              addedWeights = await restoreStore(STORE_WEIGHTS, data.weightRecords);
              
              alert(`Restauración completada.\n\n${addedRecords} ejercicios y ${addedWeights} pesos procesados.`);
              updateUI();

          } catch (err) {
              alert("Error al leer o analizar el archivo de respaldo. Asegúrate de que sea un JSON válido.");
              console.error(err);
          }
      };
      reader.readAsText(file);
  }
  
  // --- Funciones de Ejercicios y Peso (se mantienen igual) ---

  async function saveRecord(value) {
      const record = {
          date: new Date().toISOString(),
          exercise: currentExercise,
          type: EXERCISES[currentExercise].type,
          value: parseFloat(value)
      };
      await dbAction(STORE_RECORDS, "readwrite", (store) => store.add(record));
      updateUI();
  }

  async function getAllRecords() {
      return await dbAction(STORE_RECORDS, "readonly", (store) => store.getAll()) || [];
  }

  async function deleteRecord(dateKey) {
      await dbAction(STORE_RECORDS, "readwrite", (store) => store.delete(dateKey));
      updateUI();
  }
  
  async function saveWeightRecord(weight, date) {
      const record = {
          date: date,
          weight: parseFloat(weight)
      };
      await dbAction(STORE_WEIGHTS, "readwrite", (store) => store.put(record));
      updateUI();
  }

  async function getAllWeightRecords() {
      return await dbAction(STORE_WEIGHTS, "readonly", (store) => store.getAll()) || [];
  }


  // --- Lógica de Agregación de Datos REALES (NUEVA) ---

  function aggregateRecords(records, period) {
      const results = {};
      let labels = [];
      let title = "";

      // Función auxiliar para obtener el inicio de la semana/mes/año
      const getPeriodStart = (date, period) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          if (period === 'week') {
              const dayOfWeek = (d.getDay() + 6) % 7; // Lunes = 0
              d.setDate(d.getDate() - dayOfWeek);
              return d.toISOString().split('T')[0];
          } else if (period === 'month') {
              d.setDate(1);
              return d.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
          } else if (period === 'year') {
              d.setMonth(0, 1);
              return d.getFullYear();
          }
      };

      if (period === 'week') {
          // Lógica de agregación por día de la semana
          labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
          title = "Resumen de la Semana";
          labels.forEach(l => results[l] = 0);
          
          const now = new Date();
          const dayOfWeek = (now.getDay() + 6) % 7;
          const startOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
          startOfWeek.setHours(0,0,0,0);

          records.forEach(r => {
              const recordDate = new Date(r.date);
              // Solo considerar registros de la semana actual
              if (recordDate >= startOfWeek) {
                  const dayIndex = (recordDate.getDay() + 6) % 7; // 0=Lun, 6=Dom
                  const dayLabel = labels[dayIndex];
                  
                  // Suma todos los valores (incluyendo fuerza y cardio en un solo total por día)
                  results[dayLabel] += r.value; 
              }
          });
          
      } else if (period === 'month') {
          // Lógica de agregación por día (si fuera diario) o por semana (como los datos fijos lo tenían)
          // Para simplificar la implementación, vamos a sumar el total de actividad por mes, pero
          // mantendremos la estructura para que los datos sean dinámicos.
          
          // Implementación por mes: sumatoria total por cada mes en los últimos 12 meses
          labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          title = "Resumen Anual (Actividad Total por Mes)";
          labels.forEach(l => results[l] = 0);
          
          records.forEach(r => {
              const monthIndex = new Date(r.date).getMonth();
              const monthLabel = labels[monthIndex];
              results[monthLabel] += r.value;
          });

      } else if (period === 'year') {
          // Lógica de agregación por año
          title = "Resumen Histórico por Año";
          const uniqueYears = [...new Set(records.map(r => new Date(r.date).getFullYear()))].sort();
          labels = uniqueYears.length > 0 ? uniqueYears : [new Date().getFullYear()];

          labels.forEach(l => results[l] = 0);
          
          records.forEach(r => {
              const year = new Date(r.date).getFullYear();
              if (results.hasOwnProperty(year)) {
                  results[year] += r.value;
              }
          });
      }

      const data = labels.map(label => results[label]);
      
      return { labels, data, title };
  }


  // --- UI & DOM ---
  function switchTab(tabName) {
      // Ocultar todas las vistas
      ['register', 'stats', 'weight', 'history'].forEach(v => {
          document.getElementById(`view-${v}`).classList.add('hidden');
          const btn = document.getElementById(`nav-${v}`);
          btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-500/30');
          btn.classList.add('text-slate-400', 'bg-slate-900/50');
      });

      // Mostrar seleccionada
      document.getElementById(`view-${tabName}`).classList.remove('hidden');
      const activeBtn = document.getElementById(`nav-${tabName}`);
      activeBtn.classList.remove('text-slate-400', 'bg-slate-900/50');
      activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-500/30');

      if(tabName === 'stats') renderChart('week');
      if(tabName === 'weight') renderWeightTracker();
      if(tabName === 'history') renderHistory();
  }

  // Manejo de Inputs Dinámicos (Ejercicios)
  document.querySelectorAll('[data-exercise]').forEach(btn => {
      btn.addEventListener('click', () => {
          currentExercise = btn.dataset.exercise;
          const info = EXERCISES[currentExercise];
          
          document.getElementById('current-exercise-name').textContent = currentExercise;
          document.getElementById('current-exercise-icon').textContent = info.icon;
          document.getElementById('dynamic-label').textContent = `${info.type} (${info.unit})`;
          document.getElementById('dynamic-input').value = '';
          
          document.getElementById('exercise-selection').classList.add('hidden');
          document.getElementById('exercise-input').classList.remove('hidden');
          document.getElementById('dynamic-input').focus();
      });
  });

  document.getElementById('cancel-input').addEventListener('click', () => {
      document.getElementById('exercise-input').classList.add('hidden');
      document.getElementById('exercise-selection').classList.remove('hidden');
  });

  document.getElementById('save-exercise').addEventListener('click', async () => {
      const val = document.getElementById('dynamic-input').value;
      if(!val || parseFloat(val) <= 0) return alert("Ingresa un valor válido (mayor a 0)");
      
      const saveBtn = document.getElementById('save-exercise');
      saveBtn.textContent = 'Guardando...';
      saveBtn.disabled = true;

      await saveRecord(val);
      
      saveBtn.textContent = 'Guardar Actividad';
      saveBtn.disabled = false;
      document.getElementById('exercise-input').classList.add('hidden');
      document.getElementById('exercise-selection').classList.remove('hidden');
  });

  async function updateUI() {
      const records = await getAllRecords();
      updateGoalsProgress(records);
      
      if(!document.getElementById('view-history').classList.contains('hidden')) renderHistory();
      // Asegura que la gráfica se actualice con la nueva lógica si la pestaña está activa
      if(!document.getElementById('view-stats').classList.contains('hidden')) {
          const activePeriod = document.querySelector('.view-period-btn.active')?.dataset.period || 'week';
          renderChart(activePeriod);
      }
      if(!document.getElementById('view-weight').classList.contains('hidden')) renderWeightTracker();
  }

  function updateGoalsProgress(records) {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const startOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
      startOfWeek.setHours(0,0,0,0);

      const weekRecords = records.filter(r => new Date(r.date) >= startOfWeek);

      let totalCardio = 0;
      let totalStrength = 0;

      weekRecords.forEach(r => {
          const info = EXERCISES[r.exercise];
          const type = info?.baseUnit;
          const conversion = info?.conversion || 1;
          
          if (type === 'Tiempo') totalCardio += r.value * conversion;
          if (type === 'Repeticiones') totalStrength += r.value * conversion;
      });

      document.getElementById('stat-cardio').textContent = Math.round(totalCardio);
      document.getElementById('stat-strength').textContent = Math.round(totalStrength);
      
      const cardioPct = Math.min(100, (totalCardio / goals.cardioMin) * 100);
      const strengthPct = Math.min(100, (totalStrength / goals.strengthReps) * 100);
      
      document.getElementById('bar-cardio').style.width = `${cardioPct}%`;
      document.getElementById('bar-strength').style.width = `${strengthPct}%`;
  }

  async function renderWeightTracker() {
      const records = await getAllWeightRecords();
      const list = document.getElementById('weight-records-list');
      list.innerHTML = '';
      
      records.sort((a,b) => new Date(b.date) - new Date(a.date));

      if(records.length === 0) {
          document.getElementById('no-weight-records-message').classList.remove('hidden');
      } else {
          document.getElementById('no-weight-records-message').classList.add('hidden');
      }

      records.forEach(r => {
          const date = new Date(r.date).toLocaleDateString();
          const item = document.createElement('div');
          item.className = "glass-panel p-4 rounded-xl flex justify-between items-center bg-slate-800/50";
          item.innerHTML = `
              <div>
                  <h4 class="font-bold text-emerald-300 text-lg">${r.weight} kg</h4>
                  <p class="text-sm text-slate-400">Registrado el ${date}</p>
              </div>
          `;
          list.appendChild(item);
      });
      
      if(weightChartInstance) weightChartInstance.destroy();
      
      const recentRecords = records.slice(0, 30).reverse(); 

      const labels = recentRecords.map(r => new Date(r.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }));
      const data = recentRecords.map(r => r.weight);
      
      const ctx = document.getElementById('weightChart').getContext('2d');
      weightChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Peso Corporal (kg)',
                  data: data,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  borderWidth: 3,
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: '#fff'
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                  x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
              }
          }
      });
  }


  // --- Función renderChart MODIFICADA para usar datos reales ---
  async function renderChart(period) {
      const records = await getAllRecords();
      const ctx = document.getElementById('exerciseChart').getContext('2d');
      
      if(chartInstance) chartInstance.destroy();

      // Utiliza la nueva función de agregación para obtener datos reales
      const { labels, data, title } = aggregateRecords(records, period);

      document.getElementById('current-period-display').textContent = title;

      // Determinar los datos a usar (datos reales o un array de ceros si no hay registros)
      const chartData = records.length > 0 ? data : labels.map(() => 0);
      const backgroundOpacity = records.length > 0 ? 0.7 : 0.2; // Menos opacidad si no hay datos

      chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Actividad Total (Unidades)',
                  data: chartData,
                  backgroundColor: `rgba(129, 140, 248, ${backgroundOpacity})`,
                  borderColor: '#818cf8', 
                  borderWidth: 1,
                  borderRadius: 4
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                  y: { 
                      grid: { color: 'rgba(255,255,255,0.1)' }, 
                      ticks: { color: '#94a3b8' },
                      // Si no hay datos, asegura que el eje Y comience en 0 y tenga una escala mínima para verse
                      suggestedMax: records.length === 0 ? 10 : undefined 
                  },
                  x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
              }
          }
      });
  }
  
  document.querySelectorAll('.view-period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
          document.querySelectorAll('.view-period-btn').forEach(b => {
              b.classList.remove('active', 'bg-indigo-600', 'text-white');
              b.classList.add('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
          });
          e.target.classList.add('active', 'bg-indigo-600', 'text-white');
          e.target.classList.remove('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
          renderChart(e.target.dataset.period);
      });
  });

  async function renderHistory() {
      const records = await getAllRecords();
      const list = document.getElementById('records-list');
      list.innerHTML = '';
      
      records.sort((a,b) => new Date(b.date) - new Date(a.date));

      if(records.length === 0) {
          document.getElementById('no-records-message').classList.remove('hidden');
          return;
      } else {
          document.getElementById('no-records-message').classList.add('hidden');
      }

      records.forEach(r => {
          const date = new Date(r.date).toLocaleDateString();
          const time = new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const info = EXERCISES[r.exercise] || {unit: ''};
          
          const item = document.createElement('div');
          item.className = "glass-panel p-4 rounded-xl flex justify-between items-center transition hover:border-rose-500/50";
          item.innerHTML = `
              <div>
                  <h4 class="font-bold text-indigo-300">${r.exercise}</h4>
                  <p class="text-sm text-slate-400">${r.value} ${info.unit} <span class="text-slate-600">|</span> ${date} ${time}</p>
              </div>
              <button class="delete-btn text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 p-2 rounded-lg transition" data-date="${r.date}" title="Eliminar">
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3"></path></svg>
              </button>
          `;
          list.appendChild(item);
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
              if(confirm("¿Estás seguro de que quieres eliminar este registro permanentemente?")) {
                const dateToDelete = e.target.closest('button').dataset.date;
                await deleteRecord(dateToDelete);
                alert("Registro eliminado.");
              }
          });
      });
  }


  // --- Inicialización Eventos Globales ---
  document.getElementById('nav-register').addEventListener('click', () => switchTab('register'));
  document.getElementById('nav-stats').addEventListener('click', () => switchTab('stats'));
  document.getElementById('nav-weight').addEventListener('click', () => switchTab('weight'));
  document.getElementById('nav-history').addEventListener('click', () => switchTab('history'));

  // Backup & Import
  // NOTA: Se necesita la implementación de la función backupData para que este botón funcione.
  // document.getElementById('btn-backup').addEventListener('click', backupData); 
  document.getElementById('btn-delete-all').addEventListener('click', deleteAllData); 

  document.getElementById('file-import').addEventListener('change', (e) => {
      if(e.target.files.length > 0) {
          restoreData(e.target.files[0]);
      }
  });
  
  document.getElementById('weight-date-input').valueAsDate = new Date();

  // Weight Input Handler
  document.getElementById('save-weight').addEventListener('click', async () => {
      const weight = document.getElementById('weight-input').value;
      const date = document.getElementById('weight-date-input').value;

      if (!weight || parseFloat(weight) <= 0 || !date) {
          return alert("Ingresa un peso y una fecha válidos.");
      }
      
      const isoDate = new Date(date + 'T00:00:00.000Z').toISOString();
      
      try {
          await saveWeightRecord(weight, isoDate);
          document.getElementById('weight-input').value = '';
          alert(`Peso de ${weight}kg guardado para el ${new Date(date).toLocaleDateString()}.`);
      } catch (e) {
          console.error(e);
          alert("Error al guardar el peso. Inténtalo de nuevo.");
      }
  });


  // Goals Modal Logic
  const modal = document.getElementById('modal-goals');
  document.getElementById('btn-set-goals').addEventListener('click', () => {
      document.getElementById('input-goal-cardio').value = goals.cardioMin;
      document.getElementById('input-goal-strength').value = goals.strengthReps;
      modal.showModal();
  });
  document.getElementById('btn-cancel-goals').addEventListener('click', () => modal.close());
  document.getElementById('btn-save-goals').addEventListener('click', () => {
      const newCardio = parseInt(document.getElementById('input-goal-cardio').value);
      const newStrength = parseInt(document.getElementById('input-goal-strength').value);

      goals.cardioMin = newCardio > 0 ? newCardio : 90;
      goals.strengthReps = newStrength > 0 ? newStrength : 300;
      
      localStorage.setItem('fitTrackGoals', JSON.stringify(goals));
      document.getElementById('goal-cardio-display').textContent = goals.cardioMin;
      document.getElementById('goal-strength-display').textContent = goals.strengthReps;
      modal.close();
      updateUI();
  });

  // Load Saved Goals from localStorage
  const savedGoals = localStorage.getItem('fitTrackGoals');
  if(savedGoals) {
      goals = JSON.parse(savedGoals);
      document.getElementById('goal-cardio-display').textContent = goals.cardioMin;
      document.getElementById('goal-strength-display').textContent = goals.strengthReps;
  }
  
  // Placeholder para la función backupData (necesaria para el botón)
  async function backupData() {
      try {
          const records = await getAllRecords();
          const weightRecords = await getAllWeightRecords();
          const goalsData = goals;
          
          const backup = {
              records: records,
              weightRecords: weightRecords,
              goals: goalsData,
              timestamp: new Date().toISOString()
          };

          const json = JSON.stringify(backup, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = `fitTrack_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          alert("Respaldo de datos exitoso.");

      } catch (error) {
          console.error("Error al crear el respaldo:", error);
          alert("Ocurrió un error al intentar respaldar los datos.");
      }
  }
  // Añadir el listener de backupData aquí
  document.getElementById('btn-backup').addEventListener('click', backupData);


  // Start Application
  initDB().then(() => {
      updateUI();
      const navRegisterBtn = document.getElementById("nav-register");
      if (navRegisterBtn) {
        navRegisterBtn.click();
      }
  });
});