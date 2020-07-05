// Utilizando ES6

// Importando axios
import axios from "axios";

// Importando sweetalert para mostrar mensajes
import Swal from "sweetalert2";

// Obtener el nombre del boton para eliminar lecciones con DOM
const btnEliminarLeccion = document.querySelector("#eliminar-leccion");

// agregar evento
btnEliminarLeccion.addEventListener("click", (e) => {
  // capturar id de la leccion
  const idLeccion = e.target.dataset.leccionId;
  console.log(idLeccion);
  Swal.fire({
    title: "Estas seguro que deseas eliminar esta leccion?",
    text: "Si eliminas esta leccion no sera posible recuperarla!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Eliminar lección",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.value) {
      const url = `${location.origin}/leccion/${idLeccion}`;
      console.log(url);

      // implementar axios
      axios
        .delete(url, { params: { id: idLeccion } })
        .then(function (response) {
          Swal.fire("Eliminado!", "La leccion se ha eliminado.", "success");
        })
        .catch(() => {
          Swal.fire("Error!");
        });
    }
  });
});
