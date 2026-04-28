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
    productosContainer.innerHTML = `
      <p class="empty-message">Error al cargar productos.</p>
    `;
  }
}

function mostrarProductos(lista) {
  productosContainer.innerHTML = "";

  if (lista.length === 0) {
    productosContainer.innerHTML = `
      <p class="empty-message">No hay productos disponibles.</p>
    `;
    return;
  }

  lista.forEach((producto) => {
    const nombre = producto.nombre || "Producto";
    const precio = Number(producto.precio || 0).toFixed(2);
    const stock = Number(producto.stock || 0);

    const mensaje = encodeURIComponent(
      `Hola, quiero información sobre el producto: ${nombre}`
    );

    const card = document.createElement("article");
    card.classList.add("product-public-card");

    card.innerHTML = `
      <div class="product-public-icon">
        <i class="fa-solid fa-box"></i>
      </div>

      <div>
        <h3>${nombre}</h3>
        <p>Categoría: ${producto.categoria || "Soporte"}</p>
        <span class="${stock > 0 ? "stock-ok" : "stock-out"}">
          ${stock > 0 ? `Disponible: ${stock}` : "Sin stock"}
        </span>
      </div>

      <strong>S/${precio}</strong>

      <a href="https://wa.me/51973518710?text=${mensaje}" target="_blank">
        Consultar
      </a>
    `;

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