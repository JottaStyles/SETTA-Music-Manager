// app.js - navegacion, tabs, toast
// logica compartida entre todas las vistas

// usuario en sesion (despues viene del backend)
window.usuarioActual = {
    nombre: "Sebastian",
    correo: "sebastian@setta.app"
};

// iniciar la app
document.addEventListener("DOMContentLoaded", () => {
    const storedUser = localStorage.getItem('setta_usuario');
    if (storedUser) {
        try {
            window.usuarioActual = JSON.parse(storedUser);
        } catch (error) {
            console.warn('Usuario guardado inválido en localStorage', error);
        }
    }

    if (document.querySelector('.app-shell') && !usuarioActual?.id) {
        window.location.href = 'login.html';
        return;
    }

    actualizarUI();
    cambiarTab("dashboard");
});

// actualiza los elementos del layout con el usuario
function actualizarUI() {
    const av = document.getElementById("sb-avatar");
    const nm = document.getElementById("sb-nombre");
    const cr = document.getElementById("sb-correo");
    if (av) av.textContent = window.usuarioActual.nombre[0].toUpperCase();
    if (nm) nm.textContent = window.usuarioActual.nombre;
    if (cr) cr.textContent = window.usuarioActual.correo;
}

// cambiar entre secciones principales
function cambiarTab(nombre) {
    const secciones = document.querySelectorAll(".seccion, .seccion-flex");
    secciones.forEach(s => {
        s.style.display = "none";
        s.classList.remove("activa", "flex-activa");
    });

    const target = document.getElementById("tab-" + nombre);
    if (!target) return;

    if (target.classList.contains("seccion-flex")) {
        target.style.display = "flex";
        target.classList.add("flex-activa");
    } else {
        target.style.display = "block";
        target.classList.add("activa");
    }

    // actualizar sidebar
    document.querySelectorAll(".sidebar-link").forEach(l => l.classList.remove("activo"));
    const link = document.querySelector(`.sidebar-link[data-tab="${nombre}"]`);
    if (link) link.classList.add("activo");

    // acciones especificas al entrar a cada tab
    if (nombre === "explorar" && typeof initExplorar === "function") initExplorar();
    if (nombre === "sets" && typeof initSets === "function") initSets();
    if (nombre === "dashboard" && typeof initDashboard === "function") initDashboard();
}

// toast
function toast(msg) {
    const wrap = document.getElementById("toast-wrap");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = "toast-item";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2600);
}

// cerrar sesion (despues conecta con backend)
function cerrarSesion() {
    localStorage.removeItem('setta_usuario');
    window.location.href = "index.html";
}
