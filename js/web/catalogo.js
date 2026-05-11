import { db } from "../firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const CACHE_KEY = "xybertechx_productos_publicos_v3";
export const CACHE_TTL = 5 * 60 * 1000;
export const CATEGORIAS_OCULTAS = new Set(["servicio", "servicios"]);

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

export async function obtenerProductosPublicos({ usarCache = true } = {}) {
  const cache = usarCache ? leerCache() : null;
  if (cache) return cache;

  const productosSnap = await getDocs(collection(db, "inventario"));
  const productos = productosSnap.docs
    .map((docu) => ({
      id: docu.id,
      ...docu.data()
    }))
    .filter(esProductoPublico)
    .sort(ordenarProductos);

  guardarCache(productos);
  return productos;
}

export function esProductoPublico(producto) {
  const nombre = normalizar(producto.nombre);
  const categoria = normalizar(producto.categoria);

  if (!nombre) return false;
  return !CATEGORIAS_OCULTAS.has(categoria);
}

export function ordenarProductos(a, b) {
  const stockA = Number(a.stock || 0);
  const stockB = Number(b.stock || 0);
  return stockB - stockA || String(a.nombre || "").localeCompare(String(b.nombre || ""));
}

export function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolverImagenProducto(imagenUrl, nombre) {
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

export function leerCache() {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (!cache || Date.now() - cache.fecha > CACHE_TTL) return null;
    return cache.productos || null;
  } catch {
    return null;
  }
}

export function guardarCache(lista) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      fecha: Date.now(),
      productos: lista
    }));
  } catch {
    // El catálogo sigue funcionando aunque el navegador bloquee sessionStorage.
  }
}
