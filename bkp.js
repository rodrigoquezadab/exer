document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const navRegisterBtn = document.getElementById("nav-register");
  const navStatsBtn = document.getElementById("nav-stats");

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

  // Mover este addEventListener aquí, fuera de displayExerciseInput
  saveExerciseBtn.addEventListener("click", async () => {
    if (saveExerciseBtn.disabled) return;

    saveExerciseBtn.disabled = true;
    saveExerciseBtn.textContent = "Guardando...";

    const exerciseType = EXERCISES[currentExercise]?.type;
    let isValid = true;
    let alertMessage = "";

    let record = {
      exercise: currentExercise,
      date: new Date().toISOString(),
    };

    // Validation logic for different exercise types
    if (exerciseType === "Repeticiones") {
      const repetitions = parseInt(repetitionsInput.value);
      if (isNaN(repetitions) || repetitions <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un número válido de repeticiones.";
      } else {
        record.repetitions = repetitions;
      }
    } else if (exerciseType === "Pasos") {
      const steps = parseInt(stepsInput.value);
      if (isNaN(steps) || steps <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un número válido de pasos.";
      } else {
        record.steps = steps;
      }
    } else if (exerciseType === "Tiempo") {
      const timeMinutes = parseFloat(timeMinutesInput.value);
      if (isNaN(timeMinutes) || timeMinutes <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un tiempo válido en minutos.";
      } else {
        record.timeMinutes = timeMinutes;
      }
    } else if (exerciseType === "Distancia") {
      const distanceKm = parseFloat(distanceKmInput.value);
      if (isNaN(distanceKm) || distanceKm <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa una distancia válida en kilómetros.";
      } else {
        record.distanceKm = distanceKm;
      }
    } else if (exerciseType === "Saltos") {
      const jumps = parseInt(jumpsInput.value);
      if (isNaN(jumps) || jumps <= 0) {
        isValid = false;
        alertMessage = "Por favor, ingresa un número válido de saltos.";
      } else {
        record.jumps = jumps;
      }
    }

    if (!isValid) {
      alert(alertMessage);
      saveExerciseBtn.disabled = false;
      saveExerciseBtn.textContent = "Guardar Registro";
      return;
    }

    try {
      await saveRecord(record);
      alert("Registro guardado exitosamente!");
      // Clear inputs
      repetitionsInput.value = "";
      stepsInput.value = "";
      timeMinutesInput.value = "";
      distanceKmInput.value = "";
      jumpsInput.value = "";
      // Hide input section and show exercise selection
      exerciseInputSection.classList.add("hidden");
      exerciseSelectionSection.classList.remove("hidden");

      // Update stats and chart after saving
      updateStats(currentViewPeriod, currentChartDateContext);
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      alert("Hubo un error al guardar el registro.");
    } finally {
      saveExerciseBtn.disabled = false;
      saveExerciseBtn.textContent = "Guardar Registro";
    }
  });

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
  };

  let currentExercise = null; // To keep track of the currently selected exercise

  // Function to show/hide input groups based on exercise type
  function displayExerciseInput(exerciseName) {
    currentExercise = exerciseName;
    currentExerciseName.textContent = exerciseName;

    // Hide all input groups first
    repetitionsGroup.classList.add("hidden");
    stepsGroup.classList.add("hidden");
    timeGroup.classList.add("hidden");
    distanceGroup.classList.add("hidden");
    jumpsGroup.classList.add("hidden");

    // Show the relevant input group for the selected exercise
    const exerciseInfo = EXERCISES[exerciseName];
    if (exerciseInfo) {
      exerciseInfo.inputGroup.classList.remove("hidden");
    }

    exerciseSelectionSection.classList.add("hidden");
    exerciseInputSection.classList.remove("hidden");
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
    await openDB(); // Ensure DB is open before transaction
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(record); // Use add for new records

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject("Error saving record: " + event.target.errorCode);
      };
    });
  }

  async function getRecords() {
    await openDB(); // Ensure DB is open before transaction
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

  // --- Navigation ---
  const statsSection = document.getElementById("stats-section");
  const recordHistorySection = document.getElementById("record-history");
  const recordsList = document.getElementById("records-list");
  const noRecordsMessage = document.getElementById("no-records-message");

  navRegisterBtn.addEventListener("click", () => {
    navStatsBtn.classList.remove("bg-blue-700");
    navRegisterBtn.classList.add("bg-blue-700");
    exerciseSelectionSection.classList.remove("hidden");
    exerciseInputSection.classList.add("hidden");
    statsSection.classList.add("hidden");
    recordHistorySection.classList.add("hidden");
  });

  navStatsBtn.addEventListener("click", async () => {
    navRegisterBtn.classList.remove("bg-blue-700");
    navStatsBtn.classList.add("bg-blue-700");
    exerciseSelectionSection.classList.add("hidden");
    exerciseInputSection.classList.add("hidden");
    statsSection.classList.remove("hidden");
    recordHistorySection.classList.add("hidden");
    await updateStats(currentViewPeriod, currentChartDateContext);
  });

  const navHistoryBtn = document.getElementById("nav-history");
  navHistoryBtn.addEventListener("click", async () => {
    navRegisterBtn.classList.remove("bg-blue-700");
    navStatsBtn.classList.remove("bg-blue-700");
    navHistoryBtn.classList.add("bg-blue-700");

    exerciseSelectionSection.classList.add("hidden");
    exerciseInputSection.classList.add("hidden");
    statsSection.classList.add("hidden");
    recordHistorySection.classList.remove("hidden");

    await displayRecordHistory();
  });

  async function displayRecordHistory() {
    const records = await getRecords();
    recordsList.innerHTML = ""; // Clear existing records

    if (records.length === 0) {
      noRecordsMessage.classList.remove("hidden");
      return;
    } else {
      noRecordsMessage.classList.add("hidden");
    }

    // Sort records by date, newest first
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
      const exerciseType = EXERCISES[record.exercise]?.type;

      if (exerciseType === "Repeticiones" && record.repetitions) {
        details = `${record.repetitions} repeticiones`;
      } else if (exerciseType === "Pasos" && record.steps) {
        details = `${record.steps} pasos`;
      } else if (exerciseType === "Tiempo" && record.timeMinutes) {
        details = `${record.timeMinutes} minutos`;
      } else if (exerciseType === "Distancia" && record.distanceKm) {
        details = `${record.distanceKm} km`;
      } else if (exerciseType === "Saltos" && record.jumps) {
        details = `${record.jumps} saltos`;
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
      recordsList.appendChild(recordItem);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-record-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const dateToDelete = event.target.dataset.date;
        if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
          try {
            await deleteRecord(dateToDelete);
            alert("Registro eliminado exitosamente.");
            displayRecordHistory(); // Refresh the list
            updateStats(currentViewPeriod, currentChartDateContext); // Update stats as well
          } catch (error) {
            console.error("Error al eliminar el registro:", error);
            alert("Hubo un error al eliminar el registro.");
          }
        }
      });
    });
  }

  // --- Exercise Selection Cards ---
  const exerciseCards = document.querySelectorAll(".exercise-card");
  exerciseCards.forEach((card) => {
    card.addEventListener("click", () => {
      const exerciseName = card.dataset.exercise;
      displayExerciseInput(exerciseName);
    });
  });

  // --- Chart.js Setup ---
  const ctx = document.getElementById("exerciseChart").getContext("2d");
  let exerciseChart;
  let currentViewPeriod = "week"; // Default view: week
  let currentChartDateContext = new Date(); // Default context: today

  const viewPeriodButtons = document.querySelectorAll(".view-period-btn");
  const prevPeriodBtn = document.getElementById("prev-period-btn");
  const nextPeriodBtn = document.getElementById("next-period-btn");
  const currentPeriodDisplay = document.getElementById(
    "current-period-display"
  );

  // Keep track of selected exercises for filtering the chart
  const selectedExercisesForChart = new Set();

  async function updateStats(period, dateContext) {
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
    };

    filteredRecords.forEach((record) => {
      const exercise = record.exercise;
      if (totalStats[exercise]) {
        if (record.repetitions)
          totalStats[exercise].repetitions += record.repetitions;
        if (record.steps) totalStats[exercise].steps += record.steps;
        if (record.timeMinutes)
          totalStats[exercise].timeMinutes += record.timeMinutes;
        if (record.distanceKm)
          totalStats[exercise].distanceKm += record.distanceKm;
        if (record.jumps) totalStats[exercise].jumps += record.jumps;
      }
    });

    // Update the stat cards
    document.getElementById("stats-correr").textContent =
      totalStats["Correr"].distanceKm.toFixed(1);
    document.getElementById("stats-caminar").textContent =
      totalStats["Caminar"].steps;
    document.getElementById("stats-levantar-pesas").textContent =
      totalStats["Levantar Pesas"].repetitions;
    document.getElementById("stats-bicicleta").textContent =
      totalStats["Bicicleta"].timeMinutes.toFixed(1);
    document.getElementById("stats-saltar-cuerda").textContent =
      totalStats["Saltar la Cuerda"].jumps;

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
      currentPeriodDisplay.textContent = dateContext.getFullYear().toString();
    }

    // Get all unique exercise names from records
    const allExerciseNamesWithData = new Set(
      filteredRecords.map((record) => record.exercise)
    );
    let exercisesToShow = Array.from(allExerciseNamesWithData);

    // If specific exercises are selected, override the list of exercises to show
    if (selectedExercisesForChart.size > 0) {
      exercisesToShow = Array.from(selectedExercisesForChart);
    }

    // Function to get a consistent color for each exercise
    const getExerciseColor = (exerciseName) => {
      const colors = {
        Correr: "rgba(255, 99, 132, 0.8)", // Red
        Caminar: "rgba(54, 162, 235, 0.8)", // Blue
        "Levantar Pesas": "rgba(255, 206, 86, 0.8)", // Yellow
        Bicicleta: "rgba(75, 192, 192, 0.8)", // Green
        "Saltar la Cuerda": "rgba(153, 102, 255, 0.8)", // Purple
      };
      return colors[exerciseName] || "rgba(201, 203, 207, 0.8)"; // Grey for others
    };

    exercisesToShow.forEach((exerciseName) => {
      const data = Array(labels.length).fill(0);
      const exerciseType = EXERCISES[exerciseName]?.type;

      filteredRecords.forEach((record) => {
        if (record.exercise === exerciseName) {
          const recordDate = new Date(record.date);
          let index;

          if (period === "week") {
            const startOfWeek = new Date(dateContext);
            startOfWeek.setDate(dateContext.getDate() - dateContext.getDay());
            index = (recordDate.getDay() - startOfWeek.getDay() + 7) % 7; // Calculate day of week index
          } else if (period === "month") {
            index = recordDate.getDate() - 1; // Day of month
          } else if (period === "year") {
            index = recordDate.getMonth(); // Month index
          }

          if (index !== undefined && index >= 0 && index < labels.length) {
            if (exerciseType === "Repeticiones" && record.repetitions) {
              data[index] += record.repetitions;
            } else if (exerciseType === "Pasos" && record.steps) {
              data[index] += record.steps;
            } else if (exerciseType === "Tiempo" && record.timeMinutes) {
              data[index] += record.timeMinutes;
            } else if (exerciseType === "Distancia" && record.distanceKm) {
              data[index] += record.distanceKm;
            } else if (exerciseType === "Saltos" && record.jumps) {
              data[index] += record.jumps;
            }
          }
        }
      });

      if (data.some((val) => val > 0)) {
        // Only add dataset if there's data for it
        datasets.push({
          label: exerciseName,
          data: data,
          backgroundColor: getExerciseColor(exerciseName).replace("0.8", "0.5"), // Lighter fill
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
              text: "Unidades", // This will be generic, could be improved
              color: "#e2e8f0",
            },
            ticks: {
              color: "#e2e8f0", // Light gray for Y-axis labels
            },
            grid: {
              color: "#4a5568", // Darker gray for grid lines
            },
          },
          x: {
            ticks: {
              color: "#e2e8f0", // Light gray for X-axis labels
            },
            grid: {
              color: "#4a5568", // Darker gray for grid lines
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#e2e8f0", // Light gray for legend text
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
  }

  // --- Event Listeners for Period Buttons ---
  viewPeriodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewPeriodButtons.forEach((btn) => btn.classList.remove("bg-blue-700"));
      button.classList.add("bg-blue-700");
      currentViewPeriod = button.dataset.period;
      currentChartDateContext = new Date(); // Reset context to today when changing period
      updateStats(currentViewPeriod, currentChartDateContext);
    });
  });

  if (prevPeriodBtn && nextPeriodBtn) {
    prevPeriodBtn.addEventListener("click", () => {
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

    nextPeriodBtn.addEventListener("click", () => {
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
  }

  // --- Event Listeners for Exercise Stat Cards (New Filtering Logic) ---
  const exerciseStatCards = document.querySelectorAll(".exercise-stat-card");
  exerciseStatCards.forEach((card) => {
    card.addEventListener("click", () => {
      const exerciseName = card.dataset.exercise;

      // If the clicked card is already selected
      if (selectedExercisesForChart.has(exerciseName)) {
        // If it's the only one selected, deselect it and then trigger "show all with data"
        if (selectedExercisesForChart.size === 1) {
          selectedExercisesForChart.clear(); // This will make updateStats show all exercises with data
        } else {
          // If multiple are selected, just deselect this one
          selectedExercisesForChart.delete(exerciseName);
        }
      } else {
        // If the clicked card is NOT selected, clear all others and select only this one
        selectedExercisesForChart.clear();
        selectedExercisesForChart.add(exerciseName);
      }

      // Re-render stats and chart with the updated selection
      updateStats(currentViewPeriod, currentChartDateContext);
    });
  });

  // Load data and display initial statistics when the app starts
  openDB()
    .then(() => {
      updateStats(currentViewPeriod, currentChartDateContext);
      navRegisterBtn.click(); // Simulate click on register to show initial view
    })
    .catch((error) => {
      console.error("Failed to open IndexedDB:", error);
      alert(
        "Error initializing application. Please check console for details."
      );
    });
});
