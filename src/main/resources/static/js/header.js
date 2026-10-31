document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
        try {
            const response = await fetch('header.html');
            if (response.ok) {
                const html = await response.text();
                headerContainer.innerHTML = html;

                // Una vez insertado el HTML, inicializamos la lógica
                inicializarMenuUsuario();
                cargarNombreUsuario(); 
                marcarEnlaceActivo(); // <- Ahora se ejecuta correctamente de forma global
            } else {
                console.error('No se pudo cargar el header.');
            }
        } catch (error) {
            console.error('Error de red al cargar el header:', error);
        }
    }
});

function inicializarMenuUsuario() {
    const userMenuToggle = document.getElementById('userMenuToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const btnLogout = document.getElementById('btnLogout');

    // --- VALIDACIÓN DEL ROL DE ADMINISTRADOR ---
    const rolUsuario = sessionStorage.getItem('tipoDeUsuario');
    const menuAdmin = document.getElementById('menuAdmin'); // Asegúrate que tu enlace de admin en el HTML tenga id="menuAdmin"

    if (rolUsuario && rolUsuario.toUpperCase() === 'ADMINISTRADOR' && menuAdmin) {
        menuAdmin.style.display = 'flex'; // O 'inline-flex' según tu diseño
    } else if (menuAdmin) {
        menuAdmin.style.display = 'none'; // Ocultar si no es admin
    }

    if (!userMenuToggle || !sidebarMenu) return;

    // Abrir / Cerrar menú
    userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    // Cerrar con overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            sidebarMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebarMenu.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
        }
    });

    // Navegación de enlaces del sidebar
    const sidebarLinks = sidebarMenu.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            if (targetUrl && targetUrl.endsWith('.html')) {
                e.preventDefault();
                sidebarMenu.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
                window.location.href = targetUrl;
            }
        });
    });

    // Botón Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html'; // Ajusta la ruta si es necesario
        });
    }
}

function cargarNombreUsuario() {
    const nombreGuardado = sessionStorage.getItem('usuarioNombre');
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (nombreGuardado && userNameDisplay) {
        userNameDisplay.textContent = nombreGuardado;
    }
}

function marcarEnlaceActivo() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Removemos active de todos
        link.classList.remove('active');

        // Si el enlace coincide con la página actual, le asignamos 'active'
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'dashboard.html')) {
            link.classList.add('active');
        }
    });
}