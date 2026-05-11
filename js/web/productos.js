import {
  normalizar,
  obtenerProductosPublicos,
  resolverImagenProducto
} from "./catalogo.js";

const productosContainer = document.getElementById("productosContainer");
const buscarProductoPublico = document.getElementById("buscarProductoPublico");
const productosResumen = document.getElementById("productosResumen");
const productosPaginacion = document.getElementById("productosPaginacion");
const filterButtons = document.querySelectorAll(".filter-chip");
const PRODUCTOS_POR_PAGINA = 12;

let productos = [];
let filtroActivo = "todos";
let paginaActual = 1;
let busquedaTimer;

cargarProductos();

async function cargarProductos() {
  try {
    productos = await obtenerProductosPublicos();
    aplicarFiltros();
  } catch (error) {
    console.error("Error cargando productos:", error);
    mostrarMensaje("Error al cargar productos.");
  }
}

function aplicarFiltros() {
  const texto = normalizar(buscarProductoPublico.value);

  const filtrados = productos.filter((producto) => {
    const stock = Number(producto.stock || 0);
    const coincideFiltro =
      filtroActivo === "todos" ||
      (filtroActivo === "disponibles" && stock > 0) ||
      (filtroActivo === "sin-stock" && stock <= 0);

    if (!coincideFiltro) return false;
    if (!texto) return true;

    const textoProducto = normalizar([
      producto.nombre,
      producto.categoria,
      producto.descripcion,
      producto.marca,
      producto.modelo,
      producto.tags
    ].join(" "));

    return textoProducto.includes(texto);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA));
  paginaActual = Math.min(paginaActual, totalPaginas);
  mostrarProductos(filtrados);
}

function mostrarMensaje(texto) {
  productosContainer.textContent = "";

  const mensaje = document.createElement("p");
  mensaje.classList.add("empty-message");
  mensaje.textContent = texto;

  productosContainer.appendChild(mensaje);
  productosResumen.textContent = texto;
  productosPaginacion.textContent = "";
}

function mostrarProductos(lista) {
  productosContainer.textContent = "";

  if (lista.length === 0) {
    mostrarMensaje("No hay productos que coincidan con tu búsqueda.");
    return;
  }

  const totalPaginas = Math.ceil(lista.length / PRODUCTOS_POR_PAGINA);
  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const fin = inicio + PRODUCTOS_POR_PAGINA;
  const visibles = lista.slice(inicio, fin);
  const desde = inicio + 1;
  const hasta = Math.min(fin, lista.length);

  productosResumen.textContent =
    `${desde}-${hasta} de ${lista.length} producto${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}.`;

  const fragment = document.createDocumentFragment();

  visibles.forEach((producto, index) => {
    fragment.appendChild(crearTarjetaProducto(producto, index));
  });

  productosContainer.appendChild(fragment);
  renderizarPaginacion(totalPaginas);
}

function crearTarjetaProducto(producto, index) {
  const nombre = producto.nombre || "Producto";
  const categoria = producto.categoria || "Producto";
  const precio = Number(producto.precio || 0).toFixed(2);
  const stock = Number(producto.stock || 0);
  const mensaje = encodeURIComponent(
    `Hola, quiero información sobre el producto: ${nombre}`
  );

  const card = document.createElement("article");
  card.classList.add("product-public-card");

  const media = crearMediaProducto(producto.imagenUrl, nombre, index);
  const contenido = document.createElement("div");

  const titulo = document.createElement("h3");
  titulo.textContent = nombre;

  const descripcion = document.createElement("p");
  descripcion.textContent = `Categoría: ${categoria}`;

  const stockLabel = document.createElement("span");
  stockLabel.classList.add(stock > 0 ? "stock-ok" : "stock-out");
  stockLabel.textContent = stock > 0 ? `Disponible: ${stock}` : "Sin stock";

  contenido.append(titulo, descripcion, stockLabel);

  const precioLabel = document.createElement("strong");
  precioLabel.textContent = `S/${precio}`;

  const enlace = document.createElement("a");
  enlace.href = `https://wa.me/51973518710?text=${mensaje}`;
  enlace.target = "_blank";
  enlace.rel = "noopener";
  enlace.textContent = "Consultar";

  card.append(media, contenido, precioLabel, enlace);
  return card;
}

function crearMediaProducto(imagenUrl, nombre, index) {
  const imagenOptimizada = resolverImagenProducto(imagenUrl, nombre);

  if (imagenOptimizada) {
    const imagen = document.createElement("img");
    imagen.classList.add("product-public-image");
    imagen.src = imagenOptimizada;
    imagen.alt = nombre;
    imagen.decoding = "async";
    imagen.loading = index < 4 ? "eager" : "lazy";
    return imagen;
  }

  const icono = document.createElement("div");
  icono.classList.add("product-public-icon");

  const iconoCaja = document.createElement("i");
  iconoCaja.classList.add("fa-solid", "fa-box");
  icono.appendChild(iconoCaja);

  return icono;
}

function renderizarPaginacion(totalPaginas) {
  productosPaginacion.textContent = "";

  if (totalPaginas <= 1) return;

  const anterior = crearBotonPagina("Anterior", paginaActual - 1, paginaActual === 1, "fa-chevron-left");
  productosPaginacion.appendChild(anterior);

  paginasVisibles(totalPaginas).forEach((pagina) => {
    if (pagina === "...") {
      const separador = document.createElement("span");
      separador.classList.add("pagination-ellipsis");
      separador.textContent = "...";
      productosPaginacion.appendChild(separador);
      return;
    }

    const boton = crearBotonPagina(String(pagina), pagina, false);
    if (pagina === paginaActual) {
      boton.classList.add("active");
      boton.setAttribute("aria-current", "page");
    }
    productosPaginacion.appendChild(boton);
  });

  const siguiente = crearBotonPagina("Siguiente", paginaActual + 1, paginaActual === totalPaginas, "fa-chevron-right");
  productosPaginacion.appendChild(siguiente);
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
    aplicarFiltros();
    productosContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  return boton;
}

function paginasVisibles(totalPaginas) {
  if (totalPaginas <= 5) {
    return Array.from({ length: totalPaginas }, (_, index) => index + 1);
  }

  const paginas = new Set([1, totalPaginas, paginaActual - 1, paginaActual, paginaActual + 1]);
  const ordenadas = [...paginas]
    .filter((pagina) => pagina >= 1 && pagina <= totalPaginas)
    .sort((a, b) => a - b);

  return ordenadas.flatMap((pagina, index) => {
    const anterior = ordenadas[index - 1];
    if (index > 0 && pagina - anterior > 1) {
      return ["...", pagina];
    }
    return [pagina];
  });
}

buscarProductoPublico.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => {
    paginaActual = 1;
    aplicarFiltros();
  }, 120);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filtroActivo = button.dataset.filter;
    paginaActual = 1;
    aplicarFiltros();
  });
});
