import {
  normalizar,
  obtenerProductosPublicos,
  resolverImagenProducto
} from "./catalogo.js";

const productosContainer = document.getElementById("productosContainer");
const buscarProductoPublico = document.getElementById("buscarProductoPublico");
const productosResumen = document.getElementById("productosResumen");
const filterButtons = document.querySelectorAll(".filter-chip");

let productos = [];
let filtroActivo = "todos";
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

  mostrarProductos(filtrados);
}

function mostrarMensaje(texto) {
  productosContainer.textContent = "";

  const mensaje = document.createElement("p");
  mensaje.classList.add("empty-message");
  mensaje.textContent = texto;

  productosContainer.appendChild(mensaje);
  productosResumen.textContent = texto;
}

function mostrarProductos(lista) {
  productosContainer.textContent = "";

  if (lista.length === 0) {
    mostrarMensaje("No hay productos que coincidan con tu búsqueda.");
    return;
  }

  productosResumen.textContent = `${lista.length} producto${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}.`;

  const fragment = document.createDocumentFragment();

  lista.forEach((producto, index) => {
    fragment.appendChild(crearTarjetaProducto(producto, index));
  });

  productosContainer.appendChild(fragment);
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

buscarProductoPublico.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(aplicarFiltros, 120);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filtroActivo = button.dataset.filter;
    aplicarFiltros();
  });
});
