//Variables y Selectores.
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");

let montoUsuario;
let presupuesto;

// Eventos.
eventListeners();

function eventListeners() {
  document.addEventListener("DOMContentLoaded", preguntarPresupuesto);
  formulario.addEventListener("submit", agregarGasto);
}

// Clases.
class Presupuesto {
  constructor(monto) {
    this.presupuesto = Number(monto);
    this.restante = Number(monto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    // Agregar gasto al array de gastos
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
    console.log(this.gastos);
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
    console.log(this.gastos);
    this.calcularRestante();
  }
}

class UI {
  imprimirPresupuesto(monto) {
    const { presupuesto, restante } = monto;

    document.querySelector("#total").textContent = presupuesto;
    document.querySelector("#restante").textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    const divMensaje = document.createElement("DIV");
    divMensaje.classList.add("text-center", "alert");

    if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }

    divMensaje.textContent = mensaje;
    document.querySelector(".primario").insertBefore(divMensaje, formulario);
    setTimeout(() => {
      divMensaje.remove();
    }, 2000);
  }

  imprimirGastos(gastos) {
    this.limpiarHtml();

    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;
      const item = document.createElement("LI");
      item.className =
        "list-group-item d-flex justify-content-between align-items-center";
      // item.setAttribute("data-id", id);
      item.dataset.id = id; // mismo resultado que arriba, uso moderno

      item.innerHTML = `
      ${nombre} <span class="badge badge-primary badge-pill"> $${cantidad} </span>
      `;

      const btnBorrar = document.createElement("button");
      btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
      btnBorrar.innerHTML = `Borrar &times`;
      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };

      item.appendChild(btnBorrar);

      gastoListado.appendChild(item);
    });
  }

  limpiarHtml() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante) {
    document.querySelector("#restante").textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;
    const restanteDiv = document.querySelector(".restante");

    // Comprobar el 25%
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
    }
    // Comprobar el 50%
    else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-danger");
      restanteDiv.classList.add("alert-warning");
    }
    // Comprobar otro caso
    else {
      restanteDiv.classList.remove("alert-warning", "alert-danger");
      restanteDiv.classList.add("alert-success");
    }
    // Comprobar excedente de presupuesto.
    if (restante <= 0) {
      ui.imprimirAlerta("Tu gasto esta excedido", "error");
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

const ui = new UI();

// Funciones.
function preguntarPresupuesto() {
  do {
    montoUsuario = prompt("Ingresa tu monto actual");
  } while (
    montoUsuario <= 0 ||
    montoUsuario === "" ||
    montoUsuario === null ||
    isNaN(montoUsuario)
  );
  // Instanciar la clase presupuesto con el valor ingresado.
  presupuesto = new Presupuesto(montoUsuario);

  // imprimir valores en pantalla.
  ui.imprimirPresupuesto(presupuesto);
}

function agregarGasto(e) {
  e.preventDefault();

  // Leer datos agregados.
  const nombre = document.querySelector("#gasto").value;
  const cantidad = Number(document.querySelector("#cantidad").value);

  // Validar datos ingresados
  if (nombre === "" || cantidad === "") {
    ui.imprimirAlerta("Ambos campos son obligatorios", "error");
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta("Cantidad no válida", "error");
    return;
  } else {
    // crear un objeto gasto con los datos agregados + id.
    const gasto = { nombre, cantidad, id: Date.now() };

    // Agregar gasto.
    presupuesto.nuevoGasto(gasto);

    // Mostrar alerta de exito.
    ui.imprimirAlerta("Datos agregados correctamente");

    // Imprimir gastos al listado.
    const { gastos, restante } = presupuesto;

    ui.imprimirGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    // Reiniciar formulario.
    formulario.reset();
  }
}

function eliminarGasto(id) {
  // Elimimna gasto del objeto
  presupuesto.eliminarGasto(id);

  // actualiza los gastos del HTML
  ui.imprimirGastos(presupuesto.gastos);
  ui.actualizarRestante(presupuesto.restante);
  ui.comprobarPresupuesto(presupuesto);
}
