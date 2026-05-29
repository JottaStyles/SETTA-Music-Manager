// dashboard.js - logica del dashboard

function initDashboard() {
    mostrarTip();
    renderRecomendadas();
    actualizarContadorSets();

    // actualizar perfil tb
    const av  = document.getElementById("perf-av");
    const nom = document.getElementById("perf-nombre");
    const cor = document.getElementById("perf-correo");
    if (av)  av.textContent  = usuarioActual.nombre[0].toUpperCase();
    if (nom) nom.textContent = usuarioActual.nombre;
    if (cor) cor.textContent = usuarioActual.correo;

    const navNom = document.getElementById("nav-nombre");
    if (navNom) navNom.textContent = usuarioActual.nombre;
}

function mostrarTip() {
    const el = document.getElementById("tip-texto");
    if (el) el.textContent = getTipRandom();
}

function renderRecomendadas() {
    const cont = document.getElementById("dash-recs");
    if (!cont) return;

    // agarra las primeras 4 de la lista
    const lista = CANCIONES.slice(0, 4);

    cont.innerHTML = lista.map(c => `
        <div class="col-3">
            <div style="background:var(--gris-osc);border:1px solid var(--borde);
                        padding:1rem;cursor:pointer;transition:border-color 0.12s"
                 onmouseover="this.style.borderColor='var(--gris-cla)'"
                 onmouseout="this.style.borderColor='var(--borde)'"
                 onclick="irAExplorar(${c.id})">
                <div style="font-weight:500;font-size:0.88rem;margin-bottom:0.2rem">${c.titulo}</div>
                <div style="font-size:0.75rem;color:var(--muted);margin-bottom:0.5rem">${c.artista}</div>
                <div class="d-flex gap-1 flex-wrap">
                    <span class="badge-bpm">${c.bpm} BPM</span>
                    <span class="badge-tono">${c.tono}</span>
                    <span class="badge-gen">${c.genero}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function irAExplorar(id) {
    cambiarTab("explorar");
    // abre el match de esa cancion
    setTimeout(() => {
        const c = CANCIONES.find(x => x.id === id);
        if (c) abrirMatch(c);
    }, 80);
}

function actualizarContadorSets() {
    if (window.usuarioActual?.id) {
        obtenerSetsBackend(window.usuarioActual.id)
            .then(result => {
                const sets = result.sets || [];
                const el = document.getElementById("dash-nsets");
                if (el) el.textContent = sets.length;
                const elp = document.getElementById("perf-nsets");
                if (elp) elp.textContent = sets.length;
                renderPerfilSets(sets);
            })
            .catch(error => {
                console.warn('Error cargando sets backend:', error);
                const sets = JSON.parse(localStorage.getItem("setta_sets") || "[]");
                const el = document.getElementById("dash-nsets");
                if (el) el.textContent = sets.length;
                const elp = document.getElementById("perf-nsets");
                if (elp) elp.textContent = sets.length;
                renderPerfilSets(sets);
            });
        return;
    }
    const sets = JSON.parse(localStorage.getItem("setta_sets") || "[]");
    const el = document.getElementById("dash-nsets");
    if (el) el.textContent = sets.length;
    const elp = document.getElementById("perf-nsets");
    if (elp) elp.textContent = sets.length;
    renderPerfilSets(sets);
}

function renderPerfilSets(sets) {
    const cont = document.getElementById("perfil-sets");
    if (!cont) return;
    if (!sets || sets.length === 0) {
        cont.innerHTML = `<p style="font-size:0.82rem;color:var(--muted)">No guardaste sets todavia.</p>`;
        return;
    }
    cont.innerHTML = sets.map(s => {
        // compatibilidad con datos del backend (set_songs) y localStorage (canciones)
        const nCanciones = s.set_songs?.length ?? s.canciones?.length ?? 0;
        const bpm = s.bpm_rango || s.bpmRango || '-';
        const fecha = s.fecha || '-';
        return `
        <div class="set-guardado-item">
            <div>
                <div class="set-guardado-nombre">${s.nombre}</div>
                <div class="set-guardado-meta">${nCanciones} canciones · ${fecha}</div>
            </div>
            <span class="badge-bpm">${bpm}</span>
        </div>`;
    }).join("");
}
