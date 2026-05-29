// explorar.js - filtros, tabla de canciones, panel match

let generoActivo = "Todos";
let cancionSelec = null;
let yaInit = false;
let cancionesEnServidor = [];

async function initExplorar() {
    if (!yaInit) {
        renderChips();
        yaInit = true;
    }
    await cargarCanciones();
    filtrarExp();
}

async function cargarCanciones() {
    if (cancionesEnServidor.length > 0) return;

    try {
        const result = await obtenerCanciones();
        cancionesEnServidor = result.canciones || [];
        if (cancionesEnServidor.length && typeof CANCIONES !== 'undefined') {
            CANCIONES = cancionesEnServidor;
        }
    } catch (error) {
        if (typeof toast === 'function') {
            toast('No se pudieron cargar canciones desde el backend; usando datos locales.');
        }
        console.warn('Error al cargar canciones desde backend:', error);
    }
}

// chips de genero
function renderChips() {
    const wrap = document.getElementById("chips-exp");
    if (!wrap) return;
    wrap.innerHTML = GENEROS.map(g => `
        <button class="chip ${g === generoActivo ? "activo" : ""}"
                onclick="setGenero('${g}')">
            ${g}
        </button>
    `).join("");
}

function setGenero(g) {
    generoActivo = g;
    renderChips();
    filtrarExp();
}

// filtrado principal
function filtrarExp() {
    const q   = (document.getElementById("buscar-exp")?.value || "").toLowerCase();
    const mn  = +document.getElementById("bmin-exp").value;
    const mx  = +document.getElementById("bmax-exp").value;
    const lo  = Math.min(mn, mx);
    const hi  = Math.max(mn, mx);

    document.getElementById("lbl-bpm-exp").textContent = `BPM: ${lo} - ${hi}`;

    const fuenteCanciones = cancionesEnServidor.length ? cancionesEnServidor : CANCIONES;
    const lista = fuenteCanciones.filter(c => {
        const qOk = !q ||
            c.titulo.toLowerCase().includes(q) ||
            c.artista.toLowerCase().includes(q) ||
            String(c.bpm).includes(q);
        const gOk = generoActivo === "Todos" || c.genero === generoActivo;
        const bOk = c.bpm >= lo && c.bpm <= hi;
        return qOk && gOk && bOk;
    });

    document.getElementById("res-exp").textContent = `${lista.length} canciones`;
    renderTabla(lista);
}

function renderTabla(lista) {
    const tbody = document.getElementById("tbody-exp");
    if (!tbody) return;
    tbody.innerHTML = lista.map((c, i) => filaCancion(c, i + 1)).join("");
}

function filaCancion(c, i) {
    const sel = cancionSelec?.id === c.id ? "seleccionada" : "";
    return `
    <tr class="${sel}" onclick="abrirMatch(CANCIONES.find(x=>x.id===${c.id}))">
        <td class="td-num">${i}</td>
        <td>
            <div class="td-titulo">${c.titulo}</div>
            <div class="td-artista">${c.artista}</div>
        </td>
        <td><span class="badge-bpm">${c.bpm}</span></td>
        <td><span class="badge-tono">${c.tono}</span></td>
        <td><span class="badge-gen">${c.genero}</span></td>
        <td><span class="badge-energia ${c.energia}">${c.energia}</span></td>
        <td>
            <button class="btn-setta secundario pequeno"
                    onclick="playSong(${c.id}); event.stopPropagation()">
                ▶ Escuchar
            </button>
        </td>
    </tr>`;
}

// abrir panel match
function abrirMatch(c) {
    if (!c) return;
    cancionSelec = c;
    filtrarExp();

    const panel = document.getElementById("panel-match");
    const body  = document.getElementById("panel-body");
    if (!panel || !body) return;

    const compatibles = getCompatibles(c, 5);

    body.innerHTML = `
        <div style="margin-bottom:0.75rem">
            <div class="panel-cancion-titulo">${c.titulo}</div>
            <div class="panel-artista">${c.artista}</div>
            <div class="d-flex gap-1 flex-wrap">
                <span class="badge-bpm">${c.bpm} BPM</span>
                <span class="badge-tono">${c.tono}</span>
                <span class="badge-gen">${c.genero}</span>
                <span class="badge-energia ${c.energia}">${c.energia}</span>
            </div>
        </div>

        <hr class="separador">

        <div class="compat-lista-titulo">Canciones compatibles</div>
        ${compatibles.length
            ? compatibles.map(x => `
                <div class="compat-item" onclick="abrirMatch(CANCIONES.find(z=>z.id===${x.id}))">
                    <div>
                        <div class="compat-nombre">${x.titulo}</div>
                        <div class="compat-art">${x.artista} — ${x.bpm} BPM</div>
                    </div>
                    <span class="compat-pct">${x.pct}%</span>
                </div>
            `).join("")
            : `<p style="font-size:0.8rem;color:var(--muted)">Sin canciones en rango cercano.</p>`
        }
    `;

    panel.classList.add("abierto");
}

function cerrarPanel() {
    document.getElementById("panel-match")?.classList.remove("abierto");
    cancionSelec = null;
    filtrarExp();
}

// agregar al set desde panel
function agregarASetDesdePanel() {
    if (!cancionSelec) return;
    agregarCancionASet(cancionSelec);
    toast("Agregada al set");
}

function buscarCancion(id) {
    const fuente = cancionesEnServidor.length ? cancionesEnServidor : CANCIONES;
    return fuente.find(c => c.id === id);
}

function playSong(id) {
    const cancion = buscarCancion(id);
    if (!cancion) return;
    const query = encodeURIComponent(`${cancion.titulo} ${cancion.artista} official audio`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    toast(`Buscando: ${cancion.titulo} — ${cancion.artista}`);
}
