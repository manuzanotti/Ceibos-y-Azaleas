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

    let historialGlobal = [];
    let reservaSeleccionadaActual = null;
    let timerInterval = null;

    // Función auxiliar para los estilos visuales de los estados
    function obtenerEstilosEstado(estado) {
        switch (estado ? estado.toUpperCase() : '') {
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

    // 3. Cargar todo el historial de reservas desde la API (limitado a 20 en vista)
    async function cargarHistorialCompleto() {
        const tablaBody = document.getElementById('tablaHistorialCompleto');

        try {
            const response = await fetch(`/api/reservas/usuario/${usuarioId}`);
            
            if (response.ok) {
                const reservasCompletas = await response.json();
                
                if (!reservasCompletas || reservasCompletas.length === 0) {
                    tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">No registras historial de reservas todavía.</td></tr>`;
                    return;
                }

                // Ordenar de más reciente a más antigua y limitar a un máximo de 20 para la vista con scroll
                reservasCompletas.sort((a, b) => b.id - a.id);
                historialGlobal = reservasCompletas.slice(0, 20);

                let htmlTabla = '';
                historialGlobal.forEach(reserva => {
                    const cabaniaNombre = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
                    const d1 = new Date(reserva.checkIn);
                    const d2 = new Date(reserva.chekOut);
                    const noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
                    
                    const estadoTexto = reserva.estado || 'CONFIRMADA';
                    const estilo = obtenerEstilosEstado(estadoTexto);

                    htmlTabla += `
                        <tr class="fila-reserva" data-id="${reserva.id}" title="Haz clic para ver detalles completos">
                            <td>#${reserva.id}</td>
                            <td><strong>${cabaniaNombre}</strong></td>
                            <td>${reserva.checkIn}</td>
                            <td>${reserva.chekOut}</td>
                            <td>${noches}</td>
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

                // Añadir interactividad de clic a cada fila
                const filas = tablaBody.querySelectorAll('.fila-reserva');
                filas.forEach(fila => {
                    fila.addEventListener('click', () => {
                        const idReserva = parseInt(fila.getAttribute('data-id'));
                        reservaSeleccionadaActual = historialGlobal.find(r => r.id === idReserva);
                        if (reservaSeleccionadaActual) {
                            abrirModalDetalles(reservaSeleccionadaActual);
                        }
                    });
                });

            } else {
                console.error('Error al obtener el historial.');
                tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">No se pudo cargar el historial de reservas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error de red:', error);
            tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">Error de conexión con el servidor.</td></tr>`;
        }
    }

    // Lógica del Modal de Detalles
    const modalDetalles = document.getElementById('modalDetallesReserva');
    const btnCloseModalDetalles = document.getElementById('btnCloseModalDetalles');
    const paymentTimerContainer = document.getElementById('paymentTimerContainer');
    const tiempoRestanteSpan = document.getElementById('tiempoRestante');
    const modalAccionesPago = document.getElementById('modalAccionesPago');
    const btnPagarReserva = document.getElementById('btnPagarReserva');
    const btnCancelarReservaModal = document.getElementById('btnCancelarReservaModal');

    function abrirModalDetalles(reserva) {
        const nombreCabana = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
        document.getElementById('detCabaniaNombre').textContent = nombreCabana;
        
        const estadoSpan = document.getElementById('detEstado');
        const estadoActual = reserva.estado || 'PENDIENTE';
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

        const fIn = reserva.checkIn || reserva.fechaCheckIn;
        const fOut = reserva.chekOut || reserva.fechaCheckOut;
        document.getElementById('detCheckIn').textContent = fIn || 'N/D';
        document.getElementById('detCheckOut').textContent = fOut || 'N/D';

        const adultos = reserva.cantidadAdultos || 1;
        const menores = reserva.cantidadMenores || 0;
        let textoHuespedes = `${adultos} Adultos`;
        if (menores > 0) {
            textoHuespedes += `, ${menores} Menores`;
        }
        document.getElementById('detHuespedes').textContent = textoHuespedes;

        const telefonoContacto = 
            reserva.telefono || 
            reserva.telefonoContacto || 
            (reserva.usuario ? reserva.usuario.telefono : null) || 
            'Sin teléfono';
        document.getElementById('detTelefono').textContent = telefonoContacto;

        document.getElementById('detPrecioTotal').textContent = `$${(reserva.precioTotal || 0).toLocaleString('es-AR')}`;

        if (estadoActual === 'PENDIENTE') {
            paymentTimerContainer.style.display = 'flex';
            modalAccionesPago.style.display = 'flex';
            
            const storageKey = `timer_expira_${reserva.id}`;
            let tiempoRestanteSegundos;
            const tiempoGuardado = sessionStorage.getItem(storageKey);
            const ahora = Math.floor(Date.now() / 1000);

            if (tiempoGuardado) {
                tiempoRestanteSegundos = parseInt(tiempoGuardado) - ahora;
                if (tiempoRestanteSegundos <= 0) tiempoRestanteSegundos = 0;
            } else {
                tiempoRestanteSegundos = 10 * 60;
                sessionStorage.setItem(storageKey, ahora + tiempoRestanteSegundos);
            }

            iniciarTemporizadorPago(tiempoRestanteSegundos); 
        } else {
            paymentTimerContainer.style.display = 'none';
            modalAccionesPago.style.display = 'none';
        }

        modalDetalles.classList.add('active');
    }

    const cerrarModalDetalles = () => {
        if (modalDetalles) modalDetalles.classList.remove('active');
        if (timerInterval) clearInterval(timerInterval);
    };

    if (btnCloseModalDetalles) btnCloseModalDetalles.addEventListener('click', cerrarModalDetalles);

    if (modalDetalles) {
        modalDetalles.addEventListener('click', (e) => {
            if (e.target === modalDetalles) {
                cerrarModalDetalles();
            }
        });
    }

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
        btnPagarReserva.addEventListener('click', () => actualizarEstadoReserva('CONFIRMADA'));
    }

    if (btnCancelarReservaModal) {
        btnCancelarReservaModal.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
                actualizarEstadoReserva('CANCELADA');
            }
        });
    }

    async function actualizarEstadoReserva(nuevoEstado) {
        if (!reservaSeleccionadaActual) return;
        try {
            const response = await fetch(`/api/reservas/${reservaSeleccionadaActual.id}/estado?estado=${nuevoEstado}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert(`Reserva actualizada a estado: ${nuevoEstado}`);
                const storageKey = `timer_expira_${reservaSeleccionadaActual.id}`;
                sessionStorage.removeItem(storageKey);
                if (timerInterval) clearInterval(timerInterval);

                cerrarModalDetalles();
                cargarHistorialCompleto(); 
            } else {
                const err = await response.text();
                alert('No se pudo actualizar el estado: ' + err);
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    }

    cargarHistorialCompleto();
});