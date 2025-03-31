// Configuración general de ApexCharts
Apex.grid = { padding: { right: 0, left: 0 } };
Apex.dataLabels = { enabled: false };

// URL de la API (ajustar según sea necesario)
const API_URL = "http://172.20.10.14:8000"; // Cambia esto si la API está en otro host

// Función para obtener datos de la API
async function fetchSensorData(endpoint) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`Error al obtener ${endpoint}`);
    const data = await response.json();
    return Object.values(data)[0]; // Extrae el valor numérico
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    return 0; // Valor aleatorio en caso de error
  }
}


async function updateRadialChart(chart, endpoint, labelId, unit) {
  const newValue = await fetchSensorData(endpoint);

  // Actualizar gráfico
  chart.updateSeries([newValue]);

  // Actualizar etiqueta de texto
  document.getElementById(labelId).innerText = `${newValue.toFixed(2)} ${unit}`;
}

// Función para crear gráficos radialBar
function createRadialChart(elementId, title, unit) {
  let colors = ["#f1556c"];
  let dataColors = $(`#${elementId}`).data("colors");
  if (dataColors) colors = dataColors.split(",");

  let options = {
    series: [0], // Se inicializa con 0 hasta recibir datos reales
    chart: { height: 242, type: "radialBar" },
    plotOptions: { radialBar: { hollow: { size: "65%" } } },
    colors: colors,
    labels: [title],
  };

  let chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
  chart.render();

  return chart;
}

// Crear gráficos radialBar
const temperatureChart = createRadialChart("total-temperature", "Temperatura", "°C");
const humidityChart = createRadialChart("total-humedad", "Humedad", "%");
const co2Chart = createRadialChart("total-co2", "CO2", "ppm");

// Actualizar datos cada 500ms
setInterval(() => {
  updateRadialChart(temperatureChart, "getTemperature", "temperatureValue", "°C");
  updateRadialChart(humidityChart, "getHumidity", "humidityValue", "%");
  updateRadialChart(co2Chart, "getCO2", "co2Value", "ppm");
}, 500);



// Función genérica para actualizar gráficos
async function updateChart(chart, dataArray, endpoint, labelId, unit) {
  const newValue = await fetchSensorData(endpoint);
  
  // Actualizar array de datos
  dataArray.shift();
  dataArray.push(newValue);

  // Actualizar gráfico
  chart.updateSeries([{ data: dataArray }]);

  // Actualizar etiqueta de texto
  document.getElementById(labelId).innerText = `${newValue.toFixed(2)} ${unit}`;
}

// Configuración de gráficos
function createChart(elementId, title, unit, seriesName) {
  let sparklineData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));
  let colors = ["#6658dd"];
  let dataColors = $(`#${elementId}`).data("colors");
  if (dataColors) colors = dataColors.split(",");

  let options = {
    chart: {
      type: "area",
      height: 160,
      sparkline: { enabled: true },
      animations: { enabled: true, easing: "easeinout", dynamicAnimation: { speed: 10 } }
    },
    stroke: { width: 2, curve: "smooth" },
    fill: { opacity: 0.3 },
    series: [{ name: seriesName, data: sparklineData }],
    yaxis: { min: 0, max: 100 },
    colors: colors,
    title: { text: title, offsetX: 10, style: { fontSize: "22px" } },
    subtitle: { text: unit, offsetX: 10, offsetY: 35, style: { fontSize: "13px" } },
    markers: { size: 0 },
    tooltip: { theme: "dark" }
  };

  let chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
  chart.render();

  return { chart, data: sparklineData };
}

// Crear gráficos y asignar actualización automática
const currentChart = createChart("spark1", "Corriente", "Amperios", "Corriente actual");
const lightChart = createChart("spark2", "Luz en el ambiente", "Lumen", "Luz actual");
const proximityChart = createChart("spark3", "Proximidad Actual", "cm/m", "Proximidad");

setInterval(() => {
  updateChart(currentChart.chart, currentChart.data, "getCurrent", "currentValue", "A");
  updateChart(lightChart.chart, lightChart.data, "getLight", "lightCurrent", "Lumen");
  updateChart(proximityChart.chart, proximityChart.data, "getDistance", "proximityValue", "cm/m");
}, 500);
