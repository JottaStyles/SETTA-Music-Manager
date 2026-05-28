// server.js - backend de SETTA con Express y Supabase
// Comentarios amplios para que puedas entender la conexión y las tablas.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

// Configura CORS para que el frontend pueda llamar al backend desde tu localhost.
app.use(cors());
app.use(express.json());

// Datos necesarios para Supabase. Debes copiar estos valores en un archivo .env.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Debes configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

// Creamos el cliente de Supabase con el service role key para operaciones de backend.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// -------------------------------------------------
// Helpers
// -------------------------------------------------

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function crearRespuestaError(res, status, mensaje) {
  return res.status(status).json({ error: mensaje });
}

function calcularRangoBPM(canciones) {
  if (!Array.isArray(canciones) || canciones.length === 0) return '';
  const bpm = canciones.map((id) => Number(id)).filter(Boolean);
  const min = Math.min(...bpm);
  const max = Math.max(...bpm);
  return min === max ? `${min}` : `${min}-${max}`;
}

// -------------------------------------------------
// Endpoints
// -------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend SETTA activo' });
});

// Registro de usuario
app.post('/api/register', async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const correo = normalizarEmail(req.body.correo);
  const contrasena = String(req.body.contrasena || '').trim();

  if (!nombre || !correo || !contrasena) {
    return crearRespuestaError(res, 400, 'Nombre, correo y contraseña son obligatorios');
  }

  // Verificamos si el correo ya existe en Supabase
  const { data: userExists, error: errorExists } = await supabase
    .from('users')
    .select('id')
    .eq('correo', correo)
    .single();

  if (errorExists && errorExists.code !== 'PGRST116') {
    return crearRespuestaError(res, 500, 'Error al verificar usuario existente');
  }

  if (userExists) {
    return crearRespuestaError(res, 409, 'Ya existe un usuario registrado con ese correo');
  }

  const hashedPassword = bcrypt.hashSync(contrasena, 10);

  const { data: createdUser, error: errorInsert } = await supabase
    .from('users')
    .insert({ nombre, correo, hashed_password: hashedPassword })
    .select('id, nombre, correo')
    .single();

  if (errorInsert) {
    return crearRespuestaError(res, 500, 'Error al crear el usuario');
  }

  res.status(201).json({ user: createdUser });
});

// Inicio de sesión simple
app.post('/api/login', async (req, res) => {
  const correo = normalizarEmail(req.body.correo);
  const contrasena = String(req.body.contrasena || '').trim();

  if (!correo || !contrasena) {
    return crearRespuestaError(res, 400, 'Correo y contraseña son obligatorios');
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, nombre, correo, hashed_password')
    .eq('correo', correo)
    .single();

  if (error || !user) {
    return crearRespuestaError(res, 401, 'Correo o contraseña incorrecta');
  }

  const passwordOk = bcrypt.compareSync(contrasena, user.hashed_password || '');
  if (!passwordOk) {
    return crearRespuestaError(res, 401, 'Correo o contraseña incorrecta');
  }

  // No devolvemos la contraseña hash al frontend
  const { hashed_password, ...userData } = user;
  res.json({ user: userData });
});

// Obtener lista de canciones desde Supabase
app.get('/api/songs', async (req, res) => {
  const { data, error } = await supabase
    .from('songs')
    .select('id, titulo, artista, bpm, tono, genero, energia, album')
    .order('titulo', { ascending: true });

  if (error) {
    return crearRespuestaError(res, 500, 'Error al cargar canciones');
  }

  res.json({ canciones: data });
});

// Obtener una sola canción por id
app.get('/api/songs/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return crearRespuestaError(res, 400, 'ID de canción inválido');

  const { data, error } = await supabase
    .from('songs')
    .select('id, titulo, artista, bpm, tono, genero, energia, album')
    .eq('id', id)
    .single();

  if (error) {
    return crearRespuestaError(res, 404, 'Canción no encontrada');
  }

  res.json({ cancion: data });
});

// Obtener sets de un usuario, incluyendo las canciones enlazadas
app.get('/api/sets/:userId', async (req, res) => {
  const userId = req.params.userId;
  if (!userId) return crearRespuestaError(res, 400, 'userId es requerido');

  const { data, error } = await supabase
    .from('sets')
    .select(`
      id,
      nombre,
      bpm_rango,
      fecha,
      created_at,
      set_songs (
        orden,
        song_id,
        songs (
          id,
          titulo,
          artista,
          bpm,
          tono,
          genero,
          energia,
          album
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return crearRespuestaError(res, 500, 'Error al cargar los sets del usuario');
  }

  res.json({ sets: data });
});

// Guardar un set nuevo en Supabase
app.post('/api/sets', async (req, res) => {
  const userId = req.body.user_id;
  const nombre = String(req.body.nombre || 'Set sin nombre').trim();
  const canciones = Array.isArray(req.body.canciones) ? req.body.canciones : [];

  if (!userId) {
    return crearRespuestaError(res, 400, 'Debe informar el user_id');
  }
  if (canciones.length === 0) {
    return crearRespuestaError(res, 400, 'Debe agregar al menos una canción al set');
  }

  const bpmRango = calcularRangoBPM(canciones);
  const fecha = new Date().toLocaleDateString('es-CO');

  const { data: insertedSet, error: errorSet } = await supabase
    .from('sets')
    .insert({ user_id: userId, nombre, bpm_rango: bpmRango, fecha })
    .select('id')
    .single();

  if (errorSet || !insertedSet) {
    return crearRespuestaError(res, 500, 'Error al crear el set');
  }

  const cancionesSet = canciones.map((songId, index) => ({
    set_id: insertedSet.id,
    song_id: songId,
    orden: index + 1
  }));

  const { error: errorSongInsert } = await supabase
    .from('set_songs')
    .insert(cancionesSet);

  if (errorSongInsert) {
    return crearRespuestaError(res, 500, 'Error al guardar las canciones del set');
  }

  res.status(201).json({ message: 'Set guardado correctamente', setId: insertedSet.id });
});

// Obtener tips de DJ (estáticos en el backend, pero se pueden mover a Supabase si quieres)
app.get('/api/tips', (req, res) => {
  const tips = [
    'Canciones con diferencia de BPM menor a 5 hacen transiciones casi transparentes.',
    'Mezclar en el mismo tono o tono relativo suena más armónico.',
    'Energía alta a baja funciona mejor al final de un set.',
    'Practica primero con 2 canciones del mismo artista, suelen tener BPM similar.',
    'Las transiciones de Afrobeat a House funcionan bien entre 95 y 105 BPM.',
    'Un set bien organizado sube energía gradualmente hasta el punto más alto.',
    'El BPM no es lo único, la tonalidad importa casi igual para una mezcla limpia.',
    'Techno y House comparten muchos BPM entre 120-130, fácil de mezclar.',
    'Guarda tus sets antes de cerrar la app, perdiste un set antes y duele.',
    'Trip-Hop entre 85-100 BPM es buen género para comenzar o terminar un set.'
  ];
  res.json({ tips });
});

app.listen(PORT, () => {
  console.log(`SETTA backend escuchando en http://localhost:${PORT}`);
});
