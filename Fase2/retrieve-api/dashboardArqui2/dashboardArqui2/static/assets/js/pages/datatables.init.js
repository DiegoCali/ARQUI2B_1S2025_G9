$(document).ready(function () {
  var table = $("#basic-datatable").DataTable({
    language: {
      paginate: {
        previous: "<i class='mdi mdi-chevron-left'>",
        next: "<i class='mdi mdi-chevron-right'>",
      },
    },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination-rounded");
    },
  });

  // Función de filtrado personalizada
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    var minDate = $("#actualDate").val();
    var maxDate = $("#finalDate").val();
    var dateColumn = data[6]; // Columna de fecha en el DataTable

    if (!minDate && !maxDate) {
      return true; // No hay filtro aplicado
    }

    var date = new Date(dateColumn);

    if (minDate && date < new Date(minDate)) {
      return false;
    }
    if (maxDate && date > new Date(maxDate)) {
      return false;
    }
    return true;
  });

  // Evento cuando cambian las fechas
  $("#actualDate, #finalDate").on("change", function () {
    table.draw();
  });
});
