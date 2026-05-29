// sets.js - constructor de sets y playlists

let setActual = [];

async function initSets() {
    if (typeof cargarCanciones === 'function') {
        await cargarCanciones();
    }
    filtrarBibliotecaSets();
    renderSet();
}

// renderiza la biblioteca lateral del constructor
function filtrarBibliotecaSets() {
    const q = (document.getElementById("buscar-sets")?.value || "").toLowerCase();
    const lista = CANCIONES.filter(c =>
        !q ||
        c.titulo.toLowerCase().includes(q) ||
        c.artista.toLowerCase().includes(q) ||
        String(c.bpm).includes(q)
    );

    const cont = document.getElementById("biblioteca-sets");
    if (!cont) return;

    cont.innerHTML = lista.slice(0, 20).map(c => `
        <div style="display:flex;align-items:center;gap:0.75rem;
                    padding:0.6rem 0.75rem;background:var(--surface);
                    border:1px solid var(--borde);margin-bottom:0.35rem;
                    cursor:pointer;transition:border-color 0.1s"
             onmouseover="this.style.borderColor='var(--gris-cla)'"
             onmouseout="this.style.borderColor='var(--borde)'"
             onclick="agregarCancionASet(CANCIONES.find(x=>x.id===${c.id}))">
            <div style="flex:1">
                <div style="font-size:0.85rem;font-weight:500">${c.titulo}</div>
                <div style="font-size:0.72rem;color:var(--muted)">${c.artista}</div>
            </div>
            <span class="badge-bpm">${c.bpm}</span>
            <span class="badge-gen">${c.genero}</span>
        </div>
    `).join("");
}

// agregar cancion al set
function agregarCancionASet(c) {
    if (!c) return;
    // evitar duplicados
    if (setActual.find(x => x.id === c.id)) {
        toast("Ya esta en el set");
        return;
    }
    setActual.push(c);
    renderSet();
}

function quitarDelSet(id) {
    setActual = setActual.filter(c => c.id !== id);
    renderSet();
}

function limpiarSet() {
    setActual = [];
    renderSet();
}

// renderiza los tracks del set con diferencias de BPM
function renderSet() {
    const cont   = document.getElementById("set-tracks");
    const vacio  = document.getElementById("set-vacio");
    if (!cont || !vacio) return;

    if (setActual.length === 0) {
        cont.innerHTML = "";
        vacio.style.display = "block";
        return;
    }

    vacio.style.display = "none";

    cont.innerHTML = setActual.map((c, i) => {
        let transBadge = "";
        if (i > 0) {
            const prev = setActual[i - 1];
            const dif  = Math.abs(c.bpm - prev.bpm);
            let cls = "transicion-ok";
            let lbl = "Facil";
            if (dif > 8)  { cls = "transicion-med"; lbl = "Moderada"; }
            if (dif > 15) { cls = "transicion-bad"; lbl = "Dificil"; }

            transBadge = `
                <div style="padding:0.2rem 0.75rem;font-size:0.65rem;
                            font-family:var(--font-mono);color:var(--muted);
                            letter-spacing:0.05em">
                    dif. ${dif} BPM —
                    <span class="transicion-badge ${cls}">${lbl}</span>
                </div>`;
        }

        return `
            ${transBadge}
            <div class="set-track">
                <span class="set-track-num">${i + 1}</span>
                <div class="set-track-info">
                    <div class="set-track-titulo">${c.titulo}</div>
                    <div class="set-track-bpm">${c.artista} · ${c.bpm} BPM</div>
                </div>
                <button style="background:none;border:none;color:var(--muted);
                               cursor:pointer;font-size:0.9rem;padding:0 0.25rem"
                        onclick="quitarDelSet(${c.id})">x</button>
            </div>`;
    }).join("");
}

// guardar set en localStorage (despues va a bd)
async function guardarSet() {
    if (setActual.length === 0) {
        toast("Agrega canciones primero");
        return;
    }
    const nombre = document.getElementById("set-nombre")?.value.trim() || "Set sin nombre";
    const userId = window.usuarioActual?.id;
    if (!userId) {
        toast("Debes iniciar sesión para guardar sets");
        return;
    }

    try {
        await guardarSetBackend(userId, nombre, setActual.map(c => c.id));
        toast("Set guardado");
        actualizarContadorSets();
        limpiarSet();
        if (document.getElementById("set-nombre"))
            document.getElementById("set-nombre").value = "";
    } catch (error) {
        toast(error.message || 'Error al guardar el set');
    }
}
