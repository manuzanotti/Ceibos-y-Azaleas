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
    let puntuacionActual = 5;

    // Función auxiliar para mostrar mensajes visuales dentro de las modales en lugar de alert()
    function mostrarMensajeModalReserva(mensaje, tipo = 'exito') {
        let alertContainer = document.getElementById('mensajeModalMisReservas');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'mensajeModalMisReservas';
            alertContainer.style.padding = '10px 14px';
            alertContainer.style.borderRadius = '6px';
            alertContainer.style.fontSize = '0.9rem';
            alertContainer.style.marginBottom = '15px';
            alertContainer.style.fontWeight = '500';
            
            const form = document.getElementById('formCrearResena') || document.getElementById('modalDetallesReserva');
            if (form) form.prepend(alertContainer);
        }

        if (tipo === 'exito') {
            alertContainer.style.backgroundColor = '#d1e7dd';
            alertContainer.style.color = '#0f5132';
            alertContainer.style.border = '1px solid #badbcc';
        } else {
            alertContainer.style.backgroundColor = '#f8d7da';
            alertContainer.style.color = '#842029';
            alertContainer.style.border = '1px solid #f5c2c7';
        }

        alertContainer.textContent = mensaje;
        alertContainer.style.display = 'block';

        setTimeout(() => {
            if (alertContainer) alertContainer.style.display = 'none';
        }, 4000);
    }

    // 3. Cargar las reservas y las reseñas del usuario desde la API de forma paralela
    async function cargarReservasUsuario() {
        try {
            const [responseReservas, responseResenias] = await Promise.all([
                fetch(`/api/reservas/usuario/${usuarioId}`),
                fetch(`/api/resenas/cliente`)
            ]);
            
            if (responseReservas.ok) {
                reservasGlobales = await responseReservas.json();
                
                let idsReseniasSet = new Set();
                if (responseResenias.ok) {
                    const reseniasUsuario = await responseResenias.json();
                    idsReseniasSet = new Set(reseniasUsuario.map(r => r.reservaId));
                }

                if (reservasGlobales.length > 0) {
                    // Ordenar de más reciente a más antigua
                    reservasGlobales.sort((a, b) => b.id - a.id);
                    
                    // Por defecto, seleccionamos la más reciente para mostrar arriba
                    reservaSeleccionadaActual = reservasGlobales[0];
                    renderizarTarjetaPrincipal(reservaSeleccionadaActual);
                    renderizarHistorial(reservasGlobales, idsReseniasSet);
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
        const fOut = reserva.checkOut || reserva.fechaCheckOut;
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
    function renderizarHistorial(reservas, idsReseniasSet = new Set()) {
        const tablaBody = document.getElementById('tablaHistorialBody');
        if (!tablaBody) return;

        // Tomar solo las primeras 5 reservas
        const ultimasCinco = reservas.slice(0, 5);
        let htmlTabla = '';

        ultimasCinco.forEach((reserva) => {
            const cabaniaNombre = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
            const resIn = reserva.checkIn || reserva.fechaCheckIn;
            const resOut = reserva.checkOut || reserva.fechaCheckOut;
            
            let noches = 1;
            if (resIn && resOut) {
                const d1 = new Date(resIn);
                const d2 = new Date(resOut);
                noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
            }
            
            const estadoTexto = reserva.estado || 'PENDIENTE';
            const estilo = obtenerEstilosEstado(estadoTexto);
            const esSeleccionada = reserva.id === reservaSeleccionadaActual.id;

            // Validar si ya tiene reseña o si se puede reseñar
            const yaReseñada = idsReseniasSet.has(reserva.id);
            const puedeReseniar = (estadoTexto === 'CONFIRMADA' || estadoTexto === 'FINALIZADA') && !yaReseñada;

            let botonResenaHtml = '';
            if (yaReseñada) {
                botonResenaHtml = `<span style="color: #198754; font-size: 0.85rem; font-weight: 600;"><i class="fa-solid fa-check"></i> Reseñada</span>`;
            } else if (puedeReseniar) {
                botonResenaHtml = `<button class="btn-secondary-sm" onclick="event.stopPropagation(); abrirModalCrearResena(${reserva.id}, '${cabaniaNombre}')" style="background-color: #2c332e; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;"><i class="fa-solid fa-star" style="color: #ffc107;"></i> Reseñar</button>`;
            } else {
                botonResenaHtml = `<span style="color: #9ca3af; font-size: 0.85rem; font-style: italic;">No disponible</span>`;
            }

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
                    <td>${botonResenaHtml}</td>
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
                    cargarReservasUsuario(); // Recarga para mantener el estado actualizado de las reseñas
                }
            });

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
            tablaBody.innerHTML = `<tr><td colspan="6" class="table-empty">Aún no tienes reservas registradas.</td></tr>`;
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

    if (btnVerDetalles) {
        btnVerDetalles.addEventListener('click', () => {
            if (!reservaSeleccionadaActual) return;

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

            const nombreCabana = reservaSeleccionadaActual.cabania ? reservaSeleccionadaActual.cabania.nombre : (reservaSeleccionadaActual.cabanaNombre || 'Cabaña');
            document.getElementById('detCabaniaNombre').textContent = nombreCabana;

            const fIn = reservaSeleccionadaActual.checkIn || reservaSeleccionadaActual.fechaCheckIn;
            const fOut = reservaSeleccionadaActual.checkOut || reservaSeleccionadaActual.fechaCheckOut;
            document.getElementById('detCheckIn').textContent = fIn || 'N/D';
            document.getElementById('detCheckOut').textContent = fOut || 'N/D';

            const adultos = reservaSeleccionadaActual.cantidadAdultos || 1;
            const menores = reservaSeleccionadaActual.cantidadMenores || 0;
            let textoHuespedes = `${adultos} Adultos`;
            if (menores > 0) {
                textoHuespedes += `, ${menores} Menores`;
            }
            document.getElementById('detHuespedes').textContent = textoHuespedes;

            const telefonoContacto = 
                reservaSeleccionadaActual.telefono || 
                (reservaSeleccionadaActual.usuario ? reservaSeleccionadaActual.usuario.telefono : null) || 
                reservaSeleccionadaActual.telefonoContacto || 
                'Sin teléfono';
            document.getElementById('detTelefono').textContent = telefonoContacto;

            document.getElementById('detPrecioTotal').textContent = `$${(reservaSeleccionadaActual.precioTotal || 0).toLocaleString('es-AR')}`;

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
                mostrarMensajeModalReserva('El tiempo para abonar ha expirado. La reserva ha sido cancelada.', 'error');
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
            actualizarEstadoReserva('CANCELADA');
        });
    }

    async function actualizarEstadoReserva(nuevoEstado) {
        try {
            const response = await fetch(`/api/reservas/${reservaSeleccionadaActual.id}/estado?estado=${nuevoEstado}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                mostrarMensajeModalReserva(`Reserva actualizada a estado: ${nuevoEstado}`, 'exito');
                
                const storageKey = `timer_expira_${reservaSeleccionadaActual.id}`;
                sessionStorage.removeItem(storageKey);
                
                if (timerInterval) clearInterval(timerInterval);

                setTimeout(() => {
                    cerrarModalDetalles();
                    cargarReservasUsuario(); 
                }, 1000);
            } else {
                const err = await response.text();
                mostrarMensajeModalReserva('No se pudo actualizar el estado: ' + err, 'error');
            }
        } catch (error) {
            console.error('Error de red:', error);
            mostrarMensajeModalReserva('Error de conexión con el servidor.', 'error');
        }
    }

    // ==========================================
    // LÓGICA DE LA MODAL DE CREAR RESEÑA
    // ==========================================
    const modalCrearResena = document.getElementById('modalCrearResena');
    const btnCloseModalResena = document.getElementById('btnCloseModalResena');
    const btnCancelarResena = document.getElementById('btnCancelarResena');
    const formCrearResena = document.getElementById('formCrearResena');
    const stars = document.querySelectorAll('#starContainer i');

    window.abrirModalCrearResena = function(reservaId, cabaniaNombre) {
        const inputId = document.getElementById('inputReservaId');
        const spanCabania = document.getElementById('modalCabaniaNombre');
        const txtComentario = document.getElementById('inputComentario');

        if (inputId) inputId.value = reservaId;
        if (spanCabania) spanCabania.textContent = cabaniaNombre;
        if (txtComentario) txtComentario.value = '';

        seleccionarEstrellas(5);
        if (modalCrearResena) modalCrearResena.classList.add('active');
    };

    const cerrarModalResena = () => {
        if (modalCrearResena) modalCrearResena.classList.remove('active');
    };

    if (btnCloseModalResena) btnCloseModalResena.addEventListener('click', cerrarModalResena);
    if (btnCancelarResena) btnCancelarResena.addEventListener('click', cerrarModalResena);

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            seleccionarEstrellas(val);
        });
    });

    function seleccionarEstrellas(valor) {
        puntuacionActual = valor;
        const inputPuntuacion = document.getElementById('inputPuntuacion');
        if (inputPuntuacion) inputPuntuacion.value = valor;

        stars.forEach(star => {
            const starVal = parseInt(star.getAttribute('data-value'));
            if (starVal <= valor) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            } else {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
        });
    }

    if (formCrearResena) {
        formCrearResena.addEventListener('submit', async (e) => {
            e.preventDefault();

            const reservaId = document.getElementById('inputReservaId').value;
            const comentario = document.getElementById('inputComentario').value;
            const cabaniaNombre = document.getElementById('modalCabaniaNombre').textContent;
            const reservaObj = reservasGlobales.find(r => r.id == reservaId);

            const fechasEstadia = reservaObj ? `${reservaObj.checkIn || reservaObj.fechaCheckIn} al ${reservaObj.checkOut || reservaObj.fechaCheckOut}` : 'N/D';

            const nuevaResena = {
                cabaniaNombre: cabaniaNombre,
                huespedNombre: usuarioNombre || 'Huésped',
                fechasEstadia: fechasEstadia,
                puntuacion: puntuacionActual,
                comentario: comentario
            };

            try {
                const response = await fetch(`/api/resenas?reservaId=${reservaId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaResena)
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || 'No se pudo guardar la reseña.');
                }

                mostrarMensajeModalReserva('¡Reseña enviada con éxito!', 'exito');
                setTimeout(() => {
                    cerrarModalResena();
                    cargarReservasUsuario(); 
                }, 1000);
            } catch (error) {
                console.error('Error:', error);
                mostrarMensajeModalReserva('Error al enviar la reseña: ' + error.message, 'error');
            }
        });
    }

    // Inicializar
    cargarReservasUsuario();
});