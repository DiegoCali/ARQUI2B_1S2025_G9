(Apex.grid = { padding: { right: 0, left: 0 } }),
  (Apex.dataLabels = { enabled: false });

var sparklineData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

var colors = ["#6658dd"];
var dataColors = $("#spark1").data("colors");
dataColors && (colors = dataColors.split(","));

var options = {
  chart: { 
    type: "area", 
    height: 160, 
    sparkline: { enabled: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      dynamicAnimation: { speed: 500 } // Suaviza la animación
    }
  },
  stroke: { width: 2, curve: "smooth" },
  fill: { opacity: 0.3 },
  series: [{ name: "Corriente actual", data: sparklineData }],
  yaxis: { min: 0, max: 100 },
  colors: colors,
  title: { text: "Corriente", offsetX: 10, style: { fontSize: "22px" } },
  subtitle: {
    text: "Amperios",
    offsetX: 10,
    offsetY: 35,
    style: { fontSize: "13px" },
  },
  markers: { size: 0 },
  tooltip: { theme: "dark" }
};

var chart = new ApexCharts(document.querySelector("#spark1"), options);
chart.render();

// Mostrar el último valor de amperios en texto
function updateCurrentValue() {
  let lastValue = sparklineData[sparklineData.length - 1];
  document.getElementById("currentValue").innerText = `Corriente: ${lastValue} A`;
}

// Actualizar los datos y el texto cada 500ms
// setInterval(() => {
//   sparklineData.shift();
//   let newValue = Math.floor(Math.random() * 100);
//   sparklineData.push(newValue);

//   chart.updateSeries([{ data: sparklineData }]);
//   updateCurrentValue();
// }, 500);





//light current

(Apex.grid = { padding: { right: 0, left: 0 } }),
  (Apex.dataLabels = { enabled: false });

var sparklineData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

var colors = ["#6658dd"];
var dataColors = $("#spark2").data("colors");
dataColors && (colors = dataColors.split(","));

var options = {
  chart: { 
    type: "area", 
    height: 160, 
    sparkline: { enabled: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      dynamicAnimation: { speed: 500 } // Suaviza la animación
    }
  },
  stroke: { width: 2, curve: "smooth" },
  fill: { opacity: 0.3 },
  series: [{ name: "Luz en el ambiente", data: sparklineData }],
  yaxis: { min: 0, max: 100 },
  colors: colors,
  title: { text: "Luz en el ambiente", offsetX: 10, style: { fontSize: "22px" } },
  subtitle: {
    text: "Lumen",
    offsetX: 10,
    offsetY: 35,
    style: { fontSize: "13px" },
  },
  markers: { size: 0 },
  tooltip: { theme: "dark" }
};

var chart = new ApexCharts(document.querySelector("#spark2"), options);
chart.render();

// Mostrar el último valor de amperios en texto
function updateLightValue() {
  let lastValue = sparklineData[sparklineData.length - 1];
  document.getElementById("lighttValue").innerText = `Corriente: ${lastValue} Lumen`;
}




//Proximity
(Apex.grid = { padding: { right: 0, left: 0 } }),
  (Apex.dataLabels = { enabled: false });

var sparklineData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

var colors = ["#6658dd"];
var dataColors = $("#spark3").data("colors");
dataColors && (colors = dataColors.split(","));

var options = {
  chart: { 
    type: "area", 
    height: 160, 
    sparkline: { enabled: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      dynamicAnimation: { speed: 500 } // Suaviza la animación
    }
  },
  stroke: { width: 2, curve: "smooth" },
  fill: { opacity: 0.3 },
  series: [{ name: "Proximidad actual", data: sparklineData }],
  yaxis: { min: 0, max: 100 },
  colors: colors,
  title: { text: "Proximidad Actual", offsetX: 10, style: { fontSize: "22px" } },
  subtitle: {
    text: "Proximidad",
    offsetX: 10,
    offsetY: 35,
    style: { fontSize: "13px" },
  },
  markers: { size: 0 },
  tooltip: { theme: "dark" }
};

var chart = new ApexCharts(document.querySelector("#spark3"), options);
chart.render();

// Mostrar el último valor de amperios en texto
function updateProximityValue() {
  let lastValue = sparklineData[sparklineData.length - 1];
  document.getElementById("proximityValue").innerText = `Prximidad: ${lastValue} cm/m`;
}