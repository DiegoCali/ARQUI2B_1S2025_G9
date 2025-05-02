(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";

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


  // Cliente MQTT
  const client = new Paho.MQTT.Client(
    config.MQTT_BROKER_URL,
    config.MQTT_PORT,
    config.MQTT_CLIENT_ID
  );

  let datosPrediccion = []; // Guardar respuesta

  // 1. Configurar eventos
  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.error("Conexión perdida:", responseObject.errorMessage);
    }
  };

  client.onMessageArrived = (message) => {
    console.log("Mensaje recibido:", message.payloadString);

    try {
      datosPrediccion = JSON.parse(message.payloadString);
      dataResume(); // Al recibir datos, dibuja
      dataLight(); // Al recibir datos, dibuja
      dataCurrent(); // Al recibir datos, dibuja
      dataProximity(); // Al recibir datos, dibuja
      dataCo2(); // Al recibir datos, dibuja
      dataTempHumidity(); // Al recibir datos, dibuja
      dataMapChart(); // Al recibir datos, dibuja
    } catch (e) {
      console.error("Error procesando la respuesta:", e);
    }
  };

  // 2. Conectar al broker
  client.connect({
    useSSL: true,
    onSuccess: () => {
      console.log("Conectado al topic de predicciones");
      client.subscribe(config.MQTT_TOPIC_PREDICTION_RESPONSE);
    },
    onFailure: (error) => {
      console.error("Error de conexión:", error.errorMessage);
    }
  });

  // 3. Escuchar automáticamente cuando escriban en el input
  document.getElementById('idDays').addEventListener('input', () => {
    const diasInput = document.getElementById("idDays").value;
    const dias = parseInt(diasInput);

    if (isNaN(dias) || dias < 1 || dias > 8) {
      console.log("(esperando un número entre 1-8 para enviar)");
      return;
    }

    const payload = {
      dias: dias
    };

    const message = new Paho.MQTT.Message(JSON.stringify(payload));
    message.destinationName = config.MQTT_TOPIC_PREDICTION_REQUEST;
    client.send(message);

    console.log("Mensaje enviado automáticamente:", JSON.stringify(payload));
  });

  // 4. Función para graficar los datos
  const dataResume = () => {
    const { getColor: e, getData: t, toggleColor: a } = window.phoenix.utils;
    const container = document.querySelector(".echart-contact-by-source-container");
    const chartElement = container.querySelector(".echart-contact-by-source");
    const labelTotal = container.querySelector("[data-label]");
  
    if (chartElement && datosPrediccion.length > 0) {
      const options = t(chartElement, "echarts");
      const chart = window.echarts.init(chartElement);
  
      // ✨ Obtener el último día de los datos recibidos
      const ultimoDia = datosPrediccion[datosPrediccion.length - 1];
  
      const datos = [
        { value: ultimoDia.current, name: "Corriente" },
        { value: ultimoDia.co2, name: "Co2" },
        { value: ultimoDia.humidity, name: "Humedad" },
        { value: ultimoDia.temperature, name: "Temperatura" },
        { value: ultimoDia.light, name: "Luz Ambiente" },
        { value: ultimoDia.distance, name: "Proximidad" },
      ];

      document.getElementById("valueCurrent").textContent = ultimoDia.current;
      document.getElementById("valueCo2").textContent = ultimoDia.co2;
      document.getElementById("valueHumidity").textContent = ultimoDia.humidity;
      document.getElementById("valueTemperature").textContent = ultimoDia.temperature;
      document.getElementById("valueLight").textContent = ultimoDia.light;
      document.getElementById("valueProximity").textContent = ultimoDia.distance;
  
      const total = datos.reduce((sum, dato) => sum + dato.value, 0);
      if (labelTotal) labelTotal.innerHTML = total.toFixed(2);
  
      echartSetOption(chart, options, () => ({
        color: [
          e("primary"),
          e("success"),
          e("info"),
          e("info-light"),
          a(e("danger-lighter"), e("danger-darker")),
          a(e("warning-light"), e("warning-dark")),
        ],
        tooltip: {
          trigger: "item",
          borderWidth: 0,
          position: (...e) => handleTooltipPosition(e),
          extraCssText: "z-index: 1000",
        },
        responsive: true,
        maintainAspectRatio: false,
        series: [
          {
            name: "Resumen de predicciones",
            type: "pie",
            radius: ["55%", "90%"],
            startAngle: 90,
            avoidLabelOverlap: false,
            itemStyle: { borderColor: e("body-bg"), borderWidth: 3 },
            label: { show: false },
            emphasis: { label: { show: false } },
            labelLine: { show: false },
            data: datos,
          }
        ],
        grid: { bottom: 0, top: 0, left: 0, right: 0, containLabel: false },
      }));
    }
  };
  


  const dataLight = () => {
    const { getColor: t, getData: o } = window.phoenix.utils;
    const i = document.querySelector(".echart-contacts-created");
  
    if (i && datosPrediccion.length > 0) {
      const options = o(i, "echarts");
      const chart = window.echarts.init(i);
  
      //  Generar etiquetas tipo Día 1, Día 2, Día 3...
      const fechas = datosPrediccion.map((dato, index) => `Día ${index + 1}`);
  
      const primerDia = datosPrediccion[0];
      
      //  luzPrimerDia ahora REPITE el mismo valor en todos los días
      const luzPrimerDia = new Array(datosPrediccion.length).fill(primerDia.light);
  
      //  luzAmbiente proyectada real
      const luzAmbiente = datosPrediccion.map(dato => dato.light);
  
      echartSetOption(
        chart,
        options,
        () => ({
          color: [t("tertiary-bg"), t("primary")],
          tooltip: {
            trigger: "axis",
            padding: [7, 10],
            backgroundColor: t("body-highlight-bg"),
            borderColor: t("border-color"),
            textStyle: { color: t("light-text-emphasis") },
            borderWidth: 1,
            transitionDuration: 0,
            axisPointer: { type: "shadow" },
            formatter: (tooltipItems) => {
              return tooltipItems
                .map(item => `<div><strong>${item.seriesName}:</strong> ${item.data}</div>`)
                .join("");
            },
            extraCssText: "z-index: 1000",
          },
          xAxis: {
            type: "category",
            data: fechas,
            axisLabel: {
              color: t("secondary-color"),
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 10.24,
            },
            splitLine: {
              show: true,
              lineStyle: { color: t("tertiary-bg") },
            },
            axisLine: { lineStyle: { color: t("tertiary-bg") } },
            axisTick: false,
          },
          yAxis: {
            position: "right",
            splitLine: { lineStyle: { color: t("secondary-bg") } },
            axisLine: { show: false },
            axisLabel: {
              fontFamily: "Nunito Sans",
              fontWeight: 700,
              fontSize: 12.8,
              color: t("body-color"),
              margin: 20,
              formatter: (value) => `${value}`,
            },
          },
          series: [
            {
              name: "Luz ambiente 1",
              type: "bar",
              data: luzPrimerDia, // mismo valor primer día replicado
              barWidth: "20px",
              label: {
                show: true,
                position: "top",
                color: t("body-color"),
                fontWeight: "bold",
                fontSize: "10.24px",
              },
              itemStyle: {
                borderRadius: [2, 2, 0, 0],
                color: t("tertiary-bg"),
              },
              z: 10,
            },
            {
              name: "Luz ambiente proyectada",
              type: "bar",
              data: luzAmbiente,
              barWidth: "20px",
              label: {
                show: true,
                position: "top",
                color: t("primary"),
                fontWeight: "bold",
                fontSize: "10.24px",
              },
              itemStyle: {
                borderRadius: [2, 2, 0, 0],
                color: t("primary"),
              },
            },
          ],
          grid: { right: 3, left: 6, bottom: 0, top: "5%", containLabel: true },
          animation: false,
        }),
        { xs: { series: [{ label: { show: false } }, { label: { show: false } }] } }
      );
    }
  };
  
  
  
  const dataCurrent = () => {
    const {
      getColor: o,
      getData: t,
      rgbaColor: a,
    } = window.phoenix.utils;
  
    const r = document.querySelector(".echarts-new-users");
  
    if (r && datosPrediccion.length > 0) {
      const s = t(r, "echarts");
      const n = window.echarts.init(r);
  
      //  Fechas dinámicas: Día 1, Día 2, Día 3, etc.
      const fechas = datosPrediccion.map((dato, index) => `Día ${index + 1}`);
  
      //  Valores de corriente de cada día
      const corriente = datosPrediccion.map(dato => dato.current);
  
      document.getElementById("valueCurrent2").textContent = corriente[corriente.length - 1];

      document.getElementById("incrementCurrent").textContent = Math.round((corriente[corriente.length - 1] - corriente[0]) * 100) / 100 ;
      echartSetOption(n, s, () => ({
        tooltip: {
          trigger: "axis",
          padding: 10,
          backgroundColor: o("body-highlight-bg"),
          borderColor: o("border-color"),
          textStyle: { color: o("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          formatter: (tooltipItems) => {
            return tooltipItems
              .map(item => `<div><strong>${item.name}:</strong> ${item.data}</div>`)
              .join("");
          },
          extraCssText: "z-index: 1000",
        },
        xAxis: [
          {
            type: "category",
            data: fechas,
            show: true,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              formatter: (value) => value,
              showMinLabel: true,
              showMaxLabel: true,
              color: o("secondary-color"),
              align: "center",
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
          }
        ],
        yAxis: { 
          type: "value",
          boundaryGap: false,
          show: false,
          axisLabel: {
            fontFamily: "Nunito Sans",
            fontWeight: 700,
            fontSize: 12.8,
            color: o("body-color"),
            formatter: (value) => `${value}`,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: o("secondary-bg") } },
        },
        series: [
          {
            name: "Corriente",
            type: "line",
            data: corriente,
            lineStyle: { width: 2, color: o("info") },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: a(o("info"), 0.2) },
                  { offset: 1, color: a(o("info"), 0) },
                ],
              },
            },
            showSymbol: true,
            symbol: "circle",
            symbolSize: 5,
            zlevel: 1,
          }
        ],
        grid: { left: 10, right: 10, top: 5, bottom: 20, containLabel: true },
      }));
    }
  };
  

 
  const dataProximity = () => {
    const {
      getColor: o,
      getData: t,
      rgbaColor: e,
    } = window.phoenix.utils;
  
    const r = document.querySelector(".echarts-new-leads");
  
    if (r && datosPrediccion.length > 0) {
      const s = t(r, "echarts");
      const l = window.echarts.init(r);
  
      //  Fechas dinámicas: Día 1, Día 2, Día 3, ...
      const fechas = datosPrediccion.map((dato, index) => `Día ${index + 1}`);
  
      //  Valores de proximidad de cada día
      const proximidad = datosPrediccion.map(dato => dato.distance);
  
      document.getElementById("valueProximity2").textContent = proximidad[proximidad.length - 1];
      document.getElementById("incrementProximity").textContent = Math.round((proximidad[proximidad.length - 1] - proximidad[0]) * 100) / 100 ;

      echartSetOption(l, s, () => ({
        tooltip: {
          trigger: "axis",
          padding: 10,
          backgroundColor: o("body-highlight-bg"),
          borderColor: o("border-color"),
          textStyle: { color: o("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          formatter: (tooltipItems) => {
            return tooltipItems
              .map(item => `<div><strong>${item.name}:</strong> ${item.data}</div>`)
              .join("");
          },
          extraCssText: "z-index: 1000",
        },
        xAxis: [
          {
            type: "category",
            data: fechas,
            show: true,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              formatter: (value) => value,
              showMinLabel: true,
              showMaxLabel: true,
              color: o("secondary-color"),
              align: "center",
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
          }
        ],
        yAxis: {
          type: "value",
          boundaryGap: false,
          show: false,
          axisLabel: {
            fontFamily: "Nunito Sans",
            fontWeight: 700,
            fontSize: 12.8,
            color: o("body-color"),
            formatter: (value) => `${value}`,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: o("secondary-bg") } },
        },
        series: [
          {
            name: "Proximidad",
            type: "line",
            data: proximidad,
            lineStyle: { width: 2, color: o("primary") },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: e(o("primary"), 0.2) },
                  { offset: 1, color: e(o("primary"), 0) },
                ],
              },
            },
            showSymbol: true,
            symbol: "circle",
            symbolSize: 5,
            zlevel: 1,
          }
        ],
        grid: { left: 10, right: 10, top: 5, bottom: 20, containLabel: true },
      }));
    }
  };
  

  const dataTempHumidity = () => {
    const {
      getColor: t,
      getData: a,
      rgbaColor: e,
    } = window.phoenix.utils;
  
    const r = document.querySelector(".echart-add-clicks-chart");
  
    if (r && datosPrediccion.length > 0) {
      const s = a(r, "echarts");
      const l = window.echarts.init(r);
  
      // 🔥 Fechas dinámicas: Día 1, Día 2, Día 3, ...
      const fechas = datosPrediccion.map((dato, index) => `Día ${index + 1}`);
  
      // 🔥 Datos de temperatura y humedad de cada día
      const temperatura = datosPrediccion.map(dato => dato.temperature);
      const humedad = datosPrediccion.map(dato => dato.humidity);
  
      echartSetOption(l, s, () => ({
        tooltip: {
          trigger: "axis",
          padding: 10,
          backgroundColor: t("body-highlight-bg"),
          borderColor: t("border-color"),
          textStyle: { color: t("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          formatter: (tooltipItems) => {
            return tooltipItems
              .map(item => `<div><strong>${item.name}:</strong> ${item.data}</div>`)
              .join("");
          },
          extraCssText: "z-index: 1000",
        },
        xAxis: [
          {
            type: "category",
            data: fechas,
            show: true,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              formatter: (value) => value,
              showMinLabel: true,
              showMaxLabel: true,
              color: t("secondary-color"),
              align: "center",
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
          }
        ],
        yAxis: {
          type: "value",
          boundaryGap: false,
          axisLabel: {
            fontFamily: "Nunito Sans",
            fontWeight: 700,
            fontSize: 12.8,
            color: t("body-color"),
            formatter: (value) => `${value}`,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: t("secondary-bg") } },
        },
        series: [
          {
            name: "Temperatura",
            type: "line",
            data: temperatura,
            lineStyle: { width: 3, color: t("info-lighter") },
            showSymbol: true,
            symbol: "circle",
            symbolSize: 8,
            itemStyle: { color: t("info-lighter"), borderWidth: 3 },
            zlevel: 2,
          },
          {
            name: "Humedad",
            type: "line",
            data: humedad,
            lineStyle: { width: 3, color: t("primary") },
            showSymbol: true,
            symbol: "circle",
            symbolSize: 8,
            itemStyle: { color: t("primary"), borderWidth: 3 },
            zlevel: 1,
          }
        ],
        grid: { right: 10, left: 10, bottom: 20, top: 5, containLabel: true },
        animation: false,
      }));
    }
  };
  


  const dataCo2 = () => {
    const {
      getColor: o,
      getData: a,
      rgbaColor: e,
    } = window.phoenix.utils;
  
    const r = document.querySelector(".echart-call-campaign");
  
    if (r && datosPrediccion.length > 0) {
      const s = a(r, "echarts");
      const l = window.echarts.init(r);
  
      // 🔥 Fechas dinámicas: Día 1, Día 2, Día 3, ...
      const fechas = datosPrediccion.map((dato, index) => `Día ${index + 1}`);
  
      // 🔥 Valores de CO2 de cada día
      const co2 = datosPrediccion.map(dato => dato.co2);
  
      echartSetOption(l, s, () => ({
        tooltip: {
          trigger: "axis",
          padding: 10,
          backgroundColor: o("body-highlight-bg"),
          borderColor: o("border-color"),
          textStyle: { color: o("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          formatter: (tooltipItems) => {
            return tooltipItems
              .map(item => `<div><strong>${item.name}:</strong> ${item.data}</div>`)
              .join("");
          },
          extraCssText: "z-index: 1000",
        },
        xAxis: [
          {
            type: "category",
            data: fechas,
            show: true,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              formatter: (value) => value,
              showMinLabel: true,
              showMaxLabel: true,
              color: o("secondary-color"),
              align: "center",
              fontFamily: "Nunito Sans",
              fontWeight: 600,
              fontSize: 12.8,
            },
          }
        ],
        yAxis: {
          type: "value",
          boundaryGap: false,
          axisLabel: {
            fontFamily: "Nunito Sans",
            fontWeight: 700,
            fontSize: 12.8,
            color: o("body-color"),
            formatter: (value) => `${value}`,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: o("secondary-bg") } },
        },
        series: [
          {
            name: "Nivel de CO2",
            type: "line",
            data: co2,
            lineStyle: { width: 2, color: o("primary") },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: e(o("primary-light"), 0.2) },
                  { offset: 1, color: e(o("primary-light"), 0.2) },
                ],
              },
            },
            showSymbol: true,  // Mostrar los puntos
            symbol: "circle", // Forma de los puntos
            symbolSize: 8,    // Tamaño de los círculos
            itemStyle: {
              color: o("primary"), // Color del círculo
              borderColor: o("body-highlight-bg"),
              borderWidth: 2,  // Bordes del círculo
            },
            zlevel: 1,
          }
        ],
        grid: { left: 10, right: 10, top: 5, bottom: 20, containLabel: true },
      }));
    }
  };
  
  

  const dataMapChart = () => {
    const {
      getColor: t,
      getData: o,
      rgbaColor: a,
      getRandomNumber: e,
    } = window.phoenix.utils;
  
    const r = document.querySelector(".echart-heatmap-chart-example");
  
    // Datos de las horas (X) y los días de la semana (Y)
    const horas = [
      "12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"
    ];
  
    const dias = [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];
  
    // Recopilar los datos de la predicción (temperatura o humedad)
    const heatmapData = [];
    for (let t = 0; t < 7; t++) {
      for (let o = 0; o < 12; o++) {
        // Aquí debes seleccionar el valor de 'co2', 'temperature', 'humidity', etc.
        const value = datosPrediccion[o % datosPrediccion.length].temperature; // O cualquier otro valor
        heatmapData.push([o, t, value]);
      }
    }
  
    if (r) {
      const e = o(r, "echarts"),
        n = window.echarts.init(r);
  
      // Generamos el mapa de calor
      echartSetOption(n, e, () => ({
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
            formatter: (t) => t.substring(0, 3), // Abreviar los días
            color: t("quaternary-color"),
          },
          splitArea: { show: true },
          axisLine: { show: true, lineStyle: { color: t("quaternary-color") } },
        },
        visualMap: {
          min: 0,
          max: 30, // Ajustar según los valores de tu dataset (temperature, humidity, etc.)
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "0%",
          textStyle: { color: t("tertiary-color"), fontWeight: 500 },
          inRange: {
            color: [a(t("primary"), 1), a(t("info"), 1), a(t("success"), 1)],
          },
        },
        series: [
          {
            type: "heatmap",
            data: heatmapData, // Datos dinámicos de la predicción
            label: { show: true },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowColor: a(t("black"), 0.5) },
            },
          },
        ],
      }));
    }
  };
  
 


  const echartsRevenueTargetInit = () => {
    const { getColor: e, getData: t } = window.phoenix.utils,
      o = document.querySelector(".echart-revenue-target-conversion"),
      a = [42e3, 35e3, 35e3, 4e4],
      r = [30644, 33644, 28644, 38644];
    if (o) {
      const i = t(o, "echarts"),
        n = window.echarts.init(o);
      echartSetOption(n, i, () => ({
        color: [e("primary"), e("tertiary-bg")],
        tooltip: {
          trigger: "axis",
          padding: [7, 10],
          backgroundColor: e("body-highlight-bg"),
          borderColor: e("border-color"),
          textStyle: { color: e("light-text-emphasis") },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: { type: "none" },
          formatter: (e) =>
            ((e = "MMM DD") => {
              let t = "";
              return (
                e.forEach((e) => {
                  t += `<div class='ms-1'>\n          <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10" style="color:${
                    e.color
                  }"></span>\n            ${
                    e.seriesName
                  } : $${e.value.toLocaleString()}\n          </h6>\n        </div>`;
                }),
                `<div>\n              <p class='mb-2 text-body-tertiary'>\n                ${e[0].axisValue}\n              </p>\n              ${t}\n            </div>`
              );
            })(e),
          extraCssText: "z-index: 1000",
        },
        xAxis: {
          type: "value",
          axisLabel: {
            show: !0,
            interval: 3,
            showMinLabel: !0,
            showMaxLabel: !1,
            color: e("quaternary-color"),
            align: "left",
            fontFamily: "Nunito Sans",
            fontWeight: 400,
            fontSize: 12.8,
            margin: 10,
            formatter: (e) => e / 1e3 + "k",
          },
          show: !0,
          axisLine: { lineStyle: { color: e("tertiary-bg") } },
          axisTick: !1,
          splitLine: { show: !1 },
        },
        yAxis: {
          data: ["Luxemburg", "Canada", "Australia", "India"],
          type: "category",
          axisPointer: { type: "none" },
          axisTick: "none",
          splitLine: { interval: 5, lineStyle: { color: e("secondary-bg") } },
          axisLine: { show: !1 },
          axisLabel: { show: !0, margin: 21, color: e("body-color") },
        },
        series: [
          {
            name: "Target",
            type: "bar",
            label: { show: !1 },
            emphasis: { disabled: !0 },
            showBackground: !0,
            backgroundStyle: { color: e("body-highlight-bg") },
            barWidth: "30px",
            barGap: "-100%",
            data: a,
            itemStyle: {
              borderWidth: 4,
              color: e("secondary-bg"),
              borderColor: e("secondary-bg"),
            },
          },
          {
            name: "Gained",
            type: "bar",
            emphasis: { disabled: !0 },
            label: {
              show: !0,
              color: e("white"),
              fontWeight: 700,
              fontFamily: "Nunito Sans",
              fontSize: 12.8,
              formatter: (e) => `$${e.value.toLocaleString()}`,
            },
            backgroundStyle: { color: e("body-highlight-bg") },
            barWidth: "30px",
            data: r,
            itemStyle: {
              borderWidth: 4,
              color: e("primary-light"),
              borderColor: e("secondary-bg"),
            },
          },
        ],
        grid: { right: 0, left: 0, bottom: 8, top: 0, containLabel: !0 },
        animation: !1,
      }));
    }
  };

  const { docReady: docReady } = window.phoenix.utils;
  docReady(dataResume),
    docReady(dataLight),
    docReady(dataCurrent),
    docReady(dataProximity),
    docReady(dataTempHumidity),
    docReady(dataMapChart);
});
//# sourceMappingURL=crm-dashboard.js.map
