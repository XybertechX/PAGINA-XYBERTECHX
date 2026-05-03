import { db } from "../firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const productosContainer = document.getElementById("productosContainer");
const buscarProductoPublico = document.getElementById("buscarProductoPublico");

let productos = [];

async function cargarProductos() {
  try {
    const productosSnap = await getDocs(collection(db, "inventario"));

    productos = [];

    productosSnap.forEach((docu) => {
      const producto = docu.data();
      const categoria = String(producto.categoria || "").trim().toLowerCase();

      if (categoria === "soporte") {
        productos.push({
          id: docu.id,
          ...producto
        });
      }
    });

    mostrarProductos(productos);
  } catch (error) {
    console.error("Error cargando productos:", error);
    mostrarMensaje("Error al cargar productos.");
  }
}

function mostrarMensaje(texto) {
  productosContainer.textContent = "";

  const mensaje = document.createElement("p");
  mensaje.classList.add("empty-message");
  mensaje.textContent = texto;

  productosContainer.appendChild(mensaje);
}

function mostrarProductos(lista) {
  productosContainer.textContent = "";

  if (lista.length === 0) {
    mostrarMensaje("No hay productos disponibles.");
    return;
  }

  lista.forEach((producto) => {
    const nombre = producto.nombre || "Producto";
    const categoria = producto.categoria || "Soporte";
    const precio = Number(producto.precio || 0).toFixed(2);
    const stock = Number(producto.stock || 0);
    const mensaje = encodeURIComponent(
      `Hola, quiero información sobre el producto: ${nombre}`
    );

    const card = document.createElement("article");
    card.classList.add("product-public-card");

    const icono = document.createElement("div");
    icono.classList.add("product-public-icon");

    const iconoCaja = document.createElement("i");
    iconoCaja.classList.add("fa-solid", "fa-box");
    icono.appendChild(iconoCaja);

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

    card.append(icono, contenido, precioLabel, enlace);
    productosContainer.appendChild(card);
  });
}

buscarProductoPublico.addEventListener("input", () => {
  const texto = buscarProductoPublico.value.trim().toLowerCase();

  const filtrados = productos.filter((producto) =>
    String(producto.nombre || "").toLowerCase().includes(texto) ||
    String(producto.categoria || "").toLowerCase().includes(texto)
  );

  mostrarProductos(filtrados);
});

cargarProductos();
