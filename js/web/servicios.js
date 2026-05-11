const serviciosGrid = document.querySelector(".services-grid");
const serviciosPaginacion = document.getElementById("serviciosPaginacion");
const servicios = [...document.querySelectorAll(".service-card")];
const SERVICIOS_POR_PAGINA = 6;

let paginaActual = 1;

renderizarServicios();

function renderizarServicios() {
  if (!serviciosGrid || !serviciosPaginacion || servicios.length === 0) return;

  const totalPaginas = Math.ceil(servicios.length / SERVICIOS_POR_PAGINA);
  const inicio = (paginaActual - 1) * SERVICIOS_POR_PAGINA;
  const fin = inicio + SERVICIOS_POR_PAGINA;

  servicios.forEach((servicio, index) => {
    servicio.hidden = index < inicio || index >= fin;
  });

  renderizarPaginacion(totalPaginas);
}

function renderizarPaginacion(totalPaginas) {
  serviciosPaginacion.textContent = "";

  if (totalPaginas <= 1) return;

  serviciosPaginacion.appendChild(
    crearBotonPagina("Anterior", paginaActual - 1, paginaActual === 1, "fa-chevron-left")
  );

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    const boton = crearBotonPagina(String(pagina), pagina);
    if (pagina === paginaActual) {
      boton.classList.add("active");
      boton.setAttribute("aria-current", "page");
    }
    serviciosPaginacion.appendChild(boton);
  }

  serviciosPaginacion.appendChild(
    crearBotonPagina("Siguiente", paginaActual + 1, paginaActual === totalPaginas, "fa-chevron-right")
  );
}

function crearBotonPagina(texto, pagina, disabled = false, icono = "") {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.classList.add("pagination-button");
  boton.disabled = disabled;
  boton.setAttribute("aria-label", texto);

  if (icono) {
    const i = document.createElement("i");
    i.classList.add("fa-solid", icono);
    boton.appendChild(i);
  } else {
    boton.textContent = texto;
  }

  boton.addEventListener("click", () => {
    if (disabled) return;
    paginaActual = pagina;
    renderizarServicios();
    serviciosGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  return boton;
}
