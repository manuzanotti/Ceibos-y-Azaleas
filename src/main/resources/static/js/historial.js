document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión activa
    const usuarioId = sessionStorage.getItem('usuarioId');
    const usuarioNombre = sessionStorage.getItem('usuarioNombre');


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

    // 3. Cargar todo el historial de reservas desde la API
    async function cargarHistorialCompleto() {
        const tablaBody = document.getElementById('tablaHistorialCompleto');

        try {
            const response = await fetch(`/api/reservas/usuario/${usuarioId}`);
            
            if (response.ok) {
                const reservas = await response.json();
                
                if (!reservas || reservas.length === 0) {
                    tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">No registras historial de reservas todavía.</td></tr>`;
                    return;
                }

                // Ordenar de más reciente a más antigua
                reservas.sort((a, b) => b.id - a.id);

                let htmlTabla = '';
                reservas.forEach(reserva => {
                    const cabaniaNombre = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
                    const d1 = new Date(reserva.fechaCheckIn);
                    const d2 = new Date(reserva.fechaCheckOut);
                    const noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
                    
                    let estadoClase = 'completada';
                    let estadoTexto = reserva.estado || 'Confirmada';
                    if (estadoTexto.toLowerCase() === 'cancelada') {
                        estadoClase = 'cancelada';
                    }

                    htmlTabla += `
                        <tr>
                            <td>#${reserva.id}</td>
                            <td><strong>${cabaniaNombre}</strong></td>
                            <td>${reserva.fechaCheckIn}</td>
                            <td>${reserva.fechaCheckOut}</td>
                            <td>${noches} noches</td>
                            <td>$${(reserva.precioTotal || 0).toLocaleString('es-AR')}</td>
                            <td><span class="estado-badge ${estadoClase}">${estadoTexto}</span></td>
                        </tr>
                    `;
                });

                tablaBody.innerHTML = htmlTabla;
            } else {
                console.error('Error al obtener el historial.');
                tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">No se pudo cargar el historial de reservas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error de red:', error);
            tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">Error de conexión con el servidor.</td></tr>`;
        }
    }

    cargarHistorialCompleto();
});