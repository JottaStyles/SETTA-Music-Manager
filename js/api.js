// js/api.js - funciones de consumo del backend de SETTA
// Este archivo se puede usar desde login.html, register.html y futuras pantallas.

const API_BASE = 'http://localhost:4000/api';

async function enviarJson(ruta, body) {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición');
  }
  return data;
}

async function registrarUsuario(nombre, correo, contrasena) {
  return enviarJson('/register', { nombre, correo, contrasena });
}

async function iniciarSesion(correo, contrasena) {
  return enviarJson('/login', { correo, contrasena });
}

async function obtenerCanciones() {
  const res = await fetch(`${API_BASE}/songs`);
  if (!res.ok) throw new Error('No se pudieron cargar las canciones');
  return res.json();
}

async function guardarSetBackend(userId, nombre, canciones) {
  const res = await fetch(`${API_BASE}/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, nombre, canciones }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Error al guardar el set');
  return result;
}

async function obtenerSetsBackend(userId) {
  const res = await fetch(`${API_BASE}/sets/${userId}`);
  if (!res.ok) throw new Error('No se pudieron cargar los sets');
  return res.json();
}
