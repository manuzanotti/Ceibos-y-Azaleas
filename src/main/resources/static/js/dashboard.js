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

    // --------------------------------------------------
    // LÓGICA DE LA MODAL DE RESERVAS
    // --------------------------------------------------
    const modalReserva = document.getElementById('modalReserva');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelReserva = document.getElementById('btnCancelReserva');
    const btnsCard = document.querySelectorAll('.btn-card:not(.disabled)');

    const modalCabanaNombre = document.getElementById('modalCabanaNombre');
    const modalCabanaCapacidad = document.getElementById('modalCabanaCapacidad');
    const modalCabanaPrecio = document.getElementById('modalCabanaPrecio');
    const modalCabanaImg = document.getElementById('modalCabanaImg');

    const fechaCheckIn = document.getElementById('fechaCheckIn');
    const fechaCheckOut = document.getElementById('fechaCheckOut');
    const cantNoches = document.getElementById('cantNoches');
    const precioTotalCalculado = document.getElementById('precioTotalCalculado');
    const reservaNombre = document.getElementById('reservaNombre');

    // Precios base fijados por noche para la simulación del front
    const preciosCabanias = {
        'Cabaña Los Ceibos': 120000,
        'Estudio Las Azaleas': 85000
    };

    // Precompletar el nombre con la sesión si existe
    if (nombreGuardado) {
        reservaNombre.value = nombreGuardado;
    }

    // Abrir Modal al hacer clic en "Ver Disponibilidad"
    btnsCard.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.cabana-card');
            const nombre = card.querySelector('h3').textContent;
            const info = card.querySelector('.card-info').textContent;

            modalCabanaNombre.textContent = nombre;
            modalCabanaCapacidad.textContent = info;
            
            const precioNoche = preciosCabanias[nombre] || 100000;
            modalCabanaPrecio.textContent = precioNoche.toLocaleString('es-AR');

            // Abrir la modal
            modalReserva.classList.add('active');
            
            // Establecer fecha de hoy en check-in por defecto
            const hoy = new Date().toISOString().split('T')[0];
            fechaCheckIn.min = hoy;
            fechaCheckIn.value = hoy;
            
            calcularTotal();
        });
    });

    // Cerrar Modal
    const cerrarModal = () => modalReserva.classList.remove('active');
    btnCloseModal.addEventListener('click', cerrarModal);
    btnCancelReserva.addEventListener('click', cerrarModal);

    // Cálculo dinámico de noches y precio
    const calcularTotal = () => {
        if (fechaCheckIn.value && fechaCheckOut.value) {
            const date1 = new Date(fechaCheckIn.value);
            const date2 = new Date(fechaCheckOut.value);
            const diffTime = date2 - date1;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                cantNoches.textContent = diffDays;
                const precioNoche = parseInt(modalCabanaPrecio.textContent.replace(/\./g, ''));
                const total = diffDays * precioNoche;
                precioTotalCalculado.textContent = total.toLocaleString('es-AR');
            } else {
                cantNoches.textContent = 0;
                precioTotalCalculado.textContent = 0;
            }
        }
    };

    fechaCheckIn.addEventListener('change', () => {
        fechaCheckOut.min = fechaCheckIn.value;
        calcularTotal();
    });
    fechaCheckOut.addEventListener('change', calcularTotal);

    // Simulación del envío de reserva
    const formReserva = document.getElementById('formReserva');
    formReserva.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('¡Reserva confirmada con éxito! (Simulación del frontend)');
        cerrarModal();
    });

});