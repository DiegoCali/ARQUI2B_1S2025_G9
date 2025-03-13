document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "http://127.0.0.1:8000/all-data/"; // Asegúrate de que la API esté corriendo

  async function fetchData() {
      try {
          const response = await fetch(API_URL);
          if (!response.ok) throw new Error("Error al obtener los datos");

          const data = await response.json();
          return data;
      } catch (error) {
          console.error("Error en fetch:", error);
          return [];
      }
  }

  async function populateTable() {
      const data = await fetchData();
      
      // Verifica si hay datos
      if (data.length === 0) {
          console.warn("No hay datos disponibles en la API.");
          return;
      }

      // Inicializar DataTable con los datos obtenidos
      $("#basic-datatable").DataTable({
          data: data, // Usar los datos de la API
          columns: [
              { data: "distance", title: "Distancia" },
              { data: "co2", title: "CO2" },
              { data: "temperature", title: "Temperatura" },
              { data: "humidity", title: "Humedad" },
              { data: "light", title: "Luz" },
              { data: "current", title: "Corriente" },
              { 
                  data: "date_time", 
                  title: "Fecha",
                  render: function(data) {
                      return new Date(data).toLocaleString(); // Formatear fecha
                  }
              }
          ],
          responsive: true,
          paging: true, // Activar paginación
          searching: true, // Habilitar búsqueda
          ordering: true, // Habilitar ordenación
          destroy: true // Asegurar que DataTables se reinicializa correctamente
      });
  }

  // Cargar datos solo una vez al cargar la página
  await populateTable();
});
