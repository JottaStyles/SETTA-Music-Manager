// data.js - canciones y datos estaticos de setta
// despues esto se reemplaza por llamadas a la API

let CANCIONES = [
    { id:1,  titulo:"Golden Hour",            artista:"Sango",         bpm:98,  tono:"Gmaj", genero:"Afrobeat", energia:"media", album:"Sango", preview_url:"previews/1.mp3" },
    { id:2,  titulo:"Bana",                   artista:"Mr Eazi",       bpm:97,  tono:"Am",   genero:"Afrobeat", energia:"media", album:"Lagos to London", preview_url:"previews/2.mp3" },
    { id:3,  titulo:"Lagos Nights",           artista:"Asa",           bpm:100, tono:"Dm",   genero:"Afrobeat", energia:"baja",  album:"Bed of Stone", preview_url:"previews/3.mp3" },
    { id:4,  titulo:"Sunday Ride",            artista:"Burna Boy",     bpm:99,  tono:"Fmaj", genero:"Afrobeat", energia:"baja",  album:"African Giant", preview_url:"previews/4.mp3" },
    { id:5,  titulo:"For Whom The Bell Tolls",artista:"Metallica",     bpm:118, tono:"Em",   genero:"Metal",    energia:"alta",  album:"Ride the Lightning", preview_url:"previews/5.mp3" },
    { id:6,  titulo:"Enter Sandman",          artista:"Metallica",     bpm:123, tono:"Em",   genero:"Metal",    energia:"alta",  album:"Metallica", preview_url:"previews/6.mp3" },
    { id:7,  titulo:"To Live is to Die",      artista:"Metallica",     bpm:103, tono:"Dm",   genero:"Metal",    energia:"media", album:"...And Justice for All", preview_url:"previews/7.mp3" },
    { id:8,  titulo:"Playlist",               artista:"DJ Koze",       bpm:124, tono:"Am",   genero:"House",    energia:"media", album:"DJ-Kicks", preview_url:"previews/8.mp3" },
    { id:9,  titulo:"Flatland",               artista:"Objekt",        bpm:132, tono:"Dm",   genero:"Techno",   energia:"alta",  album:"Flatland", preview_url:"previews/9.mp3" },
    { id:10, titulo:"Kaytraminé",             artista:"Kaytraminé",    bpm:105, tono:"Fm",   genero:"Hip-Hop",  energia:"alta",  album:"Kaytraminé", preview_url:"previews/10.mp3" },
    { id:11, titulo:"Breathe",                artista:"Disclosure",    bpm:120, tono:"Cmaj", genero:"House",    energia:"media", album:"Settle", preview_url:"previews/11.mp3" },
    { id:12, titulo:"No Sleep",               artista:"Solomun",       bpm:126, tono:"Bm",   genero:"Techno",   energia:"alta",  album:"Home", preview_url:"previews/12.mp3" },
    { id:13, titulo:"Passionfruit",           artista:"Drake",         bpm:106, tono:"Fmaj", genero:"R&B",      energia:"baja",  album:"More Life", preview_url:"previews/13.mp3" },
    { id:14, titulo:"Pyramids",               artista:"Frank Ocean",   bpm:90,  tono:"Em",   genero:"R&B",      energia:"baja",  album:"Channel Orange", preview_url:"previews/14.mp3" },
    { id:15, titulo:"Frontin",                artista:"Pharrell",      bpm:115, tono:"Gm",   genero:"Hip-Hop",  energia:"media", album:"In My Mind", preview_url:"previews/15.mp3" },
    { id:16, titulo:"Finally",                artista:"CeCe Peniston", bpm:125, tono:"Cmaj", genero:"House",    energia:"alta",  album:"Finally", preview_url:"previews/16.mp3" },
    { id:17, titulo:"Strings of Life",        artista:"Derrick May",   bpm:130, tono:"Am",   genero:"Techno",   energia:"alta",  album:"Strings of Life", preview_url:"previews/17.mp3" },
    { id:18, titulo:"Show Me Love",           artista:"Robin S",       bpm:128, tono:"Dm",   genero:"House",    energia:"alta",  album:"Show Me Love", preview_url:"previews/18.mp3" },
    { id:19, titulo:"Teardrop",               artista:"Massive Attack",bpm:97,  tono:"Fmaj", genero:"Trip-Hop", energia:"baja",  album:"Mezzanine", preview_url:"previews/19.mp3" },
    { id:20, titulo:"Inna City Mamma",        artista:"Neneh Cherry",  bpm:105, tono:"Gm",   genero:"Trip-Hop", energia:"media", album:"Raw Like Sushi", preview_url:"previews/20.mp3" },
];

// tips para dj principiantes
const TIPS = [
    "Canciones con diferencia de BPM menor a 5 hacen transiciones casi transparentes.",
    "Mezclar en el mismo tono o tono relativo suena mas armonico.",
    "Energia alta a baja funciona mejor al final de un set.",
    "Practica primero con 2 canciones del mismo artista, suelen tener BPM similar.",
    "Las transiciones de Afrobeat a House funcionan bien entre 95 y 105 BPM.",
    "Un set bien organizado sube energia gradualmente hasta el punto mas alto.",
    "El BPM no es lo unico, la tonalidad importa casi igual para una mezcla limpia.",
    "Techno y House comparten muchos BPM entre 120-130, facil de mezclar.",
    "Guarda tus sets antes de cerrar la app, perdiste un set antes y duele.",
    "Trip-Hop entre 85-100 BPM es buen genero para comenzar o terminar un set.",
];

const GENEROS = ["Todos", "Afrobeat", "House", "Techno", "Metal", "Hip-Hop", "R&B", "Trip-Hop"];

// calcula compatibilidad entre dos canciones segun bpm
// retorna un porcentaje de 0-100
function calcularCompatibilidad(c1, c2) {
    const difBpm = Math.abs(c1.bpm - c2.bpm);
    const mismoTono = c1.tono === c2.tono;
    const mismoGen  = c1.genero === c2.genero;

    let score = 100;
    score -= difBpm * 5;
    if (mismoTono) score += 8;
    if (mismoGen)  score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

// retorna las n canciones mas compatibles con la dada
function getCompatibles(cancion, n = 5) {
    return CANCIONES
        .filter(c => c.id !== cancion.id)
        .map(c => ({ ...c, pct: calcularCompatibilidad(cancion, c) }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, n);
}

// tip aleatorio
function getTipRandom() {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
}
