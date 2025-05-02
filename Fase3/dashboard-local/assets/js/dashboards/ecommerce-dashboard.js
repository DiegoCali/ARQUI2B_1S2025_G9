(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";



  const client = new Paho.MQTT.Client(
    config.MQTT_BROKER_URL,
    config.MQTT_PORT,
    config.MQTT_CLIENT_ID
  );
  
  const client2 = new Paho.MQTT.Client(
    config.MQTT_BROKER_URL,
    config.MQTT_PORT,
    config.MQTT_CLIENT_ID + "_2"
  );
  
  // Arreglo donde se acumularán los datos
  let datosPrediccion = [];
  let datosCorriente = [];
  let fechasCorriente = [];
  let datosLuz = [];  // Para almacenar los datos de luz
  let fechasLuz = []; // Para almacenar las fechas/timestamps de la luz
  let graficoLuz = null; // La gráfica de luz ambiental
  let graficoCorriente = null;
  let temperatureChart = null;
  let humidityChart = null;
  let co2Chart = null;
  let distanciaChart = null;
  let heatmapChart = null;



  // 1. Configurar eventos
  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.error("Conexión perdida:", responseObject.errorMessage);
    }
  };

  client2.onMessageArrived = (message) => {
    try {
      console.log(message);
      const data = JSON.parse(message.payloadString);
      console.log(data);
  
      // Si el mensaje tiene la propiedad 'entered' con valor 'true'
      if (data.hasOwnProperty("entered") && data.entered === true) {
        // Enviar la alerta de que alguien ha entrado
        alert("¡Alguien ha entrado!");
        console.log("📩 Alerta: Alguien ha entrado.");
        document.getElementById('idMoviento').innerHTML = "Movimiento";
        document.getElementById('descMovimiento').innerHTML = "Alguien ha entrado";
        
        document.querySelector("#statusColorMovimiento1").classList.remove("text-warning-light");
        document.querySelector("#statusColorMovimiento1").classList.add("text-success-light");
      
        document.querySelector("#statusColorMovimiento2").classList.remove("text-stats-circle-warning");
        document.querySelector("#statusColorMovimiento2").classList.add("text-stats-circle-success");
      
      
        document.querySelector("#iconMovimiento").classList.remove("fa-xmark ");
        document.querySelector("#iconMovimiento").classList.add("fa-check");

      }
  

      
  
    } catch (e) {
      console.error("Error procesando mensaje:", e);
    }
  };

  
  client.onMessageArrived = (message) => {
    try {
      const data = JSON.parse(message.payloadString);
  
      if (
        data.hasOwnProperty("distance") &&
        data.hasOwnProperty("co2") &&
        data.hasOwnProperty("temperature") &&
        data.hasOwnProperty("humidity") &&
        data.hasOwnProperty("light") &&
        data.hasOwnProperty("current") &&
        data.hasOwnProperty("date-time")
      ) {
        datosPrediccion.push(data);
        console.log("📩 Nuevo dato recibido:", data);
  
        const light = parseFloat(data.light);
        const current = parseFloat(data.current);
        const timestamp = data["date-time"];
  
        if (!isNaN(light) && timestamp) {
          actualizarGraficaLight(light, timestamp); // Actualizamos la gráfica de luz
        }

        if (!isNaN(current) && timestamp) {
          actualizarGraficaCorriente(current, timestamp);
        }
        
        // ⬇️ NUEVO: actualizar gráficas tipo anillo
        const temp = parseFloat(data.temperature);
        const hum = parseFloat(data.humidity);
        const co2 = parseFloat(data.co2);

        
        if (!isNaN(temp) && temperatureChart) {
          temperatureChart.setOption({
            series: [{
              name: `${temp}°C`,
              data: [
                { value: temp, name: "Temperatura" },
                { value: 100 - temp, name: "" },
              ],
              label: {
                formatter: `${temp}°C`
              }
            }]
          });
        }
        
        if (!isNaN(hum) && humidityChart) {
          humidityChart.setOption({
            series: [{
              name: `${hum}%`,
              data: [
                { value: hum, name: "Humedad" },
                { value: 100 - hum, name: "" },
              ],
              label: {
                formatter: `${hum}%`
              }
            }]
          });
        }
        
        if (!isNaN(co2) && co2Chart) {
          co2Chart.setOption({
            series: [{
              name: `${co2}ppm`,
              data: [
                { value: co2, name: "CO₂" },
                { value: Math.max(1000 - co2, 0), name: "" },
              ],
              label: {
                formatter: `${co2}ppm`
              }
            }]
          });
        }
        const distancia = parseFloat(data.distance);
        if (!isNaN(distancia) && distanciaChart) {
          distanciaChart.setOption({
            series: [{
              data: [{ value: distancia }]
            }]
          });
        }
        if (heatmapChart) {
          dataMapChart(); // Vuelve a renderizar el heatmap con los nuevos datos
        }
        
        //Actualizar los valores

        document.getElementById("actualTemperature").innerHTML = + temp;
        document.getElementById("actualIncrementTemperature").innerHTML = Math.abs( Math.round(temp - 20));
        document.getElementById("actualHumidity").innerHTML = hum;
        document.getElementById("actualIncrementHumidity").innerHTML =Math.abs( Math.round(hum - 50));
        document.getElementById("actualCo2").innerHTML = co2;
        document.getElementById("actualIncrementCo2").innerHTML = Math.abs( Math.round(co2 - 400));
        document.getElementById("actualDistance").innerHTML = distancia;
        document.getElementById("actualIncrementDistance").innerHTML =(distancia - 0);

      } else {
        console.warn("⚠️ Mensaje no esperado:", data);
      }
    } catch (e) {
      console.error("Error procesando mensaje:", e);
    }
  };
  
  
  // 2. Conectar al broker
  client.connect({
    useSSL: true,
    onSuccess: () => {
      console.log("Conectado al topic Data");
      client.subscribe(config.MQTT_TOPIC_DATA);
      
      // Ahora podemos publicar el comando, ya que la conexión fue exitoso
    },
    onFailure: (error) => {
      console.error("Error de conexión:", error.errorMessage);
    }
  });

  client2.connect({
    useSSL: true,
    onSuccess: () => {
      console.log("Conectado al topic Persons");
      client2.subscribe(config.MQTT_TOPIC_PERSONS);
      
      // Ahora podemos publicar el comando, ya que la conexión fue exitoso
    },
    onFailure: (error) => {
      console.error("Error de conexión:", error.errorMessage);
    }
  });
  
  

