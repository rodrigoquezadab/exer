document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired. Script is executing."); // Debugging line

  // Get references to HTML elements
  const navRegisterBtn = document.getElementById("nav-register");
  const navStatsBtn = document.getElementById("nav-stats");
  const navHistoryBtn = document.getElementById("nav-history");

  const exerciseSelectionSection =
    document.getElementById("exercise-selection");
  const exerciseInputSection = document.getElementById("exercise-input");
  const currentExerciseName = document.getElementById("current-exercise-name");
  const repetitionsInput = document.getElementById("repetitions");
  const stepsInput = document.getElementById("steps");
  const timeMinutesInput = document.getElementById("time-minutes");
  const distanceKmInput = document.getElementById("distance-km");
  const jumpsInput = document.getElementById("jumps");

  const repetitionsGroup = document.getElementById("repetitions-group");
  const stepsGroup = document.getElementById("steps-group");
  const timeGroup = document.getElementById("time-group");
  const distanceGroup = document.getElementById("distance-group");
  const jumpsGroup = document.getElementById("jumps-group");

  const saveExerciseBtn = document.getElementById("save-exercise");
  const cancelInputBtn = document.getElementById("cancel-input"); // New: Reference for cancel button

  // Define exercise types and their corresponding input fields
  const EXERCISES = {
    Correr: {
      type: "Distancia",
      inputGroup: distanceGroup,
      input: distanceKmInput,
    },
    Caminar: { type: "Pasos", inputGroup: stepsGroup, input: stepsInput },
    "Levantar Pesas": {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    Bicicleta: {
      type: "Tiempo",
      inputGroup: timeGroup,
      input: timeMinutesInput,
    },
    "Saltar la Cuerda": {
      type: "Saltos",
      inputGroup: jumpsGroup,
      input: jumpsInput,
    },
    // Add other exercises from your HTML, mapping them to their type
    Sentadillas: {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    "Flexiones de Brazos": {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    Abdominales: {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    Zancadas: {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    Burpees: {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    Plancha: { type: "Tiempo", inputGroup: timeGroup, input: timeMinutesInput }, // Plancha usually by time
    "Remo con Mancuernas": {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
    "Press de Hombros": {
      type: "Repeticiones",
      inputGroup: repetitionsGroup,
      input: repetitionsInput,
    },
  };

  let currentExercise = null; // To keep track of the currently selected exercise
  let isSaving = false; // Flag to prevent multiple saves

  // Function to show/hide input groups based on exercise type
  function displayExerciseInput(exerciseName) {
    currentExercise = exerciseName;
    if (currentExerciseName) {
      currentExerciseName.textContent = exerciseName;
    }

    // Hide all input groups first
    [
      repetitionsGroup,
      stepsGroup,
      timeGroup,
      distanceGroup,
      jumpsGroup,
    ].forEach((group) => {
      if (group) group.classList.add("hidden");
    });

    // Show the relevant input group for the selected exercise
    const exerciseInfo = EXERCISES[exerciseName];
    if (exerciseInfo && exerciseInfo.inputGroup) {
      exerciseInfo.inputGroup.classList.remove("hidden");
    }

    if (exerciseSelectionSection)
      exerciseSelectionSection.classList.add("hidden");
    if (exerciseInputSection) exerciseInputSection.classList.remove("hidden");
  }

  // Define the handleSaveExercise function
  async function handleSaveExercise() {
    console.log(
      "handleSaveExercise function called - Save Exercise Button Clicked!"
    ); // Debugging line
    if (isSaving) {
      return;
    }

    isSaving = true;
    if (saveExerciseBtn) {
      saveExerciseBtn.disabled = true;
      saveExerciseBtn.textContent = "Guardando...";
    }

    if (!currentExercise || !EXERCISES[currentExercise]) {
      alert(
        "Error: No se ha seleccionado un ejercicio válido. Por favor, selecciona un ejercicio antes de guardar."
      );
      isSaving = false;
      if (saveExerciseBtn) {
        saveExerciseBtn.disabled = false;
        saveExerciseBtn.textContent = "Guardar Registro";
      }
      return;
    }

    const exerciseType = EXERCISES[currentExercise].type;
    let isValid = true;
    let alertMessage = "";

    let record = {
      exercise: currentExercise,
      date: new Date().toISOString(),
    };

    // Validation logic for different exercise types
    if (exerciseType === "Repeticiones") {
      const repetitions = parseInt(repetitionsInput?.value || 0);
      if (isNaN(repetitions) || repetitions <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un número válido de repeticiones.";
      } else {
        record.repetitions = repetitions;
      }
    } else if (exerciseType === "Pasos") {
      const steps = parseInt(stepsInput?.value || 0);
      if (isNaN(steps) || steps <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un número válido de pasos.";
      } else {
        record.steps = steps;
      }
    } else if (exerciseType === "Tiempo") {
      const timeMinutes = parseFloat(timeMinutesInput?.value || 0);
      if (isNaN(timeMinutes) || timeMinutes <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un tiempo válido en minutos.";
      } else {
        record.timeMinutes = timeMinutes;
      }
    } else if (exerciseType === "Distancia") {
      const distanceKm = parseFloat(distanceKmInput?.value || 0);
      if (isNaN(distanceKm) || distanceKm <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa una distancia válida en kilómetros.";
      } else {
        record.distanceKm = distanceKm;
      }
    } else if (exerciseType === "Saltos") {
      const jumps = parseInt(jumpsInput?.value || 0);
      if (isNaN(jumps) || jumps <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un número válido de saltos.";
      } else {
        record.jumps = jumps;
      }
    }

    if (!isValid) {
      alert(alertMessage);
      isSaving = false;
      if (saveExerciseBtn) {
        saveExerciseBtn.disabled = false;
        saveExerciseBtn.textContent = "Guardar Registro";
      }
      return;
    }

    try {
      await saveRecord(record);
      alert("Registro guardado exitosamente!");
      // Clear inputs
      if (repetitionsInput) repetitionsInput.value = "";
      if (stepsInput) stepsInput.value = "";
      if (timeMinutesInput) timeMinutesInput.value = "";
      if (distanceKmInput) distanceKmInput.value = "";
      if (jumpsInput) jumpsInput.value = "";

      // Hide input section and show exercise selection
      if (exerciseInputSection) exerciseInputSection.classList.add("hidden");
      if (exerciseSelectionSection)
        exerciseSelectionSection.classList.remove("hidden");

      // Update stats and chart after saving
      await updateStats(currentViewPeriod, currentChartDateContext);
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      alert("Hubo un error al guardar el registro. " + error.message);
    } finally {
      isSaving = false;
      if (saveExerciseBtn) {
        saveExerciseBtn.disabled = false;
        saveExerciseBtn.textContent = "Guardar Registro";
      }
    }
  }

  // --- IndexedDB Setup ---
  let db;
  const DB_NAME = "ExerciseTrackerDB";
  const DB_VERSION = 1;
  const STORE_NAME = "records";

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "date" });
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onerror = (event) => {
        reject("Error opening database: " + event.target.errorCode);
      };
    });
  }

  async function saveRecord(record) {
    await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        if (event.target.error.name === "ConstraintError") {
          reject(
            new Error(
              "Ya existe un registro para esta fecha y hora. Por favor, espera unos segundos o elige una hora diferente si estás ingresando el mismo ejercicio."
            )
          );
        } else {
          reject("Error saving record: " + event.target.errorCode);
        }
      };
    });
  }

  async function getRecords() {
    await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject("Error getting records: " + event.target.errorCode);
      };
    });
  }

  async function deleteRecord(date) {
    await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(date);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject("Error deleting record: " + event.target.errorCode);
      };
    });
  }

  // --- Navigation Sections ---
  const statsSection = document.getElementById("stats-section");
  const recordHistorySection = document.getElementById("record-history");
  const recordsList = document.getElementById("records-list");
  const noRecordsMessage = document.getElementById("no-records-message");

  // --- Event Listeners for Navigation Buttons (Ensured to be added only once) ---
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener("click", () => {
      console.log("nav-register clicked!"); // Debugging line
      // Remove bg-blue-700 from all nav buttons and add to the clicked one
      [navRegisterBtn, navStatsBtn, navHistoryBtn].forEach((btn) => {
        if (btn) btn.classList.remove("bg-blue-700");
        if (btn && btn.id !== "nav-register") btn.classList.add("bg-gray-700");
      });
      navRegisterBtn.classList.add("bg-blue-700");
      navRegisterBtn.classList.remove("bg-gray-700");

      // Show/hide sections
      if (exerciseSelectionSection)
        exerciseSelectionSection.classList.remove("hidden");
      if (exerciseInputSection) exerciseInputSection.classList.add("hidden");
      if (statsSection) statsSection.classList.add("hidden");
      if (recordHistorySection) recordHistorySection.classList.add("hidden");
    });
    console.log("Listener added to nav-registerBtn");
  } else {
    console.error("Error: El botón 'nav-register' no fue encontrado.");
  }

  if (navStatsBtn) {
    navStatsBtn.addEventListener("click", async () => {
      console.log("nav-stats clicked!"); // Debugging line
      // Remove bg-blue-700 from all nav buttons and add to the clicked one
      [navRegisterBtn, navStatsBtn, navHistoryBtn].forEach((btn) => {
        if (btn) btn.classList.remove("bg-blue-700");
        if (btn && btn.id !== "nav-stats") btn.classList.add("bg-gray-700");
      });
      navStatsBtn.classList.add("bg-blue-700");
      navStatsBtn.classList.remove("bg-gray-700");

      // Show/hide sections
      if (exerciseSelectionSection)
        exerciseSelectionSection.classList.add("hidden");
      if (exerciseInputSection) exerciseInputSection.classList.add("hidden");
      if (statsSection) statsSection.classList.remove("hidden");
      if (recordHistorySection) recordHistorySection.classList.add("hidden");
      await updateStats(currentViewPeriod, currentChartDateContext);
    });
    console.log("Listener added to nav-statsBtn");
  } else {
    console.error("Error: El botón 'nav-stats' no fue encontrado.");
  }

  if (navHistoryBtn) {
    navHistoryBtn.addEventListener("click", async () => {
      console.log("nav-history clicked!"); // Debugging line
      // Remove bg-blue-700 from all nav buttons and add to the clicked one
      [navRegisterBtn, navStatsBtn, navHistoryBtn].forEach((btn) => {
        if (btn) btn.classList.remove("bg-blue-700");
        if (btn && btn.id !== "nav-history") btn.classList.add("bg-gray-700");
      });
      navHistoryBtn.classList.add("bg-blue-700");
      navHistoryBtn.classList.remove("bg-gray-700");

      // Show/hide sections
      if (exerciseSelectionSection)
        exerciseSelectionSection.classList.add("hidden");
      if (exerciseInputSection) exerciseInputSection.classList.add("hidden");
      if (statsSection) statsSection.classList.add("hidden");
      if (recordHistorySection) recordHistorySection.classList.remove("hidden");

      await displayRecordHistory();
    });
    console.log("Listener added to nav-historyBtn");
  } else {
    console.error("Error: El botón 'nav-history' no fue encontrado.");
  }

  async function displayRecordHistory() {
    const records = await getRecords();
    if (recordsList) recordsList.innerHTML = "";

    if (records.length === 0) {
      if (noRecordsMessage) noRecordsMessage.classList.remove("hidden");
      return;
    } else {
      if (noRecordsMessage) noRecordsMessage.classList.add("hidden");
    }

    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach((record) => {
      const recordDate = new Date(record.date);
      const dateString = recordDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let details = "";
      const exerciseInfo = EXERCISES[record.exercise]; // Get exercise info from EXERCISES map
      const exerciseType = exerciseInfo ? exerciseInfo.type : null;

      if (
        exerciseType === "Repeticiones" &&
        typeof record.repetitions !== "undefined"
      ) {
        details = `${record.repetitions} repeticiones`;
      } else if (
        exerciseType === "Pasos" &&
        typeof record.steps !== "undefined"
      ) {
        details = `${record.steps} pasos`;
      } else if (
        exerciseType === "Tiempo" &&
        typeof record.timeMinutes !== "undefined"
      ) {
        details = `${record.timeMinutes} minutos`;
      } else if (
        exerciseType === "Distancia" &&
        typeof record.distanceKm !== "undefined"
      ) {
        details = `${record.distanceKm} km`;
      } else if (
        exerciseType === "Saltos" &&
        typeof record.jumps !== "undefined"
      ) {
        details = `${record.jumps} saltos`;
      } else {
        // Fallback for exercises not explicitly mapped or with no relevant data
        if (typeof record.repetitions !== "undefined")
          details = `${record.repetitions} repeticiones`;
        else if (typeof record.steps !== "undefined")
          details = `${record.steps} pasos`;
        else if (typeof record.timeMinutes !== "undefined")
          details = `${record.timeMinutes} minutos`;
        else if (typeof record.distanceKm !== "undefined")
          details = `${record.distanceKm} km`;
        else if (typeof record.jumps !== "undefined")
          details = `${record.jumps} saltos`;
        else details = "Sin detalles específicos"; // If no known metric exists
      }

      const recordItem = document.createElement("div");
      recordItem.className =
        "bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center";
      recordItem.innerHTML = `
        <div>
          <p class="text-lime-300 font-semibold">${record.exercise}</p>
          <p class="text-gray-300 text-sm">${details}</p>
          <p class="text-gray-400 text-xs">${dateString}</p>
        </div>
        <button class="delete-record-btn bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200" data-date="${record.date}">Eliminar</button>
      `;
      if (recordsList) recordsList.appendChild(recordItem);
    });
  }

  // --- Exercise Selection Cards (Ensure these are attached only once) ---
  const exerciseCards = document.querySelectorAll("[data-exercise]"); // Selects all elements with data-exercise attribute
  if (exerciseCards.length > 0) {
    exerciseCards.forEach((card) => {
      // Ensure no duplicate listeners are added
      // You can implement a flag or remove existing listeners if this part is called multiple times.
      // For now, assuming DOMContentLoaded means it's only run once.
      card.addEventListener("click", () => {
        console.log(`Exercise card "${card.dataset.exercise}" clicked!`); // Debugging line
        const exerciseName = card.dataset.exercise;
        displayExerciseInput(exerciseName);
      });
    });
    console.log("Listeners added to exercise cards.");
  } else {
    console.warn("No exercise cards found.");
  }

  // --- Chart.js Setup ---
  const ctx = document.getElementById("exerciseChart")?.getContext("2d");
  let exerciseChart;
  let currentViewPeriod = "week"; // Default view: week
  let currentChartDateContext = new Date(); // Default context: today

  const viewPeriodButtons = document.querySelectorAll(".view-period-btn");
  const prevPeriodBtn = document.getElementById("prev-period-btn");
  const nextPeriodBtn = document.getElementById("next-period-btn");
  const currentPeriodDisplay = document.getElementById(
    "current-period-display"
  );

  const selectedExercisesForChart = new Set(); // For filtering chart

  async function updateStats(period, dateContext) {
    console.log(
      `Updating stats for period: ${period}, date context: ${dateContext.toISOString()}`
    );
    const records = await getRecords();
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      if (period === "week") {
        const startOfWeek = new Date(dateContext);
        startOfWeek.setDate(dateContext.getDate() - dateContext.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      } else if (period === "month") {
        return (
          recordDate.getFullYear() === dateContext.getFullYear() &&
          recordDate.getMonth() === dateContext.getMonth()
        );
      } else if (period === "year") {
        return recordDate.getFullYear() === dateContext.getFullYear();
      }
      return true;
    });

    // Calculate total stats for display cards
    const totalStats = {
      Correr: { distanceKm: 0 },
      Caminar: { steps: 0 },
      "Levantar Pesas": { repetitions: 0 },
      Bicicleta: { timeMinutes: 0 },
      "Saltar la Cuerda": { jumps: 0 },
      Sentadillas: { repetitions: 0 },
      "Flexiones de Brazos": { repetitions: 0 },
      Abdominales: { repetitions: 0 },
      Zancadas: { repetitions: 0 },
      Burpees: { repetitions: 0 },
      Plancha: { timeMinutes: 0 },
      "Remo con Mancuernas": { repetitions: 0 },
      "Press de Hombros": { repetitions: 0 },
    };

    filteredRecords.forEach((record) => {
      const exercise = record.exercise;
      if (totalStats[exercise]) {
        if (typeof record.repetitions !== "undefined")
          totalStats[exercise].repetitions += record.repetitions;
        if (typeof record.steps !== "undefined")
          totalStats[exercise].steps += record.steps;
        if (typeof record.timeMinutes !== "undefined")
          totalStats[exercise].timeMinutes += record.timeMinutes;
        if (typeof record.distanceKm !== "undefined")
          totalStats[exercise].distanceKm += record.distanceKm;
        if (typeof record.jumps !== "undefined")
          totalStats[exercise].jumps += record.jumps;
      }
    });

    // Update the stat cards
    if (document.getElementById("stats-correr"))
      document.getElementById("stats-correr").textContent =
        totalStats["Correr"].distanceKm.toFixed(1);
    if (document.getElementById("stats-caminar"))
      document.getElementById("stats-caminar").textContent =
        totalStats["Caminar"].steps;
    // Update for all the new stat cards
    if (document.getElementById("stats-levantar-pesas"))
      document.getElementById("stats-levantar-pesas").textContent =
        totalStats["Levantar Pesas"].repetitions; // Keep this if you have a generic "Levantar Pesas" card
    if (document.getElementById("stats-bicicleta"))
      document.getElementById("stats-bicicleta").textContent =
        totalStats["Bicicleta"].timeMinutes.toFixed(1);
    if (document.getElementById("stats-saltar-cuerda"))
      document.getElementById("stats-saltar-cuerda").textContent =
        totalStats["Saltar la Cuerda"].jumps;

    if (document.getElementById("stats-sentadillas"))
      document.getElementById("stats-sentadillas").textContent =
        totalStats["Sentadillas"].repetitions;
    if (document.getElementById("stats-flexiones-de-brazos"))
      document.getElementById("stats-flexiones-de-brazos").textContent =
        totalStats["Flexiones de Brazos"].repetitions;
    if (document.getElementById("stats-abdominales"))
      document.getElementById("stats-abdominales").textContent =
        totalStats["Abdominales"].repetitions;
    if (document.getElementById("stats-zancadas"))
      document.getElementById("stats-zancadas").textContent =
        totalStats["Zancadas"].repetitions;
    if (document.getElementById("stats-burpees"))
      document.getElementById("stats-burpees").textContent =
        totalStats["Burpees"].repetitions;
    if (document.getElementById("stats-plancha"))
      document.getElementById("stats-plancha").textContent =
        totalStats["Plancha"].timeMinutes.toFixed(1);
    if (document.getElementById("stats-remo-mancuernas"))
      document.getElementById("stats-remo-mancuernas").textContent =
        totalStats["Remo con Mancuernas"].repetitions;
    if (document.getElementById("stats-press-hombros"))
      document.getElementById("stats-press-hombros").textContent =
        totalStats["Press de Hombros"].repetitions;

    // Prepare data for Chart.js
    let labels = [];
    let datasets = [];

    // Determine labels based on the period
    if (period === "week") {
      const startOfWeek = new Date(dateContext);
      startOfWeek.setDate(dateContext.getDate() - dateContext.getDay()); // Sunday
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        labels.push(
          day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })
        );
      }
      if (currentPeriodDisplay)
        currentPeriodDisplay.textContent = `${startOfWeek.toLocaleDateString(
          "es-ES",
          { month: "short", day: "numeric" }
        )} - ${new Date(
          startOfWeek.setDate(startOfWeek.getDate() + 6)
        ).toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
    } else if (period === "month") {
      const daysInMonth = new Date(
        dateContext.getFullYear(),
        dateContext.getMonth() + 1,
        0
      ).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());
      }
      if (currentPeriodDisplay)
        currentPeriodDisplay.textContent = dateContext.toLocaleDateString(
          "es-ES",
          { month: "long", year: "numeric" }
        );
    } else if (period === "year") {
      labels = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      if (currentPeriodDisplay)
        currentPeriodDisplay.textContent = dateContext.getFullYear().toString();
    }

    const allExerciseNamesWithData = new Set(
      filteredRecords.map((record) => record.exercise)
    );
    let exercisesToShow = Array.from(allExerciseNamesWithData);

    if (selectedExercisesForChart.size > 0) {
      exercisesToShow = Array.from(selectedExercisesForChart);
    }

    const getExerciseColor = (exerciseName) => {
      const colors = {
        Correr: "rgba(255, 99, 132, 0.8)", // Red
        Caminar: "rgba(54, 162, 235, 0.8)", // Blue
        "Levantar Pesas": "rgba(255, 206, 86, 0.8)", // Yellow
        Bicicleta: "rgba(75, 192, 192, 0.8)", // Green
        "Saltar la Cuerda": "rgba(153, 102, 255, 0.8)", // Purple
        Sentadillas: "rgba(255, 159, 64, 0.8)", // Orange
        "Flexiones de Brazos": "rgba(200, 50, 50, 0.8)", // Dark Red
        Abdominales: "rgba(100, 200, 100, 0.8)", // Light Green
        Zancadas: "rgba(200, 100, 200, 0.8)", // Light Purple
        Burpees: "rgba(50, 50, 200, 0.8)", // Dark Blue
        Plancha: "rgba(255, 255, 100, 0.8)", // Light Yellow
        "Remo con Mancuernas": "rgba(100, 255, 255, 0.8)", // Cyan
        "Press de Hombros": "rgba(255, 100, 255, 0.8)", // Pink
      };
      return colors[exerciseName] || "rgba(201, 203, 207, 0.8)";
    };

    exercisesToShow.forEach((exerciseName) => {
      const data = Array(labels.length).fill(0);
      const exerciseInfo = EXERCISES[exerciseName];
      if (!exerciseInfo) return;
      const exerciseType = exerciseInfo.type;

      filteredRecords.forEach((record) => {
        if (record.exercise === exerciseName) {
          const recordDate = new Date(record.date);
          let index;

          if (period === "week") {
            const startOfWeek = new Date(dateContext);
            startOfWeek.setDate(dateContext.getDate() - dateContext.getDay());
            index = (recordDate.getDay() - startOfWeek.getDay() + 7) % 7;
          } else if (period === "month") {
            index = recordDate.getDate() - 1;
          } else if (period === "year") {
            index = recordDate.getMonth();
          }

          if (index !== undefined && index >= 0 && index < labels.length) {
            if (
              exerciseType === "Repeticiones" &&
              typeof record.repetitions !== "undefined"
            ) {
              data[index] += record.repetitions;
            } else if (
              exerciseType === "Pasos" &&
              typeof record.steps !== "undefined"
            ) {
              data[index] += record.steps;
            } else if (
              exerciseType === "Tiempo" &&
              typeof record.timeMinutes !== "undefined"
            ) {
              data[index] += record.timeMinutes;
            } else if (
              exerciseType === "Distancia" &&
              typeof record.distanceKm !== "undefined"
            ) {
              data[index] += record.distanceKm;
            } else if (
              exerciseType === "Saltos" &&
              typeof record.jumps !== "undefined"
            ) {
              data[index] += record.jumps;
            }
          }
        }
      });

      if (data.some((val) => val > 0)) {
        datasets.push({
          label: exerciseName,
          data: data,
          backgroundColor: getExerciseColor(exerciseName).replace("0.8", "0.5"),
          borderColor: getExerciseColor(exerciseName),
          borderWidth: 1,
          fill: true,
          tension: 0.3,
        });
      }
    });

    if (exerciseChart) {
      exerciseChart.destroy();
    }

    if (ctx) {
      exerciseChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Unidades",
                color: "#e2e8f0",
              },
              ticks: {
                color: "#e2e8f0",
              },
              grid: {
                color: "#4a5568",
              },
            },
            x: {
              ticks: {
                color: "#e2e8f0",
              },
              grid: {
                color: "#4a5568",
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
              },
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              titleColor: "#e2e8f0",
              bodyColor: "#e2e8f0",
            },
          },
        },
      });
      console.log("Chart initialized/updated.");
    } else {
      console.error(
        "Error: El canvas para el gráfico ('exerciseChart') no fue encontrado."
      );
    }
  }

  // --- Event Listeners for Period Buttons ---
  if (viewPeriodButtons.length > 0) {
    viewPeriodButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log(`View period button "${button.dataset.period}" clicked!`);
        viewPeriodButtons.forEach((btn) =>
          btn.classList.remove("bg-blue-600", "bg-blue-700", "text-white")
        );
        viewPeriodButtons.forEach((btn) =>
          btn.classList.add("bg-gray-700", "hover:bg-gray-600", "text-gray-300")
        );
        button.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
        button.classList.remove(
          "bg-gray-700",
          "hover:bg-gray-600",
          "text-gray-300"
        );

        currentViewPeriod = button.dataset.period;
        currentChartDateContext = new Date();
        updateStats(currentViewPeriod, currentChartDateContext);
      });
    });
    console.log("Listeners added to viewPeriodButtons.");
  }

  if (prevPeriodBtn) {
    prevPeriodBtn.addEventListener("click", () => {
      console.log("Previous Period Button Clicked!");
      if (currentViewPeriod === "week") {
        currentChartDateContext.setDate(currentChartDateContext.getDate() - 7);
      } else if (currentViewPeriod === "month") {
        currentChartDateContext.setMonth(
          currentChartDateContext.getMonth() - 1
        );
      } else if (currentViewPeriod === "year") {
        currentChartDateContext.setFullYear(
          currentChartDateContext.getFullYear() - 1
        );
      }
      updateStats(currentViewPeriod, currentChartDateContext);
    });
    console.log("Listener added to prevPeriodBtn.");
  } else {
    console.error("Error: El botón 'prev-period-btn' no fue encontrado.");
  }

  if (nextPeriodBtn) {
    nextPeriodBtn.addEventListener("click", () => {
      console.log("Next Period Button Clicked!");
      if (currentViewPeriod === "week") {
        currentChartDateContext.setDate(currentChartDateContext.getDate() + 7);
      } else if (currentViewPeriod === "month") {
        currentChartDateContext.setMonth(
          currentChartDateContext.getMonth() + 1
        );
      } else if (currentViewPeriod === "year") {
        currentChartDateContext.setFullYear(
          currentChartDateContext.getFullYear() + 1
        );
      }
      updateStats(currentViewPeriod, currentChartDateContext);
    });
    console.log("Listener added to nextPeriodBtn.");
  } else {
    console.error("Error: El botón 'next-period-btn' no fue encontrado.");
  }

  // --- Event Listeners for Exercise Stat Cards (New Filtering Logic) ---
  const exerciseStatCards = document.querySelectorAll(".exercise-stat-card");
  if (exerciseStatCards.length > 0) {
    exerciseStatCards.forEach((card) => {
      card.addEventListener("click", () => {
        console.log(
          `Exercise stat card "${card.dataset.exercise}" clicked for filtering!`
        );
        const exerciseName = card.dataset.exercise;

        if (selectedExercisesForChart.has(exerciseName)) {
          if (selectedExercisesForChart.size === 1) {
            selectedExercisesForChart.clear();
          } else {
            selectedExercisesForChart.delete(exerciseName);
          }
        } else {
          selectedExercisesForChart.clear();
          selectedExercisesForChart.add(exerciseName);
        }

        updateStats(currentViewPeriod, currentChartDateContext);
      });
    });
    console.log("Listeners added to exerciseStatCards.");
  } else {
    console.warn("No exercise stat cards found.");
  }

  // Adjuntar el event listener para el botón de guardar UNA SOLA VEZ
  if (saveExerciseBtn) {
    saveExerciseBtn.addEventListener("click", handleSaveExercise);
    console.log("Listener added to saveExerciseBtn.");
  } else {
    console.error(
      "Error: El botón 'save-exercise' no fue encontrado en el DOM para adjuntar el listener."
    );
  }

  // Add event listener for the cancel button
  if (cancelInputBtn) {
    cancelInputBtn.addEventListener("click", () => {
      console.log("Cancel button clicked!");
      if (exerciseInputSection) exerciseInputSection.classList.add("hidden");
      if (exerciseSelectionSection)
        exerciseSelectionSection.classList.remove("hidden");
    });
    console.log("Listener added to cancelInputBtn.");
  } else {
    console.error("Error: El botón 'cancel-input' no fue encontrado.");
  }

  // Add event listener to recordsList for delete buttons using event delegation
  if (recordsList) {
    recordsList.addEventListener("click", async (event) => {
      if (event.target.classList.contains("delete-record-btn")) {
        console.log(
          `Delete record button clicked for date: ${event.target.dataset.date}`
        );
        const dateToDelete = event.target.dataset.date;
        if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
          try {
            await deleteRecord(dateToDelete);
            alert("Registro eliminado exitosamente.");
            await displayRecordHistory();
            await updateStats(currentViewPeriod, currentChartDateContext);
          } catch (error) {
            console.error("Error al eliminar el registro:", error);
            alert("Hubo un error al eliminar el registro.");
          }
        }
      }
    });
    console.log("Listener added to recordsList for delete delegation.");
  } else {
    console.error(
      "Error: El contenedor 'records-list' no fue encontrado para la delegación de eventos."
    );
  }

  // Load data and display initial statistics when the app starts
  openDB()
    .then(() => {
      updateStats(currentViewPeriod, currentChartDateContext);
      // Simulate click on register to show initial view, ensuring the nav buttons are correctly styled
      if (navRegisterBtn) {
        navRegisterBtn.click();
      } else {
        console.warn(
          "No se pudo simular el clic en el botón de registro inicial, ya que no se encontró."
        );
      }
    })
    .catch((error) => {
      console.error("Failed to open IndexedDB:", error);
      alert(
        "Error initializing application. Please check console for details."
      );
    });
});
