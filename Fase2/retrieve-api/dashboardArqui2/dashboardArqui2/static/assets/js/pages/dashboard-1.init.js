// // URL de la API (ajustar si es necesario)
// const API_URL = "http://127.0.0.1:8000";

// // Función para obtener datos de la API
// async function fetchSensorData(endpoint) {
//   try {
//     const response = await fetch(`${API_URL}/${endpoint}`);
//     if (!response.ok) throw new Error(`Error al obtener ${endpoint}`);
//     const data = await response.json();
//     return Object.values(data)[0]; // Extrae el valor numérico
//   } catch (error) {
//     console.error(`Error en ${endpoint}:`, error);
//     return Math.random() * 100; // Valor aleatorio en caso de error
//   }
// }

// // Función genérica para actualizar gráficos radialBar
// async function updateRadialChart(chart, endpoint, labelId, unit) {
//   const newValue = await fetchSensorData(endpoint);

//   // Actualizar gráfico
//   chart.updateSeries([newValue]);

//   // Actualizar etiqueta de texto
//   document.getElementById(labelId).innerText = `${newValue.toFixed(2)} ${unit}`;
// }

// // Función para crear gráficos radialBar
// function createRadialChart(elementId, title, unit) {
//   let colors = ["#f1556c"];
//   let dataColors = $(`#${elementId}`).data("colors");
//   if (dataColors) colors = dataColors.split(",");

//   let options = {
//     series: [0], // Se inicializa con 0 hasta recibir datos reales
//     chart: { height: 242, type: "radialBar" },
//     plotOptions: { radialBar: { hollow: { size: "65%" } } },
//     colors: colors,
//     labels: [title],
//   };

//   let chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
//   chart.render();

//   return chart;
// }

// // Crear gráficos radialBar
// const temperatureChart = createRadialChart("total-temperature", "Temperatura", "°C");
// const humidityChart = createRadialChart("total-humedad", "Humedad", "%");
// const co2Chart = createRadialChart("total-co2", "CO2", "ppm");

// // Actualizar datos cada 500ms
// setInterval(() => {
//   updateRadialChart(temperatureChart, "getTemperature", "temperatureValue", "°C");
//   updateRadialChart(humidityChart, "getHumidity", "humidityValue", "%");
//   updateRadialChart(co2Chart, "getCO2", "co2Value", "ppm");
// }, 500);

// // Configuración del gráfico de Revenue & Sales
// let colors = ["#1abc9c", "#4a81d4"];
// let dataColors = $("#sales-analytics").data("colors");
// if (dataColors) colors = dataColors.split(",");

// let salesOptions = {
//   series: [
//     { name: "Revenue", type: "column", data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160] },
//     { name: "Sales", type: "line", data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16] },
//   ],
//   chart: { height: 378, type: "line", offsetY: 10 },
//   stroke: { width: [2, 3] },
//   plotOptions: { bar: { columnWidth: "50%" } },
//   colors: colors,
//   dataLabels: { enabled: true, enabledOnSeries: [1] },
//   labels: [
//     "01 Jan 2001", "02 Jan 2001", "03 Jan 2001", "04 Jan 2001",
//     "05 Jan 2001", "06 Jan 2001", "07 Jan 2001", "08 Jan 2001",
//     "09 Jan 2001", "10 Jan 2001", "11 Jan 2001", "12 Jan 2001",
//   ],
//   xaxis: { type: "datetime" },
//   legend: { offsetY: 7 },
//   grid: { padding: { bottom: 20 } },
//   fill: {
//     type: "gradient",
//     gradient: {
//       shade: "light",
//       type: "horizontal",
//       shadeIntensity: 0.25,
//       gradientToColors: undefined,
//       inverseColors: true,
//       opacityFrom: 0.75,
//       opacityTo: 0.75,
//       stops: [0, 0, 0],
//     },
//   },
//   yaxis: [
//     { title: { text: "Net Revenue" } },
//     { opposite: true, title: { text: "Number of Sales" } },
//   ],
// };

// let salesChart = new ApexCharts(document.querySelector("#sales-analytics"), salesOptions);
// salesChart.render();

// // Configuración del selector de rango de fechas
// $("#dash-daterange").flatpickr({
//   altInput: true,
//   mode: "range",
//   altFormat: "F j, Y",
//   defaultDate: "today",
// });