// 1. Configurar evento de clic
document.getElementById("turnOnLights").addEventListener("click", function () {
  
  let valueLights = document.getElementById("valueTurnOffLights").value;

  if (valueLights == 0) {
    //Luces apagadas
    console.log("Encendiendo luces")
    const command = "1"; // Comando para encender la luz
  
  // 3. Enviar el comando al topic correspondiente
  const payload = {
    command: command, // Enviar el comando al topic
  };

  // 4. Publicar el mensaje a través del cliente MQTT
  const message = new Paho.MQTT.Message(JSON.stringify(payload));
  message.destinationName = config.MQTT_TOPIC_COMMANDS;

  client.send(message);

  console.log("Mensaje enviado automáticamente:", JSON.stringify(payload));

  // 5. Actualizar la UI para mostrar que las luces están encendidas
  document.querySelector("#turnOnLights").innerHTML = "Apagar Luces";
  document.querySelector("#textLights").innerHTML = "Luces Encendidas";

  //quitar las clases y agregar clases

  document.querySelector("#statusColor1").classList.remove("text-warning-light");
  document.querySelector("#statusColor1").classList.add("text-success-light");

  document.querySelector("#statusColor2").classList.remove("text-stats-circle-warning");
  document.querySelector("#statusColor2").classList.add("text-stats-circle-success");


  document.querySelector("#iconStatus").classList.remove("fa-pause");
  document.querySelector("#iconStatus").classList.add("fa-check");
  
  //actualizar input
  document.getElementById("valueTurnOffLights").value = 1;

  }else{
    console.log("Apagando luces")
    //Luces encendidas
    const command = "0"; // Comando para apagar la luz
    // 3. Enviar el comando al topic correspondiente
    const payload = {
      command: command, // Enviar el comando al topic
    };
    // 4. Publicar el mensaje a través del cliente MQTT
    const message = new Paho.MQTT.Message(JSON.stringify(payload));
    message.destinationName = config.MQTT_TOPIC_COMMANDS;
    client.send(message);

    console.log("Mensaje enviado automáticamente:", JSON.stringify(payload));

    // 5. Actualizar la UI para mostrar que las luces están apagadas
    document.querySelector("#turnOnLights").innerHTML = "Encender Luces";
    document.querySelector("#textLights").innerHTML = "Luces Apagadas";

    //quitar las clases y agregar clases

  document.querySelector("#statusColor1").classList.add("text-warning-light");
  document.querySelector("#statusColor1").classList.remove("text-success-light");

  document.querySelector("#statusColor2").classList.add("text-stats-circle-warning");
  document.querySelector("#statusColor2").classList.remove("text-stats-circle-success");


  document.querySelector("#iconStatus").classList.add("fa-pause");
  document.querySelector("#iconStatus").classList.remove("fa-check");

    //actualizar input
    document.getElementById("valueTurnOffLights").value = 0;

  }

  // 2. Comando que queremos enviar (en este caso, encender la luz)
  
  // Cambiar el comportamiento para el siguiente clic (apagar las luces)
  
});

  




  function actualizarGraficaCorriente(current, timestamp) {
    if (datosCorriente.length > 30) {
      datosCorriente.shift();
      fechasCorriente.shift();
    }
  
    datosCorriente.push(current);
    fechasCorriente.push(timestamp);
  
    document.getElementById("actualCurrent").innerHTML = "Corriente Actual: "+ current;
    if (graficoCorriente) {
      graficoCorriente.setOption({
        xAxis: {
          data: fechasCorriente,
        },
        series: [
          {
            data: datosCorriente,
          },
        ],
      });
    }
  }
  

  const actualCurrentData = () => {
    const container = document.querySelector(".actualCurrentData");
    if (!container) return;
  
    graficoCorriente = window.echarts.init(container);
  
    const opcionesIniciales = {
      xAxis: {
        type: "category",
        data: fechasCorriente,
        axisLabel: {
          formatter: (val) => window.dayjs(val).format("HH:mm:ss"),
        },
      },
      yAxis: {
        type: "value",
        name: "Corriente (A)",
      },
      series: [
        {
          data: datosCorriente,
          type: "line",
          smooth: false,
          showSymbol: false,
          name: "Corriente",
          areaStyle: {},
        },
      ],
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
    };
  
    graficoCorriente.setOption(opcionesIniciales);
  };
  


function actualizarGraficaLight(light, timestamp) {
  // Limitar los datos a los últimos 30 puntos
  if (datosLuz.length > 30) {
    datosLuz.shift();
    fechasLuz.shift();
  }

  // Añadir los nuevos datos
  datosLuz.push(light);
  fechasLuz.push(timestamp);

  // Actualizar el valor de luz actual en el HTML
  document.getElementById("actualLight").innerHTML = "Luz Ambiental Actual: " + light;

  // Si ya está inicializado el gráfico, actualizamos la opción
  if (graficoLuz) {
    graficoLuz.setOption({
      xAxis: {
        data: fechasLuz, // Actualizar las fechas en el eje X
        axisLine: {
          lineStyle: {
            color: '#f39c12', // Color de la línea del eje X
          },
        },
        axisLabel: {
          formatter: (val) => window.dayjs(val).format("HH:mm:ss"), // Formato de hora
          color: '#000000', // Color de las etiquetas del eje X
        },
      },
      yAxis: {
        type: "value",
        name: "Luz (lux)", // Etiqueta en el eje Y
        axisLine: {
          lineStyle: {
            color: '#f39c12', // Color de la línea del eje Y
          },
        },
        axisLabel: {
          color: '#000000', // Color de las etiquetas del eje Y
        },
      },
      series: [
        {
          data: datosLuz, // Usamos datosLuz para la serie
          type: "line",
          smooth: true, // Hacer la línea más suave
          showSymbol: false, // No mostrar los símbolos en los puntos
          name: "Luz Ambiental",
          areaStyle: {
            color: "rgba(241, 122, 54, 0.3)", // Color de fondo de la gráfica (color suave)
          },
          lineStyle: {
            color: "#f39c12", // Color de la línea
            width: 3, // Grosor de la línea
            type: "solid", // Estilo de línea
          },
          itemStyle: {
            color: "#f39c12", // Color de los puntos
          },
        },
      ],
      tooltip: {
        trigger: "axis", // Mostrar el tooltip al pasar por el eje
        backgroundColor: "#34495e", // Fondo del tooltip
        textStyle: {
          color: "#ecf0f1", // Color del texto del tooltip
        },
        borderColor: "#e74c3c", // Color del borde del tooltip
        borderWidth: 2,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true, // Asegurarse de que las etiquetas estén dentro de la gráfica
      },
    });
  }
}

