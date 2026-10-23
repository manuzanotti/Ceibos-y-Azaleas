document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión activa
    const usuarioId = sessionStorage.getItem('usuarioId');
    const usuarioNombre = sessionStorage.getItem('usuarioNombre');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    if (usuarioNombre) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = usuarioNombre;
        }
    }

    // 2. Marcar enlace activo en el Sidebar interno de la cuenta
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarItems = document.querySelectorAll('.sidebar-nav li');

    sidebarItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            item.classList.remove('active');
            
            if (href === currentPage) {
                item.classList.add('active');
            }
        }
    });

    // 3. Cargar las reservas del usuario desde la API
    async function cargarReservasUsuario() {
        try {
            const response = await fetch(`/api/reservas/usuario/${usuarioId}`);
            
            if (response.ok) {
                const reservas = await response.json();
                renderizarReservas(reservas);
            } else {
                console.error('Error al obtener las reservas.');
                const tablaBody = document.getElementById('tablaHistorialBody');
                if (tablaBody) {
                    tablaBody.innerHTML = `<tr><td colspan="5" class="table-empty">No se pudieron cargar las reservas.</td></tr>`;
                }
            }
        } catch (error) {
            console.error('Error de red:', error);
            const tablaBody = document.getElementById('tablaHistorialBody');
            if (tablaBody) {
                tablaBody.innerHTML = `<tr><td colspan="5" class="table-empty">Error de conexión con el servidor.</td></tr>`;
            }
        }
    }

    // 4. Renderizar los datos en la interfaz
    function renderizarReservas(reservas) {
        const featuredCard = document.getElementById('featuredReservation');
        const tablaBody = document.getElementById('tablaHistorialBody');

        if (!reservas || reservas.length === 0) {
            if (featuredCard) {
                featuredCard.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; color: #9ca3af; margin-bottom: 15px;"></i>
                        <h3 style="font-family: Georgia, serif; color: #2c332e; font-size: 1.4rem; margin-bottom: 8px;">Sin reservas activas</h3>
                        <p style="font-size: 1rem; margin-bottom: 25px;">Aún no ha realizado ninguna reserva en nuestro complejo.</p>
                        <a href="dashboard.html#cabania" class="btn-primary" style="text-decoration: none; display: inline-block;">¡Haz tu primera reserva!</a>
                    </div>
                `;
            }
            if (tablaBody) {
                tablaBody.innerHTML = `<tr><td colspan="5" class="table-empty">Aún no tienes reservas registradas.</td></tr>`;
            }
            return;
        }

        // Ordenar reservas de más reciente a más antigua
        reservas.sort((a, b) => b.id - a.id);

        // La primera (más reciente) va en la tarjeta principal
        const ultimaReserva = reservas[0];
        
        // Mapeo seguro de fechas (soporta checkIn/chekOut y fechaCheckIn/fechaCheckOut)
        const fIn = ultimaReserva.checkIn || ultimaReserva.fechaCheckIn;
        const fOut = ultimaReserva.chekOut || ultimaReserva.fechaCheckOut;

        if (featuredCard) {
            const nombreCabana = ultimaReserva.cabania ? ultimaReserva.cabania.nombre : (ultimaReserva.cabanaNombre || 'Cabaña');
            const elementNombre = document.getElementById('ultimaCabanaNombre');
            const elementFechas = document.getElementById('ultimaReservaFechas');
            const elementNoches = document.getElementById('ultimaReservaNoches');
            const elementTotal = document.getElementById('ultimaReservaTotal');

            if (elementNombre) elementNombre.textContent = nombreCabana;
            if (elementFechas && fIn && fOut) {
                elementFechas.textContent = `${fIn} al ${fOut}`;
            }
            
            if (fIn && fOut) {
                const d1 = new Date(fIn);
                const d2 = new Date(fOut);
                const noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
                if (elementNoches) elementNoches.textContent = `${noches} noches`;
            }

            if (elementTotal) elementTotal.textContent = `$${(ultimaReserva.precioTotal || 0).toLocaleString('es-AR')}`;

            // Actualizar dinámicamente el estado en la tarjeta principal (ej. PENDIENTE)
            const badgePrincipal = featuredCard.querySelector('.estado-badge') || featuredCard.querySelector('div[style*="background"]');
            const estadoUltima = ultimaReserva.estado || 'PENDIENTE';
            
            // Si tienes un elemento específico para el badge de estado arriba a la derecha:
            const statusBadgeTop = featuredCard.querySelector('.rounded-pill, [class*="badge"], div:has(> .fa-solid) + div span, .btn, span[style*="padding"]');
            // O podemos buscar el elemento por su contenido anterior ("Confirmada")
            const allSpansOrDivs = featuredCard.querySelectorAll('div, span');
            allSpansOrDivs.forEach(el => {
                if (el.textContent.trim() === 'Confirmada' || el.textContent.trim() === 'COMPLETADA' || el.textContent.trim() === 'PENDIENTE') {
                    el.textContent = estadoUltima;
                    if (estadoUltima === 'PENDIENTE') {
                        el.style.backgroundColor = '#f8d7da';
                        el.style.color = '#b02a37';
                    }
                }
            });
        }

        // Las demás van a la tabla del historial
        let htmlTabla = '';
        reservas.forEach((reserva) => {
            const cabaniaNombre = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
            const resIn = reserva.checkIn || reserva.fechaCheckIn;
            const resOut = reserva.chekOut || reserva.fechaCheckOut;
            
            let noches = 1;
            if (resIn && resOut) {
                const d1 = new Date(resIn);
                const d2 = new Date(resOut);
                noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
            }
            
            const estadoTexto = reserva.estado || 'PENDIENTE';
            let estadoClase = 'completada';
            
            if (estadoTexto === 'PENDIENTE') {
                estadoClase = 'cancelada'; 
            } else if (estadoTexto === 'CANCELADA') {
                estadoClase = 'cancelada';
            }

            htmlTabla += `
                <tr>
                    <td>${resIn || 'N/D'}</td>
                    <td>${cabaniaNombre}</td>
                    <td>${noches} Noches</td>
                    <td>$${(reserva.precioTotal || 0).toLocaleString('es-AR')}</td>
                    <td><span class="estado-badge ${estadoClase}">${estadoTexto}</span></td>
                </tr>
            `;
        });

        if (tablaBody) {
            tablaBody.innerHTML = htmlTabla;
        }
    }

    // Ejecutar la carga de reservas al iniciar
    cargarReservasUsuario();
});