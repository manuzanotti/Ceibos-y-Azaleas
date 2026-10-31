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

    // 2. Marcar enlace activo en el Sidebar interno
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

    // Variables globales para la gestión de reservas y la modal
    let reservasGlobales = [];
    let reservaSeleccionadaActual = null;
    let timerInterval = null;

    // 3. Cargar las reservas del usuario desde la API
    async function cargarReservasUsuario() {
        try {
            const response = await fetch(`/api/reservas/usuario/${usuarioId}`);
            
            if (response.ok) {
                reservasGlobales = await response.json();
                
                if (reservasGlobales.length > 0) {
                    // Ordenar de más reciente a más antigua
                    reservasGlobales.sort((a, b) => b.id - a.id);
                    
                    // Por defecto, seleccionamos la más reciente para mostrar arriba
                    reservaSeleccionadaActual = reservasGlobales[0];
                    renderizarTarjetaPrincipal(reservaSeleccionadaActual);
                    renderizarHistorial(reservasGlobales);
                } else {
                    mostrarEstadoVacio();
                }
            } else {
                console.error('Error al obtener las reservas.');
                mostrarEstadoVacio('No se pudieron cargar las reservas.');
            }
        } catch (error) {
            console.error('Error de red:', error);
            mostrarEstadoVacio('Error de conexión con el servidor.');
        }
    }

    // Función auxiliar para los estilos visuales de los estados
    function obtenerEstilosEstado(estado) {
        switch (estado) {
            case 'CONFIRMADA':
                return { bg: '#d1e7dd', color: '#0f5132', border: '#badbcc' };
            case 'PENDIENTE':
                return { bg: '#fff3cd', color: '#664d03', border: '#ffeeba' };
            case 'CANCELADA':
                return { bg: '#f8d7da', color: '#842029', border: '#f5c2c7' };
            case 'FINALIZADA':
                return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
            default:
                return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
        }
    }

    // Renderizar la tarjeta superior con una reserva específica
    function renderizarTarjetaPrincipal(reserva) {
        const featuredCard = document.getElementById('featuredReservation');
        if (!featuredCard || !reserva) return;

        const fIn = reserva.checkIn || reserva.fechaCheckIn;
        const fOut = reserva.chekOut || reserva.fechaCheckOut;
        const estadoActual = reserva.estado || 'PENDIENTE';
        const estilos = obtenerEstilosEstado(estadoActual);
        const nombreCabana = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');

        const elementNombre = document.getElementById('ultimaCabanaNombre');
        const elementFechas = document.getElementById('ultimaReservaFechas');
        const elementNoches = document.getElementById('ultimaReservaNoches');
        const elementTotal = document.getElementById('ultimaReservaTotal');
        const labelTitulo = featuredCard.querySelector('.reserva-label');

        if (labelTitulo) labelTitulo.textContent = `Reserva #${reserva.id}`;
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

        if (elementTotal) elementTotal.textContent = `$${(reserva.precioTotal || 0).toLocaleString('es-AR')}`;

        const badgeUltima = document.getElementById('badgeUltimaReserva');
        if (badgeUltima) {
            badgeUltima.textContent = estadoActual;
            badgeUltima.className = 'badge-status';
            badgeUltima.style.backgroundColor = estilos.bg;
            badgeUltima.style.color = estilos.color;
            badgeUltima.style.border = `1px solid ${estilos.border}`;
            badgeUltima.style.padding = '6px 14px';
            badgeUltima.style.borderRadius = '20px';
            badgeUltima.style.display = 'inline-block';
            badgeUltima.style.fontWeight = '600';
        }
    }

    // Renderizar la tabla del historial (limitada a las últimas 5)
    function renderizarHistorial(reservas) {
        const tablaBody = document.getElementById('tablaHistorialBody');
        if (!tablaBody) return;

        // Tomar solo las primeras 5 reservas
        const ultimasCinco = reservas.slice(0, 5);
        let htmlTabla = '';

        ultimasCinco.forEach((reserva) => {
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
            const estilo = obtenerEstilosEstado(estadoTexto);
            const esSeleccionada = reserva.id === reservaSeleccionadaActual.id;

            htmlTabla += `
                <tr class="fila-reserva ${esSeleccionada ? 'fila-activa' : ''}" data-id="${reserva.id}" style="cursor: pointer; transition: background-color 0.2s;" title="Haz clic para ver en la tarjeta superior">
                    <td>${resIn || 'N/D'}</td>
                    <td><strong>${cabaniaNombre}</strong></td>
                    <td>${noches} Noches</td>
                    <td>$${(reserva.precioTotal || 0).toLocaleString('es-AR')}</td>
                    <td>
                        <span style="background-color: ${estilo.bg}; color: ${estilo.color}; border: 1px solid ${estilo.border}; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; display: inline-block;">
                            ${estadoTexto}
                        </span>
                    </td>
                </tr>
            `;
        });

        tablaBody.innerHTML = htmlTabla;

        // Agregar evento de clic a cada fila del historial
        const filas = tablaBody.querySelectorAll('.fila-reserva');
        filas.forEach(fila => {
            fila.addEventListener('click', () => {
                const idReserva = parseInt(fila.getAttribute('data-id'));
                const reservaEncontrada = reservasGlobales.find(r => r.id === idReserva);
                
                if (reservaEncontrada) {
                    reservaSeleccionadaActual = reservaEncontrada;
                    renderizarTarjetaPrincipal(reservaSeleccionadaActual);
                    renderizarHistorial(reservasGlobales); // Para actualizar la fila activa visualmente
                }
            });

            // Efecto hover sutil por JS o CSS
            fila.addEventListener('mouseenter', () => fila.style.backgroundColor = '#f7f5f0');
            fila.addEventListener('mouseleave', () => {
                const idReserva = parseInt(fila.getAttribute('data-id'));
                fila.style.backgroundColor = (idReserva === reservaSeleccionadaActual.id) ? '#f0ede6' : 'transparent';
            });
        });
    }

    function mostrarEstadoVacio(mensaje = 'Aún no ha realizado ninguna reserva en nuestro complejo.') {
        const featuredCard = document.getElementById('featuredReservation');
        const tablaBody = document.getElementById('tablaHistorialBody');

        if (featuredCard) {
            featuredCard.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; color: #9ca3af; margin-bottom: 15px;"></i>
                    <h3 style="font-family: Georgia, serif; color: #2c332e; font-size: 1.4rem; margin-bottom: 8px;">Sin reservas activas</h3>
                    <p style="font-size: 1rem; margin-bottom: 25px;">${mensaje}</p>
                    <a href="dashboard.html#cabanias" class="btn-primary" style="text-decoration: none; display: inline-block;">¡Haz tu primera reserva!</a>
                </div>
            `;
        }
        if (tablaBody) {
            tablaBody.innerHTML = `<tr><td colspan="5" class="table-empty">Aún no tienes reservas registradas.</td></tr>`;
        }
    }

    // ==========================================
    // LÓGICA DE LA MODAL DE DETALLES Y PAGOS
    // ==========================================
    const modalDetalles = document.getElementById('modalDetallesReserva');
    const btnVerDetalles = document.getElementById('btnVerDetalles');
    const btnCloseModalDetalles = document.getElementById('btnCloseModalDetalles');
    
    const paymentTimerContainer = document.getElementById('paymentTimerContainer');
    const tiempoRestanteSpan = document.getElementById('tiempoRestante');
    const modalAccionesPago = document.getElementById('modalAccionesPago');
    const btnPagarReserva = document.getElementById('btnPagarReserva');
    const btnCancelarReservaModal = document.getElementById('btnCancelarReservaModal');

// Abrir Modal de Detalles con la reserva seleccionada actualmente en la tarjeta
    if (btnVerDetalles) {
        btnVerDetalles.addEventListener('click', () => {
            if (!reservaSeleccionadaActual) return;

            // 1. Estado actual (primero en el HTML)
            const estadoSpan = document.getElementById('detEstado');
            const estadoActual = reservaSeleccionadaActual.estado || 'PENDIENTE';
            const estilo = obtenerEstilosEstado(estadoActual);
            
            estadoSpan.textContent = estadoActual;
            estadoSpan.style.backgroundColor = estilo.bg;
            estadoSpan.style.color = estilo.color;
            estadoSpan.style.border = `1px solid ${estilo.border}`;
            estadoSpan.style.padding = '4px 12px';
            estadoSpan.style.borderRadius = '12px';
            estadoSpan.style.fontWeight = '600';
            estadoSpan.style.fontSize = '0.85rem';
            estadoSpan.style.display = 'inline-block';

            // 2. Cabaña
            const nombreCabana = reservaSeleccionadaActual.cabania ? reservaSeleccionadaActual.cabania.nombre : (reservaSeleccionadaActual.cabanaNombre || 'Cabaña');
            document.getElementById('detCabaniaNombre').textContent = nombreCabana;

            // 3. Fechas Check-in / Check-out
            const fIn = reservaSeleccionadaActual.checkIn || reservaSeleccionadaActual.fechaCheckIn;
            const fOut = reservaSeleccionadaActual.chekOut || reservaSeleccionadaActual.fechaCheckOut;
            document.getElementById('detCheckIn').textContent = fIn || 'N/D';
            document.getElementById('detCheckOut').textContent = fOut || 'N/D';

            // 4. Huéspedes
            const adultos = reservaSeleccionadaActual.cantidadAdultos || 1;
            const menores = reservaSeleccionadaActual.cantidadMenores || 0;
            let textoHuespedes = `${adultos} Adultos`;
            if (menores > 0) {
                textoHuespedes += `, ${menores} Menores`;
            }
            document.getElementById('detHuespedes').textContent = textoHuespedes;

            // 5. Teléfono
            const telefonoContacto = 
                reservaSeleccionadaActual.telefono || 
                (reservaSeleccionadaActual.usuario ? reservaSeleccionadaActual.usuario.telefono : null) || 
                reservaSeleccionadaActual.telefonoContacto || 
                'Sin teléfono';
            document.getElementById('detTelefono').textContent = telefonoContacto;

            // 6. Precio Total
            document.getElementById('detPrecioTotal').textContent = `$${(reservaSeleccionadaActual.precioTotal || 0).toLocaleString('es-AR')}`;

            // 7. Lógica del Temporizador si está PENDIENTE
            if (estadoActual === 'PENDIENTE') {
                paymentTimerContainer.style.display = 'flex';
                modalAccionesPago.style.display = 'flex';
                
                const storageKey = `timer_expira_${reservaSeleccionadaActual.id}`;
                let tiempoRestanteSegundos;
                const tiempoGuardado = sessionStorage.getItem(storageKey);
                const ahora = Math.floor(Date.now() / 1000);

                if (tiempoGuardado) {
                    tiempoRestanteSegundos = parseInt(tiempoGuardado) - ahora;
                    if (tiempoRestanteSegundos <= 0) {
                        tiempoRestanteSegundos = 0;
                    }
                } else {
                    tiempoRestanteSegundos = 10 * 60;
                    const tiempoExpiracion = ahora + tiempoRestanteSegundos;
                    sessionStorage.setItem(storageKey, tiempoExpiracion);
                }

                iniciarTemporizadorPago(tiempoRestanteSegundos); 
            } else {
                paymentTimerContainer.style.display = 'none';
                modalAccionesPago.style.display = 'none';
            }

            modalDetalles.classList.add('active');
        });
    }

    const cerrarModalDetalles = () => {
        if (modalDetalles) modalDetalles.classList.remove('active');
        if (timerInterval) clearInterval(timerInterval);
    };

    if (btnCloseModalDetalles) btnCloseModalDetalles.addEventListener('click', cerrarModalDetalles);

    function iniciarTemporizadorPago(duracionSegundos) {
        let tiempoRestante = duracionSegundos;
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            let minutos = Math.floor(tiempoRestante / 60);
            let segundos = tiempoRestante % 60;

            minutos = minutos < 10 ? '0' + minutos : minutos;
            segundos = segundos < 10 ? '0' + segundos : segundos;

            if (tiempoRestanteSpan) {
                tiempoRestanteSpan.textContent = `${minutos}:${segundos}`;
            }

            if (--tiempoRestante < 0) {
                clearInterval(timerInterval);
                alert('El tiempo para abonar ha expirado. La reserva ha sido cancelada.');
                actualizarEstadoReserva('CANCELADA');
            }
        }, 1000);
    }

    if (btnPagarReserva) {
        btnPagarReserva.addEventListener('click', () => {
            actualizarEstadoReserva('CONFIRMADA');
        });
    }

    if (btnCancelarReservaModal) {
        btnCancelarReservaModal.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
                actualizarEstadoReserva('CANCELADA');
            }
        });
    }

 async function actualizarEstadoReserva(nuevoEstado) {
        try {
            const response = await fetch(`/api/reservas/${reservaSeleccionadaActual.id}/estado?estado=${nuevoEstado}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert(`Reserva actualizada a estado: ${nuevoEstado}`);
                
                // Limpiar el temporizador guardado para esta reserva si ya fue pagada o cancelada
                const storageKey = `timer_expira_${reservaSeleccionadaActual.id}`;
                sessionStorage.removeItem(storageKey);
                
                if (timerInterval) clearInterval(timerInterval);

                cerrarModalDetalles();
                cargarReservasUsuario(); // Recargar datos en pantalla
            } else {
                const err = await response.text();
                alert('No se pudo actualizar el estado: ' + err);
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    }

    // Inicializar
    cargarReservasUsuario();
});