const actualLightData = () => {
  const container = document.querySelector(".actualLightData"); // Contenedor donde se renderiza la gráfica
  if (!container) return; // Si no existe el contenedor, no hacer nada

  graficoLuz = window.echarts.init(container); // Inicializar el gráfico

  const opcionesIniciales = {
    xAxis: {
      type: "category",
      data: fechasLuz, // Usamos fechasLuz para el eje X
      axisLabel: {
        formatter: (val) => window.dayjs(val).format("HH:mm:ss"), // Formato de hora
        color: '#000000', // Color de las etiquetas del eje X
      },
      axisLine: {
        lineStyle: {
          color: '#f39c12', // Color de la línea del eje X
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Luz (lux)", // Etiqueta en el eje Y
      axisLabel: {
        color: '#e74c3c', // Color de las etiquetas del eje Y
      },
      axisLine: {
        lineStyle: {
          color: '#f39c12', // Color de la línea del eje Y
        },
      },
    },
    series: [
      {
        data: datosLuz, // Usamos datosLuz para la serie
        type: "line",
        smooth: true, // Hacer la línea más suave
        showSymbol: false, // No mostrar los símbolos en los puntos
        name: "Luz Ambiental",
        areaStyle: {
          color: "rgba(241, 122, 54, 0.3)", // Color de fondo de la gráfica
        },
        lineStyle: {
          color: "#f39c12", // Color de la línea
          width: 3, // Grosor de la línea
          type: "solid", // Estilo de línea
        },
        itemStyle: {
          color: "#f39c12", // Color de los puntos
        },
      },
    ],
    tooltip: {
      trigger: "axis", // Mostrar el tooltip al pasar por el eje
      backgroundColor: "#34495e", // Fondo del tooltip
      textStyle: {
        color: "#ecf0f1", // Color del texto del tooltip
      },
      borderColor: "#e74c3c", // Color del borde del tooltip
      borderWidth: 2,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true, // Asegurarse de que las etiquetas estén dentro de la gráfica
    },
  };

  // Inicializar la gráfica con las opciones
  graficoLuz.setOption(opcionesIniciales);
};




  const { merge: merge } = window._;
  const echartSetOption = (t, e, s, n) => {
    const { breakpoints: o, resize: a } = window.phoenix.utils,
      l = (e) => {
        Object.keys(e).forEach((s) => {
          window.innerWidth > o[s] && t.setOption(e[s]);
        });
      },
      r = document.body;
    t.setOption(merge(s(), e));
    const i = document.querySelector(".navbar-vertical-toggle");
    i &&
      i.addEventListener("navbar.vertical.toggle", () => {
        t.resize(), n && l(n);
      }),
      a(() => {
        t.resize(), n && l(n);
      }),
      n && l(n),
      r.addEventListener("clickControl", ({ detail: { control: o } }) => {
        "phoenixTheme" === o && t.setOption(window._.merge(s(), e)), n && l(n);
      });
  };
  const echartTabs = document.querySelectorAll("[data-tab-has-echarts]");
  echartTabs &&
    echartTabs.forEach((t) => {
      t.addEventListener("shown.bs.tab", (t) => {
        const e = t.target,
          { hash: s } = e,
          n = s || e.dataset.bsTarget,
          o = document
            .getElementById(n.substring(1))
            ?.querySelector("[data-echart-tab]");
        o && window.echarts.init(o).resize();
      });
    });



  
   
  

    




  const tooltipFormatter = (t, e = "MMM DD") => {
    let s = "";
    return (
      t.forEach((t) => {
        s += `<div class='ms-1'>\n        <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10" style="color:${
          t.borderColor ? t.borderColor : t.color
        }"></span>\n          ${t.seriesName} : ${
          "object" == typeof t.value ? t.value[1] : t.value
        }\n        </h6>\n      </div>`;
      }),
      `<div>\n            <p class='mb-2 text-body-tertiary'>\n              ${
        window.dayjs(t[0].axisValue).isValid()
          ? window.dayjs(t[0].axisValue).format(e)
          : t[0].axisValue
      }\n            </p>\n            ${s}\n          </div>`
    );
  };


  
  const handleTooltipPosition = ([t, , e, , s]) => {
    if (window.innerWidth <= 540) {
      const n = e.offsetHeight,
        o = { top: t[1] - n - 20 };
      return (o[t[0] < s.viewSize[0] / 2 ? "left" : "right"] = 5), o;
    }
    return null;
  };

  const newCustomersChartsInit = () => {
    const { getColor: o, getData: t, getDates: e } = window.phoenix.utils,
      a = document.querySelector(".echarts-new-customers"),
      i = (o) => {
        const t = window.dayjs(o[0].axisValue),
          e = window.dayjs(o[0].axisValue).subtract(1, "month"),
          a = o.map((o, a) => ({
            value: o.value,
            date: a > 0 ? e : t,
            color: o.color,
          }));
        let i = "";
        return (
          a.forEach((o, t) => {
            i += `<h6 class="fs-9 text-body-tertiary ${
              t > 0 && "mb-0"
            }"><span class="fas fa-circle me-2" style="color:${
              o.color
            }"></span>\n      ${o.date.format("MMM DD")} : ${
              o.value
            }\n    </h6>`;
          }),
          `<div class='ms-1'>\n              ${i}\n            </div>`
        );
      };
    if (a) {
      const r = t(a, "echarts"),
        s = window.echarts.init(a);
      echartSetOption(s, r, () => ({
        tooltip: {
          trigger: "axis",
          padding: 10,
          backgroundColor: o("body-highlight-bg"),
          borderColor: o("border-color"),
          textStyle: { color: o("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          formatter: i,
          extraCssText: "z-index: 1000",
        },
        xAxis: [
          {
            type: "category",
            data: e(new Date("5/1/2022"), new Date("5/7/2022"), 864e5),
            show: !0,
            boundaryGap: !1,
            axisLine: { show: !0, lineStyle: { color: o("secondary-bg") } },
            axisTick: { show: !1 },
            axisLabel: {
              formatter: (o) => window.dayjs(o).format("DD MMM"),
              showMinLabel: !0,
              showMaxLabel: !1,
              color: o("secondary-color"),
              align: "left",
              interval: 5,
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
          },
          {
            type: "category",
            position: "bottom",
            show: !0,
            data: e(new Date("5/1/2022"), new Date("5/7/2022"), 864e5),
            axisLabel: {
              formatter: (o) => window.dayjs(o).format("DD MMM"),
              interval: 130,
              showMaxLabel: !0,
              showMinLabel: !1,
              color: o("secondary-color"),
              align: "right",
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
            axisLine: { show: !1 },
            axisTick: { show: !1 },
            splitLine: { show: !1 },
            boundaryGap: !1,
          },
        ],
        yAxis: { show: !1, type: "value", boundaryGap: !1 },
        series: [
          {
            type: "line",
            data: [150, 100, 300, 200, 250, 180, 250],
            showSymbol: !1,
            symbol: "circle",
            lineStyle: { width: 2, color: o("secondary-bg") },
            emphasis: { lineStyle: { color: o("secondary-bg") } },
            zlevel: 2,
          },
          {
            type: "line",
            data: [200, 150, 250, 100, 500, 400, 600],
            lineStyle: { width: 2, color: o("primary") },
            showSymbol: !1,
            symbol: "circle",
            zlevel: 2,
          },
        ],
        grid: { left: 0, right: 0, top: 5, bottom: 20 },
      }));
    }
  };

  const actualDataProximity = () => {
    const { getColor: o } = window.phoenix.utils,
      e = document.querySelector(".echarts-proximity");
  
    if (!e) return;
  
    distanciaChart = echarts.init(e);
  
    distanciaChart.setOption({
      tooltip: {
        trigger: "item",
        padding: [7, 10],
        backgroundColor: o("body-highlight-bg"),
        borderColor: o("border-color"),
        textStyle: { color: o("light-text-emphasis") },
        borderWidth: 1,
        position: (...t) => handleTooltipPosition(t),
        transitionDuration: 0,
        formatter: (t) => `<strong>${t.seriesName}:</strong> ${t.value} cm`,
        extraCssText: "z-index: 1000",
      },
      legend: { show: false },
      series: [
        {
          type: "gauge",
          center: ["50%", "60%"],
          name: "Distancia",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          itemStyle: { color: o("primary") },
          progress: {
            show: true,
            roundCap: true,
            width: 12,
            itemStyle: { shadowBlur: 0, shadowColor: "#0000" },
          },
          pointer: { show: false },
          axisLine: {
            roundCap: true,
            lineStyle: { width: 12, color: [[1, o("primary-bg-subtle")]] },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: {
            show: true,
            offsetCenter: [0, "-30%"],
            fontSize: 20,
            color: o("primary"),
            formatter: (val) => `${val} cm`,
          },
          data: [{ value: 0 }],
        },
      ],
    });
  };
  

  const projectionVsActualChartInit = () => {
    const { getColor: t, getData: o, getPastDates: e } = window.phoenix.utils,
      i = document.querySelector(".echart-projection-actual"),
      r = e(10),
      a = [
        44485, 20428, 47302, 45180, 31034, 46358, 26581, 36628, 38219, 43256,
      ],
      n = [
        38911, 29452, 31894, 47876, 31302, 27731, 25490, 30355, 27176, 30393,
      ];
    if (i) {
      const e = o(i, "echarts"),
        l = window.echarts.init(i);
      echartSetOption(l, e, () => ({
        color: [t("primary"), t("tertiary-bg")],
        tooltip: {
          trigger: "axis",
          padding: [7, 10],
          backgroundColor: t("body-highlight-bg"),
          borderColor: t("border-color"),
          textStyle: { color: t("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          position: (...t) => handleTooltipPosition(t),
          formatter: (t) => tooltipFormatter(t),
          extraCssText: "z-index: 1000",
        },
        legend: {
          data: ["Projected revenue", "Actual revenue"],
          right: "right",
          width: "100%",
          itemWidth: 16,
          itemHeight: 8,
          itemGap: 20,
          top: 3,
          inactiveColor: t("quaternary-color"),
          textStyle: {
            color: t("body-color"),
            fontWeight: 600,
            fontFamily: "Nunito Sans",
          },
        },
        xAxis: {
          type: "category",
          axisLabel: {
            color: t("secondary-color"),
            formatter: (t) => window.dayjs(t).format("MMM DD"),
            interval: 3,
            fontFamily: "Nunito Sans",
            fontWeight: 600,
            fontSize: 12.8,
          },
          data: r,
          axisLine: { lineStyle: { color: t("tertiary-bg") } },
          axisTick: !1,
        },
        yAxis: {
          axisPointer: { type: "none" },
          axisTick: "none",
          splitLine: { interval: 5, lineStyle: { color: t("secondary-bg") } },
          axisLine: { show: !1 },
          axisLabel: {
            fontFamily: "Nunito Sans",
            fontWeight: 600,
            fontSize: 12.8,
            color: t("secondary-color"),
            margin: 20,
            verticalAlign: "bottom",
            formatter: (t) => `$${t.toLocaleString()}`,
          },
        },
        series: [
          {
            name: "Projected revenue",
            type: "bar",
            barWidth: "6px",
            data: n,
            barGap: "30%",
            label: { show: !1 },
            itemStyle: { borderRadius: [2, 2, 0, 0], color: t("primary") },
          },
          {
            name: "Actual revenue",
            type: "bar",
            data: a,
            barWidth: "6px",
            barGap: "30%",
            label: { show: !1 },
            z: 10,
            itemStyle: {
              borderRadius: [2, 2, 0, 0],
              color: t("info-bg-subtle"),
            },
          },
        ],
        grid: { right: 0, left: 3, bottom: 0, top: "15%", containLabel: !0 },
        animation: !1,
      }));
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const leaftletPoints = [
    {
      lat: 53.958332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 52.958332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 51.958332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 53.958332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 54.958332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 55.958332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 53.908332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 53.008332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 53.158332,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 53.000032,
      long: -1.080278,
      name: "Diana Meyer",
      street: "Slude Strand 27",
      location: "1130 Kobenhavn",
    },
    {
      lat: 52.292001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 52.392001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 51.492001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 51.192001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 52.292001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 54.392001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 51.292001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 52.102001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 52.202001,
      long: -2.22,
      name: "Anke Schroder",
      street: "Industrivej 54",
      location: "4140 Borup",
    },
    {
      lat: 51.063202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.363202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.463202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.563202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.763202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.863202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.963202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.000202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.000202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.163202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 52.263202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 53.463202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 55.163202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.263202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.463202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.563202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.663202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.763202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.863202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 56.963202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 57.973202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 57.163202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.163202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.263202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.363202,
      long: -1.308,
      name: "Tobias Vogel",
      street: "Mollebakken 33",
      location: "3650 Olstykke",
    },
    {
      lat: 51.409,
      long: -2.647,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.68,
      long: -1.49,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 50.259998,
      long: -5.051,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 54.906101,
      long: -1.38113,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.383331,
      long: -1.466667,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.483002,
      long: -2.2931,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.509865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.109865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.209865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.309865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.409865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.609865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.709865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.809865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 51.909865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.109865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.209865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.309865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.409865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.509865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.609865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.709865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.809865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.909865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.519865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.529865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.539865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.549865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 52.549865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.109865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.209865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.319865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.329865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.409865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.559865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.619865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.629865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.639865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.649865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.669865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.669865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.719865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.739865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.749865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.759865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.769865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.769865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.819865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.829865,
      long: -0.118092,
      name: "Richard Hendricks",
      street: "37 Seafield Place",
      location: "London",
    },
    {
      lat: 53.483959,
      long: -2.244644,
      name: "Ethel B. Brooks",
      street: "2576 Sun Valley Road",
    },
    {
      lat: 40.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 39.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 38.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 37.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 40.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 41.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 42.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 43.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 44.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 45.737,
      long: -73.923,
      name: "Marshall D. Lewis",
      street: "1489 Michigan Avenue",
      location: "Michigan",
    },
    {
      lat: 46.7128,
      long: 74.006,
      name: "Elizabeth C. Lyons",
      street: "4553 Kenwood Place",
      location: "Fort Lauderdale",
    },
    {
      lat: 40.7128,
      long: 74.1181,
      name: "Elizabeth C. Lyons",
      street: "4553 Kenwood Place",
      location: "Fort Lauderdale",
    },
    {
      lat: 14.235,
      long: 51.9253,
      name: "Ralph D. Wylie",
      street: "3186 Levy Court",
      location: "North Reading",
    },
    {
      lat: 15.235,
      long: 51.9253,
      name: "Ralph D. Wylie",
      street: "3186 Levy Court",
      location: "North Reading",
    },
    {
      lat: 16.235,
      long: 51.9253,
      name: "Ralph D. Wylie",
      street: "3186 Levy Court",
      location: "North Reading",
    },
    {
      lat: 14.235,
      long: 51.9253,
      name: "Ralph D. Wylie",
      street: "3186 Levy Court",
      location: "North Reading",
    },
    {
      lat: 15.8267,
      long: 47.9218,
      name: "Hope A. Atkins",
      street: "3715 Hillcrest Drive",
      location: "Seattle",
    },
    {
      lat: 15.9267,
      long: 47.9218,
      name: "Hope A. Atkins",
      street: "3715 Hillcrest Drive",
      location: "Seattle",
    },
    {
      lat: 23.4425,
      long: 58.4438,
      name: "Samuel R. Bailey",
      street: "2883 Raoul Wallenberg Place",
      location: "Cheshire",
    },
    {
      lat: 23.5425,
      long: 58.3438,
      name: "Samuel R. Bailey",
      street: "2883 Raoul Wallenberg Place",
      location: "Cheshire",
    },
    {
      lat: -37.8927369333,
      long: 175.4087452333,
      name: "Samuel R. Bailey",
      street: "3228 Glory Road",
      location: "Nashville",
    },
    {
      lat: -38.9064188833,
      long: 175.4441556833,
      name: "Samuel R. Bailey",
      street: "3228 Glory Road",
      location: "Nashville",
    },
    {
      lat: -12.409874,
      long: -65.596832,
      name: "Ann J. Perdue",
      street: "921 Ella Street",
      location: "Dublin",
    },
    {
      lat: -22.090887,
      long: -57.411827,
      name: "Jorge C. Woods",
      street: "4800 North Bend River Road",
      location: "Allen",
    },
    {
      lat: -19.019585,
      long: -65.261963,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: -16.500093,
      long: -68.214684,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: -17.413977,
      long: -66.165321,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: -16.489689,
      long: -68.119293,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: 54.766323,
      long: 3.08603729,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: 54.866323,
      long: 3.08603729,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: 49.537685,
      long: 3.08603729,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: 54.715424,
      long: 0.509207,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: 44.891666,
      long: 10.136665,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: 48.078335,
      long: 14.535004,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: -26.358055,
      long: 27.398056,
      name: "Russ E. Panek",
      street: "4068 Hartland Avenue",
      location: "Appleton",
    },
    {
      lat: -29.1,
      long: 26.2167,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: -29.883333,
      long: 31.049999,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: -26.266111,
      long: 27.865833,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: -29.087217,
      long: 26.154898,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: -33.958252,
      long: 25.619022,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: -33.977074,
      long: 22.457581,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: -26.563404,
      long: 27.844164,
      name: "Wilbur J. Dry",
      street: "2043 Jadewood Drive",
      location: "Northbrook",
    },
    {
      lat: 51.21389,
      long: -102.462776,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 52.321945,
      long: -106.584167,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 50.288055,
      long: -107.793892,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 52.7575,
      long: -108.28611,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 50.393333,
      long: -105.551941,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 50.930557,
      long: -102.807777,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 52.856388,
      long: -104.610001,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 52.289722,
      long: -106.666664,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 52.201942,
      long: -105.123055,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 53.278046,
      long: -110.00547,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 49.13673,
      long: -102.990959,
      name: "Joseph B. Poole",
      street: "3364 Lunetta Street",
      location: "Wichita Falls",
    },
    {
      lat: 45.484531,
      long: -73.597023,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.266666,
      long: -71.900002,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.349998,
      long: -72.51667,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 47.333332,
      long: -79.433334,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.400002,
      long: -74.033333,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.683334,
      long: -73.433334,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 48.099998,
      long: -77.783333,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.5,
      long: -72.316666,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 46.349998,
      long: -72.550003,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 48.119999,
      long: -69.18,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.599998,
      long: -75.25,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 46.099998,
      long: -71.300003,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 45.700001,
      long: -73.633331,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    {
      lat: 47.68,
      long: -68.879997,
      name: "Claudette D. Nowakowski",
      street: "3742 Farland Avenue",
      location: "San Antonio",
    },
    { lat: 46.716667, long: -79.099998, name: "299" },
    { lat: 45.016666, long: -72.099998, name: "299" },
  ];

  const { echarts: echarts$1 } = window,
    returningCustomerChartInit = () => {
      const { getColor: t, getData: e } = window.phoenix.utils,
        o = document.querySelector(".echart-returning-customer");
      if (o) {
        const i = e(o, "echarts"),
          r = echarts$1.init(o);
        echartSetOption(r, i, () => ({
          color: t("body-highlight-bg"),
          legend: {
            data: [
              {
                name: "Fourth time",
                icon: "roundRect",
                itemStyle: { color: t("primary-light"), borderWidth: 0 },
              },
              {
                name: "Third time",
                icon: "roundRect",
                itemStyle: { color: t("info-lighter"), borderWidth: 0 },
              },
              {
                name: "Second time",
                icon: "roundRect",
                itemStyle: { color: t("primary"), borderWidth: 0 },
              },
            ],
            right: "right",
            width: "100%",
            itemWidth: 16,
            itemHeight: 8,
            itemGap: 20,
            top: 3,
            inactiveColor: t("quaternary-color"),
            inactiveBorderWidth: 0,
            textStyle: {
              color: t("body-color"),
              fontWeight: 600,
              fontFamily: "Nunito Sans",
            },
          },
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "none" },
            padding: [7, 10],
            backgroundColor: t("body-highlight-bg"),
            borderColor: t("border-color"),
            textStyle: { color: t("light-text-emphasis") },
            borderWidth: 1,
            transitionDuration: 0,
            formatter: tooltipFormatter,
            extraCssText: "z-index: 1000",
          },
          xAxis: {
            type: "category",
            data: months,
            show: !0,
            boundaryGap: !1,
            axisLine: { show: !0, lineStyle: { color: t("tertiary-bg") } },
            axisTick: { show: !1 },
            axisLabel: {
              showMinLabel: !1,
              showMaxLabel: !1,
              color: t("secondary-color"),
              formatter: (t) => t.slice(0, 3),
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
            splitLine: {
              show: !0,
              lineStyle: { color: t("secondary-bg"), type: "dashed" },
            },
          },
          yAxis: {
            type: "value",
            boundaryGap: !1,
            axisLabel: {
              showMinLabel: !0,
              showMaxLabel: !0,
              color: t("secondary-color"),
              formatter: (t) => `${t}%`,
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
            splitLine: { show: !0, lineStyle: { color: t("secondary-bg") } },
          },
          series: [
            {
              name: "Fourth time",
              type: "line",
              data: [62, 90, 90, 90, 78, 84, 17, 17, 17, 17, 82, 95],
              showSymbol: !1,
              symbol: "circle",
              symbolSize: 10,
              emphasis: { lineStyle: { width: 1 } },
              lineStyle: {
                type: "dashed",
                width: 1,
                color: t("primary-light"),
              },
              itemStyle: { borderColor: t("primary-light"), borderWidth: 3 },
              zlevel: 3,
            },
            {
              name: "Third time",
              type: "line",
              data: [50, 50, 30, 62, 18, 70, 70, 22, 70, 70, 70, 70],
              showSymbol: !1,
              symbol: "circle",
              symbolSize: 10,
              emphasis: { lineStyle: { width: 1 } },
              lineStyle: { width: 1, color: t("info-lighter") },
              itemStyle: { borderColor: t("info-lighter"), borderWidth: 3 },
              zlevel: 2,
            },
            {
              name: "Second time",
              type: "line",
              data: [40, 78, 60, 78, 60, 20, 60, 40, 60, 40, 20, 78],
              showSymbol: !1,
              symbol: "circle",
              symbolSize: 10,
              emphasis: { lineStyle: { width: 3 } },
              lineStyle: { width: 3, color: t("primary") },
              itemStyle: { borderColor: t("primary"), borderWidth: 3 },
              zlevel: 1,
            },
          ],
          grid: { left: 0, right: 8, top: "14%", bottom: 0, containLabel: !0 },
        }));
      }
    };

    
  const { echarts: echarts } = window,
  topTemperatureChartInit = () => {
    const { getColor: e } = window.phoenix.utils,
      el = document.querySelector(".echart-top-Temperature");
  
    if (!el) return;
  
    temperatureChart = echarts.init(el);
  
    const baseOption = {
      color: [e("danger"), e("danger-lighter"), e("danger-dark")],
      tooltip: { show: false },
      legend: { show: false },
      series: [
        {
          name: "0°C",
          type: "pie",
          radius: ["100%", "87%"],
          data: [
            { value: 1, name: "Temperatura" },
            { value: 0, name: "" },
          ],
          label: {
            show: true,
            position: "center",
            formatter: "0°C",
            fontSize: 23,
            color: e("light-text-emphasis"),
          },
          emphasis: {
            scale: false,
            itemStyle: { color: "inherit" },
          },
          itemStyle: { borderWidth: 2, borderColor: e("body-bg") },
        },
      ],
      grid: { containLabel: true },
    };
  
    temperatureChart.setOption(baseOption);
  };

  const topHumidityChartInit = () => {
    const { getColor: e } = window.phoenix.utils,
      el = document.querySelector(".echart-top-Humidity");
  
    if (!el) return;
  
    humidityChart = echarts.init(el);
  
    humidityChart.setOption({
      color: [e("primary"), e("primary-lighter"), e("info-dark")],
      tooltip: { show: false },
      legend: { show: false },
      series: [
        {
          name: "0%",
          type: "pie",
          radius: ["100%", "87%"],
          data: [
            { value: 1, name: "Humedad" },
            { value: 0, name: "" },
          ],
          label: {
            show: true,
            position: "center",
            formatter: "0%",
            fontSize: 23,
            color: e("light-text-emphasis"),
          },
          emphasis: {
            scale: false,
            itemStyle: { color: "inherit" },
          },
          itemStyle: { borderWidth: 2, borderColor: e("body-bg") },
        },
      ],
      grid: { containLabel: true },
    });
  };
  

  const topCo2ChartInit = () => {
    const { getColor: e } = window.phoenix.utils,
      el = document.querySelector(".echart-top-CO2");
  
    if (!el) return;
  
    co2Chart = echarts.init(el);
  
    co2Chart.setOption({
      color: [e("warning"), e("warning-lighter"), e("warning-dark")],
      tooltip: { show: false },
      legend: { show: false },
      series: [
        {
          name: "0ppm",
          type: "pie",
          radius: ["100%", "87%"],
          data: [
            { value: 1, name: "CO₂" },
            { value: 0, name: "" },
          ],
          label: {
            show: true,
            position: "center",
            formatter: "0ppm",
            fontSize: 23,
            color: e("light-text-emphasis"),
          },
          emphasis: {
            scale: false,
            itemStyle: { color: "inherit" },
          },
          itemStyle: { borderWidth: 2, borderColor: e("body-bg") },
        },
      ],
      grid: { containLabel: true },
    });
  };
  

  const dataMapChart = () => {
    const {
      getColor: t,
      getData: o,
      rgbaColor: a,
    } = window.phoenix.utils;
  
    const r = document.querySelector(".echart-heatmap-chart-example");
  
    const horas = [
      "12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"
    ];
  
    const dias = [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];
  
    // Crear datos de mapa de calor dinámicamente desde datosPrediccion
    const heatmapData = [];
  
    for (let y = 0; y < dias.length; y++) {
      for (let x = 0; x < horas.length; x++) {
        const index = y * horas.length + x;
        const data = datosPrediccion[index];
  
        const valor = data ? parseFloat(data.temperature) : 0;
        heatmapData.push([x, y, valor]);
      }
    }
  
    if (r) {
      const e = o(r, "echarts");
      heatmapChart = window.echarts.init(r);
  
      echartSetOption(heatmapChart, e, () => ({
        tooltip: {
          position: "top",
          padding: [7, 10],
          backgroundColor: t("body-highlight-bg"),
          borderColor: t("border-color"),
          textStyle: { color: t("light-text-emphasis") },
          borderWidth: 1,
        },
        grid: {
          right: 5,
          left: 5,
          top: 5,
          bottom: "15%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: horas,
          splitArea: { show: true },
          axisLabel: { color: t("quaternary-color") },
          axisLine: { show: true, lineStyle: { color: t("quaternary-color") } },
        },
        yAxis: {
          type: "category",
          data: dias,
          axisLabel: {
            formatter: (d) => d.slice(0, 3),
            color: t("quaternary-color"),
          },
          splitArea: { show: true },
          axisLine: { show: true, lineStyle: { color: t("quaternary-color") } },
        },
        visualMap: {
          min: 0,
          max: 40, // Ajusta según tu rango de temperatura
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "0%",
          textStyle: { color: t("tertiary-color"), fontWeight: 500 },
          inRange: {
            color: [
              a(t("danger"), 0.8),
              a(t("warning"), 0.8),
              a(t("success"), 0.8),
            ],
          },
        },
        series: [
          {
            type: "heatmap",
            data: heatmapData,
            label: { show: true },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: a(t("black"), 0.5),
              },
            },
          },
        ],
      }));
    }
  };
  
    


  

  const revenueMapInit = () => {
    const e = document.body,
      t = document.querySelectorAll(".revenue-map");
    if (t.length && window.google) {
      const i = {
        SnazzyCustomLight: [
          {
            featureType: "administrative",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#525b75" }],
          },
          {
            featureType: "administrative",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [{ visibility: "on" }, { color: "#ffffff" }],
          },
          {
            featureType: "administrative.province",
            elementType: "geometry.stroke",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ visibility: "on" }, { color: "#E3E6ED" }],
          },
          {
            featureType: "landscape.natural",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "all",
            stylers: [{ color: "#eff2f6" }],
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.line",
            elementType: "labels.text",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.station.airport",
            elementType: "geometry",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.station.airport",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#F5F7FA" }],
          },
          {
            featureType: "water",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        SnazzyCustomDark: [
          {
            featureType: "administrative",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#8a94ad" }],
          },
          {
            featureType: "administrative",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [{ visibility: "on" }, { color: "#000000" }],
          },
          {
            featureType: "administrative.province",
            elementType: "geometry.stroke",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ visibility: "on" }, { color: "#222834" }],
          },
          {
            featureType: "landscape.natural",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "all",
            stylers: [{ color: "#141824" }],
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.line",
            elementType: "labels.text",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.station.airport",
            elementType: "geometry",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit.station.airport",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f111a" }],
          },
          {
            featureType: "water",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };
      t.forEach((t) => {
        const l = t,
          s = {
            zoom: 1.4,
            minZoom: 1.4,
            zoomControl: !1,
            scrollwheel: !0,
            disableDefaultUI: !0,
            center: new window.google.maps.LatLng(25.659195, 30.182691),
            styles:
              "dark" === window.config.config.phoenixTheme
                ? i.SnazzyCustomDark
                : i.SnazzyCustomLight,
          },
          r = new window.google.maps.Map(l, s),
          a = new window.google.maps.InfoWindow(),
          o = leaftletPoints.map((e) => {
            const { name: t, location: i, street: l } = e,
              s = `\n        <h6 class="mb-1">${t}</h6>\n        <p class="m-0 text-body-quaternary">${l}, ${i}</p>\n      `,
              o = new window.google.maps.Marker({
                position: { lat: e.lat, lng: e.lng },
              });
            return (
              o.addListener("click", () => {
                a.setContent(s), a.open(r, o);
              }),
              o
            );
          }),
          y = {
            render: ({ count: e, position: t }) => {
              let i = "#3874ff";
              e > 10 && (i = "#e5780b"), e > 90 && (i = "#25b003");
              const l = window.btoa(
                `\n            <svg fill="${i}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">\n              <circle cx="120" cy="120" opacity=".9" r="70" />\n              <circle cx="120" cy="120" opacity=".3" r="90" />\n              <circle cx="120" cy="120" opacity=".2" r="110" />\n            </svg>`
              );
              return new window.google.maps.Marker({
                label: { text: String(e), color: "white", fontSize: "10px" },
                position: t,
                icon: {
                  url: `data:image/svg+xml;base64,${l}`,
                  scaledSize: new window.google.maps.Size(45, 45),
                },
                zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + e,
              });
            },
          };
        return (
          e &&
            e.addEventListener(
              "clickControl",
              ({ detail: { control: e, value: t } }) => {
                "phoenixTheme" === e &&
                  r.set(
                    "styles",
                    "dark" === t ? i.SnazzyCustomDark : i.SnazzyCustomLight
                  );
              }
            ),
          new window.markerClusterer.MarkerClusterer({
            markers: o,
            map: r,
            renderer: y,
          })
        );
      });
    }
  };

  const { L: L } = window,
    leafletInit = () => {
      const e = document.getElementById("map");
      if (L && e) {
        const e = () =>
            "dark" === window.config.config.phoenixTheme
              ? [
                  "invert:98%",
                  "grayscale:69%",
                  "bright:89%",
                  "contrast:111%",
                  "hue:205deg",
                  "saturate:1000%",
                ]
              : ["bright:101%", "contrast:101%", "hue:23deg", "saturate:225%"],
          t = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          a = L.tileLayer.colorFilter(t, {
            attribution: null,
            transparent: !0,
            filter: e(),
          }),
          o = L.map("map", {
            center: L.latLng(25.659195, 30.182691),
            zoom: 0.6,
            layers: [a],
            minZoom: 1.4,
          }),
          n = L.markerClusterGroup({
            chunkedLoading: !1,
            spiderfyOnMaxZoom: !1,
          });
        leaftletPoints.map((e) => {
          const { name: t, location: a, street: o } = e,
            r = L.icon({
              iconUrl:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAACXBIWXMAAAFgAAABYAEg2RPaAAADpElEQVRYCZ1XS1LbQBBtybIdiMEJKSpUqihgEW/xDdARyAnirOIl3MBH8NK7mBvkBpFv4Gy9IRSpFIQiRPyNfqkeZkY9HwmFt7Lm06+7p/vN2MmyDIrQ6QebALAHAD4AbFuWfQeAAACGs5H/w5jlsJJw4wMA+GhMFuMA99jIDJJOP+ihZwDQFmNuowWO1wS3viDXpdEdZPEc0odruj0EgN5s5H8tJOEEX8R3rbkMtcU34NTqhe5nSQTJ7Tkk80s6/Gk28scGiULguFBffgdufdEwWoQ0uoXo8hdAlooVH0REjISfwZSlyHGh0V5n6aHAtKTxXI5g6nQnMH0P4bEgwtR18Yw8Pj8QZ4ARUAI0Hl+fQZZGisGEBVwHr7XKzox57DXZ/ij8Cdwe2u057z9/wygOxRl4S2vSUHx1oucaMQGAHTrgtdag9mK5aN+Wx/uAAQ9Zenp/SRce4TpaNbQK4+sTcGqeTB/aIXv3XN5oj2VKqii++U0JunpZ8urxee4hvjqVc2hHpBDXuKKT9XMgVYJ1/1fPGSeaikzgmWWkMIi9bVf8UhotXxzORn5gWFchI8QyttlzjS0qpsaIGY2MMsujV/AUSdcY0dDpB6/EiOPYzclR1CI5mOez3ekHvrFLxa7cR5pTscfrXjk0Vhm5V2PqLUWnH3R5GbPGpMVD7E1ckXesKBQ7AS/vmQ1c0+kHuxpBj98lTCm8pbc5QRJRdZ6qHb/wGryXq3Lxszv+5gySuwvxueXySwYvHEjuQ9ofTGKYlrmK1EsCHMd5SoD7mZ1HHFCBHLNbMEshvrugqWLn01hpVVJhFgVGkDvK7hR6n2B+d9C7xsqWsbkqHv4cCsWezEb+o2SR+SFweUBxfA5wH7kShjKt2vWL57Px3GhIFEezkb8pxvUWHYhotAfCk2AtkEcxoOttrxUWDR5svb1emSQKj0WXK1HYIgFREbiBqmoZcB2RkbE+byMZiosorVgAZF1ID7yQhEs38wa7nUqNDezdlavC2HbBGSQkGgZ8uJVBmzeiKCRRpEa9ilWghORVeGB7BxeSKF5xqbFBkxBrFKUk/JHA7ppENQaCnCjthK+3opCEYyANztXmZN858cDYWSUSHk3A311GAZDvo6deNKUk1EsqnJoQlkYBNlmxQZeaMgmxoUokICoHDce351RCCiuKoirJWEgNOYvQplM2VCLhUqF7jf94rW9kHVUjQeheV4riv0i4ZOzzz/2y/+0KAOAfr4EE4HpCFhwAAAAASUVORK5CYII=",
            }),
            A = L.marker([e.lat, e.long], { icon: r }),
            i = `\n        <h6 class="mb-1">${t}</h6>\n        <p class="m-0 text-body-quaternary">${o}, ${a}</p>\n      `,
            s = L.popup({ minWidth: 180 }).setContent(i);
          return A.bindPopup(s), n.addLayer(A), !0;
        }),
          o.addLayer(n);
        document.body.addEventListener(
          "clickControl",
          ({ detail: { control: e, value: t } }) => {
            "phoenixTheme" === e &&
              a.updateFilter(
                "dark" === t
                  ? [
                      "invert:98%",
                      "grayscale:69%",
                      "bright:89%",
                      "contrast:111%",
                      "hue:205deg",
                      "saturate:1000%",
                    ]
                  : [
                      "bright:101%",
                      "contrast:101%",
                      "hue:23deg",
                      "saturate:225%",
                    ]
              );
          }
        );
      }
    };

  const { docReady: docReady } = window.phoenix.utils;
  (window.revenueMapInit = revenueMapInit),
    docReady(actualCurrentData),
    docReady(actualLightData),
    docReady(topTemperatureChartInit),
    docReady(topCo2ChartInit),
    docReady(topHumidityChartInit),
    docReady(actualDataProximity),
    docReady(dataMapChart);
    
});
//# sourceMappingURL=ecommerce-dashboard.js.map