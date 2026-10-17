document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si hay un usuario logueado en sessionStorage
    const nombreGuardado = sessionStorage.getItem('usuarioNombre');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (nombreGuardado) {
        userNameDisplay.textContent = `Bienvenido, ${nombreGuardado}`;
    } else {
        // Si no hay datos de sesión (acceso directo sin login), redirigir al login
        window.location.href = '/html/login.html';
    }

    // 2. Referencias a los elementos del DOM
    const userMenuToggle = document.getElementById('userMenuToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const btnLogout = document.getElementById('btnLogout');

    // 3. Función para alternar (abrir/cerrar) el menú desplegable de usuario
    userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el evento se propague al documento
        sidebarMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    // 4. Cerrar el menú si se hace clic en el overlay transparente
    menuOverlay.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    // 5. Cerrar el menú si se presiona la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebarMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        }
    });

    // 6. Lógica para el botón de Cerrar Sesión
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear(); // Limpiamos los datos guardados en el navegador
        window.location.href = '/html/login.html';
    });
});