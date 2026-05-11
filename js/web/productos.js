import { db } from "../firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CACHE_KEY = "xybertechx_productos_publicos_v2";
const CACHE_TTL = 5 * 60 * 1000;
const CATEGORIAS_OCULTAS = new Set(["servicio", "servicios"]);

const IMAGENES_LEGADAS_POR_ARCHIVO = {
  "cables sata 2 unidades": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464911/xybertechx/productos/cables-sata-2-unidades.webp",
  "cable ethernet 2m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464906/xybertechx/productos/cable-ethernet-2m.webp",
  "cable hdmi 1.5m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464908/xybertechx/productos/cable-hdmi-1-5m.webp",
  "mando tarvos": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464913/xybertechx/productos/mando-tarvos.webp",
  "base de laptop de aluminio negro": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464781/xybertechx/productos/base-de-laptop-de-aluminio-negro.webp",
  "cable ethernet cat5e 2m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464907/xybertechx/productos/cable-ethernet-cat5e-2m.webp",
  "cable jack a tipo c 1.5m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464909/xybertechx/productos/cable-jack-a-tipo-c-1-5m.webp",
  "cable usb 2.0 para impresora 1.4 m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464910/xybertechx/productos/cable-usb-2-0-para-impresora-1-4-m.webp",
  "multimetro profesional": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464914/xybertechx/productos/multimetro-profesional.webp",
  "set organizador de cables": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464915/xybertechx/productos/set-organizador-de-cables.webp",
  "spy x family": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464916/xybertechx/productos/spy-x-family.webp"
};

const IMAGENES_POR_NOMBRE = {
  "base de laptop de aluminio negro": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464781/xybertechx/productos/base-de-laptop-de-aluminio-negro.webp",
  "cable ethernet 2m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464906/xybertechx/productos/cable-ethernet-2m.webp",
  "cables de internet 2m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464906/xybertechx/productos/cable-ethernet-2m.webp",
  "cable ethernet cat5e 2m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464907/xybertechx/productos/cable-ethernet-cat5e-2m.webp",
  "cable hdmi 1.5m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464908/xybertechx/productos/cable-hdmi-1-5m.webp",
  "cable jack a tipo c 1.5m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464909/xybertechx/productos/cable-jack-a-tipo-c-1-5m.webp",
  "cable sata packs de 2 unidades": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464911/xybertechx/productos/cables-sata-2-unidades.webp",
  "cable usb 2.0 para impresora 1.4 m": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464910/xybertechx/productos/cable-usb-2-0-para-impresora-1-4-m.webp",
  "figura de coleccion spyxfamily bobble hero": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464916/xybertechx/productos/spy-x-family.webp",
  "mando tarvos vsg xbox": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464913/xybertechx/productos/mando-tarvos.webp",
  "multimetro profesional": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464914/xybertechx/productos/multimetro-profesional.webp",
  "set organizador de cables de 36 piezas": "https://res.cloudinary.com/dm64fu9ih/image/upload/v1778464915/xybertechx/productos/set-organizador-de-cables.webp"
};

const productosContainer = document.getElementById("productosContainer");
const buscarProductoPublico = document.getElementById("buscarProductoPublico");
const productosResumen = document.getElementById("productosResumen");
const filterButtons = document.querySelectorAll(".filter-chip");

let productos = [];
let filtroActivo = "todos";
let busquedaTimer;

cargarProductos();

async function cargarProductos() {
  const cache = leerCache();

  if (cache) {
    productos = cache;
    aplicarFiltros();
  }

  try {
    const productosSnap = await getDocs(collection(db, "inventario"));

    productos = productosSnap.docs
      .map((docu) => ({
        id: docu.id,
        ...docu.data()
      }))
      .filter(esProductoPublico)
      .sort((a, b) => {
        const stockA = Number(a.stock || 0);
        const stockB = Number(b.stock || 0);
        return stockB - stockA || String(a.nombre || "").localeCompare(String(b.nombre || ""));
      });

    guardarCache(productos);
    aplicarFiltros();
  } catch (error) {
    console.error("Error cargando productos:", error);

    if (!cache) {
      mostrarMensaje("Error al cargar productos.");
    }
  }
}

function leerCache() {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (!cache || Date.now() - cache.fecha > CACHE_TTL) return null;
    return cache.productos || null;
  } catch {
    return null;
  }
}

function guardarCache(lista) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      fecha: Date.now(),
      productos: lista
    }));
  } catch {
    // El catálogo sigue funcionando aunque el navegador bloquee sessionStorage.
  }
}

function esProductoPublico(producto) {
  const nombre = normalizar(producto.nombre);
  const categoria = normalizar(producto.categoria);

  if (!nombre) return false;
  return !CATEGORIAS_OCULTAS.has(categoria);
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

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function resolverImagenProducto(imagenUrl, nombre) {
  if (imagenUrl && String(imagenUrl).startsWith("https://")) {
    return imagenUrl;
  }

  const archivo = String(imagenUrl || "")
    .split("/")
    .pop()
    .replace(/\.[a-z0-9]+$/i, "");

  return (
    IMAGENES_LEGADAS_POR_ARCHIVO[normalizar(archivo)] ||
    IMAGENES_POR_NOMBRE[normalizar(nombre)] ||
    imagenUrl
  );
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
