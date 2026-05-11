import {
  obtenerProductosPublicos,
  resolverImagenProducto
} from "./catalogo.js";

const destacadosContainer = document.getElementById("productosDestacadosInicio");

cargarDestacados();

async function cargarDestacados() {
  if (!destacadosContainer) return;

  try {
    const productos = await obtenerProductosPublicos();
    const destacados = productos
      .filter((producto) => Number(producto.stock || 0) > 0)
      .slice(0, 3);

    if (destacados.length === 0) {
      mostrarMensaje("Por ahora no hay productos disponibles.");
      return;
    }

    destacadosContainer.textContent = "";
    const fragment = document.createDocumentFragment();

    destacados.forEach((producto, index) => {
      fragment.appendChild(crearProductoDestacado(producto, index));
    });

    destacadosContainer.appendChild(fragment);
  } catch (error) {
    console.error("Error cargando productos destacados:", error);
    mostrarMensaje("No pudimos cargar los productos destacados.");
  }
}

function crearProductoDestacado(producto, index) {
  const nombre = producto.nombre || "Producto";
  const categoria = producto.categoria || "Producto";
  const precio = Number(producto.precio || 0).toFixed(2);
  const imagenUrl = resolverImagenProducto(producto.imagenUrl, nombre);

  const article = document.createElement("article");

  if (imagenUrl) {
    const imagen = document.createElement("img");
    imagen.src = imagenUrl;
    imagen.alt = nombre;
    imagen.decoding = "async";
    imagen.loading = index === 0 ? "eager" : "lazy";
    article.appendChild(imagen);
  }

  const contenido = document.createElement("div");

  const titulo = document.createElement("h3");
  titulo.textContent = nombre;

  const descripcion = document.createElement("p");
  descripcion.textContent = categoria;

  const precioLabel = document.createElement("strong");
  precioLabel.textContent = `S/${precio}`;

  contenido.append(titulo, descripcion, precioLabel);
  article.appendChild(contenido);

  return article;
}

function mostrarMensaje(texto) {
  destacadosContainer.textContent = "";

  const mensaje = document.createElement("p");
  mensaje.classList.add("empty-message");
  mensaje.textContent = texto;
  destacadosContainer.appendChild(mensaje);
}
