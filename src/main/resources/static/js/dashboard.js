document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si hay un usuario logueado en sessionStorage
    const nombreGuardado = sessionStorage.getItem('usuarioNombre');

    if (!nombreGuardado) {
        // Si no hay datos de sesión, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    // --------------------------------------------------
    // LÓGICA DE LA MODAL DE RESERVAS (Específica del Dashboard)
    // --------------------------------------------------
    const modalReserva = document.getElementById('modalReserva');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelReserva = document.getElementById('btnCancelReserva');
    const btnsCard = document.querySelectorAll('.btn-card:not(.disabled)');

    const modalCabanaNombre = document.getElementById('modalCabanaNombre');
    const modalCabanaCapacidad = document.getElementById('modalCabanaCapacidad');
    const modalCabanaPrecio = document.getElementById('modalCabanaPrecio');

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

    // Precompletar el nombre en el formulario de la modal con la sesión si existe
    if (nombreGuardado && reservaNombre) {
        reservaNombre.value = nombreGuardado;
    }

    // Abrir Modal al hacer clic en "Ver Disponibilidad"
    btnsCard.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.cabana-card');
            const nombre = card.querySelector('h3').textContent;
            const info = card.querySelector('.card-info').textContent;

            if (modalCabanaNombre) modalCabanaNombre.textContent = nombre;
            if (modalCabanaCapacidad) modalCabanaCapacidad.textContent = info;
            
            const precioNoche = preciosCabanias[nombre] || 100000;
            if (modalCabanaPrecio) modalCabanaPrecio.textContent = precioNoche.toLocaleString('es-AR');

            // Abrir la modal
            if (modalReserva) modalReserva.classList.add('active');
            
            // Establecer fecha de hoy en check-in por defecto
            const hoy = new Date().toISOString().split('T')[0];
            if (fechaCheckIn) {
                fechaCheckIn.min = hoy;
                fechaCheckIn.value = hoy;
            }
            
            calcularTotal();
        });
    });

    // Cerrar Modal
    const cerrarModal = () => {
        if (modalReserva) modalReserva.classList.remove('active');
    };
    
    if (btnCloseModal) btnCloseModal.addEventListener('click', cerrarModal);
    if (btnCancelReserva) btnCancelReserva.addEventListener('click', cerrarModal);

    // Cálculo dinámico de noches y precio
    const calcularTotal = () => {
        if (fechaCheckIn && fechaCheckOut && fechaCheckIn.value && fechaCheckOut.value) {
            const date1 = new Date(fechaCheckIn.value);
            const date2 = new Date(fechaCheckOut.value);
            const diffTime = date2 - date1;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                if (cantNoches) cantNoches.textContent = diffDays;
                const precioNoche = parseInt(modalCabanaPrecio.textContent.replace(/\./g, '')) || 0;
                const total = diffDays * precioNoche;
                if (precioTotalCalculado) precioTotalCalculado.textContent = total.toLocaleString('es-AR');
            } else {
                if (cantNoches) cantNoches.textContent = 0;
                if (precioTotalCalculado) precioTotalCalculado.textContent = 0;
            }
        }
    };

    if (fechaCheckIn) {
        fechaCheckIn.addEventListener('change', () => {
            if (fechaCheckOut) fechaCheckOut.min = fechaCheckIn.value;
            calcularTotal();
        });
    }
    
    if (fechaCheckOut) {
        fechaCheckOut.addEventListener('change', calcularTotal);
    }

// Envío real de la reserva al Backend
    const formReserva = document.getElementById('formReserva');
    if (formReserva) {
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Obtener datos de la sesión y del formulario
            const usuarioId = sessionStorage.getItem('usuarioId');
            if (!usuarioId) {
                alert('Sesión expirada. Por favor, vuelve a iniciar sesión.');
                window.location.href = 'login.html';
                return;
            }

            // Mapeo del nombre de la cabaña al ID numérico de tu base de datos
            const nombreCabana = modalCabanaNombre ? modalCabanaNombre.textContent.trim() : '';
            let cabaniaId = 1; // ID por defecto
            if (nombreCabana.includes('Azaleas')) {
                cabaniaId = 2; // Ajusta según los IDs de tus cabañas en la BD
            }

            // Extraer precio total numérico limpio
            const precioTexto = precioTotalCalculado ? precioTotalCalculado.textContent.replace(/\./g, '') : '0';
            const precioTotal = parseFloat(precioTexto) || 0;

            // Construir el DTO que espera Spring Boot
            const reservaDto = {
                usuarioId: parseInt(usuarioId),
                cabaniaId: cabaniaId,
                fechaCheckIn: fechaCheckIn.value,
                fechaCheckOut: fechaCheckOut.value,
                cantidadAdultos: parseInt(document.getElementById('cantidadAdultos')?.value || 1),
                cantidadMenores: parseInt(document.getElementById('cantidadMenores')?.value || 0),
                telefono: document.getElementById('telefono')?.value || 'Sin teléfono',
                precioTotal: precioTotal
            };

            try {
                // 2. Petición POST al endpoint del backend
                const response = await fetch('/api/reservas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reservaDto)
                });

                if (response.ok) {
                    const reservaCreada = await response.json();
                    alert('¡Reserva creada con éxito! Estado: PENDIENTE');
                    cerrarModal();
                    
                    // 3. Redirigir a la página de Mis Reservas como pediste
                    window.location.href = 'reservas.html';
                } else {
                    // Si el backend rechaza por capacidad o solapamiento de fechas
                    const errorMsg = await response.text();
                    alert('No se pudo completar la reserva: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }
});