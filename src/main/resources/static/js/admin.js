document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. NAVEGACIÓN ENTRE PESTAÑAS DEL PANEL
    // ==========================================
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.admin-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            button.classList.add('active');

            const targetSectionId = button.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // ==========================================
    // 2. GESTIÓN DE USUARIOS
    // ==========================================
    let listaUsuariosGlobal = [];

    async function cargarUsuariosAdmin() {
        try {
            const response = await fetch('/api/usuarios');
            if (response.ok) {
                listaUsuariosGlobal = await response.json();
                renderizarTablaUsuarios(listaUsuariosGlobal);
                
                const statUsuarios = document.getElementById('statUsuarios');
                if (statUsuarios) {
                    statUsuarios.textContent = listaUsuariosGlobal.length;
                }
            } else {
                console.error('Error al obtener los usuarios.');
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    }

    function renderizarTablaUsuarios(usuarios) {
        const tbody = document.getElementById('tablaUsuariosBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No se encontraron usuarios registrados.</td></tr>`;
            return;
        }

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.nombre || ''} ${usuario.apellido || ''}</td>
                <td>${usuario.email || ''}</td>
                <td>${usuario.dni || 'No especificado'}</td>
                <td>${usuario.telefono || 'No especificado'}</td>
                <td>
                    <button class="btn-danger-icon" onclick="desactivarCuenta(${usuario.id})" title="Eliminar usuario">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Filtro de búsqueda de usuarios en tiempo real
    const inputBuscar = document.getElementById('buscarUsuario');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const textoBusqueda = e.target.value.toLowerCase();
            
            const usuariosFiltrados = listaUsuariosGlobal.filter(usuario => {
                const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase();
                const email = (usuario.email || '').toLowerCase();
                const dni = (usuario.dni || '').toLowerCase();

                return nombreCompleto.includes(textoBusqueda) || 
                       email.includes(textoBusqueda) || 
                       dni.includes(textoBusqueda);
            });

            renderizarTablaUsuarios(usuariosFiltrados);
        });
    }

    // ==========================================
    // 3. GESTIÓN DE CABAÑAS
    // ==========================================
    let listaCabanasGlobal = [];

    async function cargarCabanasAdmin() {
        try {
            const response = await fetch('/api/cabanias');
            if (response.ok) {
                listaCabanasGlobal = await response.json();
                renderizarTablaCabanas(listaCabanasGlobal);
            } else {
                console.error('Error al obtener las cabañas.');
            }
        } catch (error) {
            console.error('Error de red al cargar cabañas:', error);
        }
    }

    function renderizarTablaCabanas(cabanas) {
        const tbody = document.getElementById('tablaCabanasBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (cabanas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No hay cabañas registradas.</td></tr>`;
            return;
        }

        cabanas.forEach(cabana => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${cabana.nombre || 'Sin nombre'}</strong></td>
                <td>${cabana.capacidad || 0} personas</td>
                <td>$${(cabana.precioNoche || 0).toLocaleString('es-AR')}</td>
                <td>
                    <button class="btn-danger-icon" onclick="eliminarCabana(${cabana.id})" title="Eliminar cabaña">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Evento para el botón "Nueva Cabaña"
    const btnNuevaCabana = document.getElementById('btnNuevaCabana');
    if (btnNuevaCabana) {
        btnNuevaCabana.addEventListener('click', () => {
            const nombre = prompt('Ingrese el nombre de la cabaña:');
            if (!nombre) return;

            const descripcion = prompt('Ingrese la descripción:');
            const capacidad = prompt('Ingrese la capacidad (número de personas):');
            const precioNoche = prompt('Ingrese el precio por noche ($):');
            const comodidades = prompt('Ingrese las comodidades:');

            if (nombre && capacidad && precioNoche) {
                crearCabana({
                    nombre: nombre,
                    descripcion: descripcion,
                    capacidad: parseInt(capacidad),
                    comodidades: comodidades,
                    precioNoche: parseFloat(precioNoche)
                });
            }
        });
    }

    async function crearCabana(cabanaDto) {
        try {
            const response = await fetch('/api/cabanias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cabanaDto)
            });

            if (response.ok) {
                alert('¡Cabaña creada con éxito!');
                cargarCabanasAdmin();
            } else {
                const errorMsg = await response.text();
                alert('No se pudo crear la cabaña: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    }

    // ==========================================
    // 4. GESTIÓN DE RESERVAS
    // ==========================================
    let listaReservasGlobal = [];
    let reservaAdminSeleccionada = null;
    let reservaIdEnEdicion = null;

    function obtenerEstilosEstadoAdmin(estado) {
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

    async function cargarReservasAdmin() {
        try {
            const response = await fetch('/api/reservas');
            if (response.ok) {
                listaReservasGlobal = await response.json();
                renderizarTablaReservasAdmin(listaReservasGlobal);

                // Estadísticas de reservas activas
                const statReservas = document.getElementById('statReservas');
                if (statReservas) {
                    const activas = listaReservasGlobal.filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
                    statReservas.textContent = activas;
                }

                // Cálculo de ingresos totales
                const statIngresos = document.getElementById('statIngresos');
                if (statIngresos) {
                    const totalIngresos = listaReservasGlobal
                        .filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA')
                        .reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
                    statIngresos.textContent = `$${totalIngresos.toLocaleString('es-AR')}`;
                }
            } else {
                console.error('Error al obtener el listado de reservas.');
            }
        } catch (error) {
            console.error('Error de red al cargar reservas:', error);
        }
    }

    function renderizarTablaReservasAdmin(reservas) {
        const tbody = document.getElementById('tablaReservasBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!reservas || reservas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay reservas registradas en el sistema.</td></tr>`;
            return;
        }

        reservas.sort((a, b) => b.id - a.id);

        reservas.forEach(reserva => {
            const usuarioNombre = reserva.usuario ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}` : 'Usuario N/D';
            const cabaniaNombre = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
            const estadoTexto = reserva.estado || 'PENDIENTE';
            const estilo = obtenerEstilosEstadoAdmin(estadoTexto);

            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.title = 'Haz clic para ver detalles';
            tr.innerHTML = `
                <td><strong>#${reserva.id}</strong></td>
                <td>${usuarioNombre}</td>
                <td>${cabaniaNombre}</td>
                <td>${reserva.checkIn || reserva.fechaCheckIn} al ${reserva.chekOut || reserva.fechaCheckOut}</td>
                <td>
                    <span style="background-color: ${estilo.bg}; color: ${estilo.color}; border: 1px solid ${estilo.border}; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; display: inline-block;">
                        ${estadoTexto}
                    </span>
                </td>
                <td>
                    <button class="btn-accion-modificar" onclick="event.stopPropagation(); abrirModalModificarReserva(${reserva.id})" title="Modificar reserva">
                        <i class="fa-solid fa-gear"></i> Modificar
                    </button>
                </td>
            `;

            // Clic en la fila para ver detalles rápidos (si mantienes el modal de detalles)
            tr.addEventListener('click', () => {
                reservaAdminSeleccionada = reserva;
                abrirModalAdminDetalles(reserva);
            });

            tbody.appendChild(tr);
        });
    }
// Lógica para el modal de detalles rápidos
    const modalAdmin = document.getElementById('modalAdminDetallesReserva');
    const btnCloseModalAdmin = document.getElementById('btnCloseModalAdmin');
    const btnAdminConfirmarReserva = document.getElementById('btnAdminConfirmarReserva');
    const btnAdminCancelarReserva = document.getElementById('btnAdminCancelarReserva');

    function abrirModalAdminDetalles(reserva) {
        const idTitulo = document.getElementById('adminDetIdTitulo');
        if (idTitulo) idTitulo.textContent = reserva.id;

        const usuarioNombre = reserva.usuario ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}` : 'Usuario N/D';
        const dniUsuario = reserva.usuario ? (reserva.usuario.dni || reserva.usuario.pasaporte || 'No especificado') : 'No especificado';
        const correoUsuario = reserva.usuario ? (reserva.usuario.email || 'No especificado') : 'No especificado';
        const telefonoUsuario = reserva.telefono || reserva.telefonoContacto || (reserva.usuario ? reserva.usuario.telefono : 'Sin teléfono');
        const cabaniaNombre = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');

        document.getElementById('adminDetUsuario').textContent = usuarioNombre;
        document.getElementById('adminDetDni').textContent = dniUsuario;
        document.getElementById('adminDetCabania').textContent = cabaniaNombre;
        document.getElementById('adminDetTelefono').textContent = telefonoUsuario;
        document.getElementById('adminDetCorreo').textContent = correoUsuario;

        const estadoSpan = document.getElementById('adminDetEstado');
        const estadoActual = reserva.estado || 'PENDIENTE';
        const estilo = obtenerEstilosEstadoAdmin(estadoActual);
        
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
        document.getElementById('adminDetCheckIn').textContent = fIn || 'N/D';
        document.getElementById('adminDetCheckOut').textContent = fOut || 'N/D';

        if (fIn && fOut) {
            const d1 = new Date(fIn);
            const d2 = new Date(fOut);
            const noches = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
            document.getElementById('adminDetNoches').textContent = `${noches} noches`;
        } else {
            document.getElementById('adminDetNoches').textContent = 'N/D';
        }

        document.getElementById('adminDetPrecio').textContent = `$${(reserva.precioTotal || 0).toLocaleString('es-AR')}`;

        if (modalAdmin) modalAdmin.style.display = 'flex';
    }

    const cerrarModalAdmin = () => {
        if (modalAdmin) modalAdmin.style.display = 'none';
    };

    if (btnCloseModalAdmin) btnCloseModalAdmin.addEventListener('click', cerrarModalAdmin);
    if (modalAdmin) {
        modalAdmin.addEventListener('click', (e) => {
            if (e.target === modalAdmin) cerrarModalAdmin();
        });
    }

    if (btnAdminConfirmarReserva) {
        btnAdminConfirmarReserva.addEventListener('click', () => actualizarEstadoReservaAdmin('CONFIRMADA'));
    }
    if (btnAdminCancelarReserva) {
        btnAdminCancelarReserva.addEventListener('click', () => actualizarEstadoReservaAdmin('CANCELADA'));
    }
    // ==========================================
    // 5. MODAL DE MODIFICACIÓN DE RESERVA
    // ==========================================
    const modalModificarReserva = document.getElementById('modalAdminModificarReserva');
    const btnCloseModalModificar = document.getElementById('btnCloseModalModificar');
    const btnAdminCancelarMod = document.getElementById('btnAdminCancelarMod');
    const formModificarReserva = document.getElementById('formModificarReserva');
    const btnAdminEliminarReserva = document.getElementById('btnAdminEliminarReserva');

    window.abrirModalModificarReserva = function(id) {
        const reserva = listaReservasGlobal.find(r => r.id === id);
        if (!reserva) return;

        reservaIdEnEdicion = id;
        document.getElementById('modReservaIdTitulo').textContent = id;
        document.getElementById('modReservaId').value = id;
        
        document.getElementById('modEstado').value = reserva.estado || 'PENDIENTE';
        document.getElementById('modCheckIn').value = reserva.checkIn || reserva.fechaCheckIn || '';
        document.getElementById('modCheckOut').value = reserva.chekOut || reserva.fechaCheckOut || '';
        document.getElementById('modAdultos').value = reserva.cantidadAdultos || 1;
        document.getElementById('modMenores').value = reserva.cantidadMenores || 0;
        document.getElementById('modTelefono').value = reserva.telefono || reserva.telefonoContacto || (reserva.usuario ? reserva.usuario.telefono : '');
        document.getElementById('modPrecioTotal').value = reserva.precioTotal || 0;

        // Rellenar selector de cabañas
        const selectCabania = document.getElementById('modCabania');
        selectCabania.innerHTML = '';
        listaCabanasGlobal.forEach(cabana => {
            const option = document.createElement('option');
            option.value = cabana.id;
            option.textContent = cabana.nombre;
            if (reserva.cabania && reserva.cabania.id === cabana.id) {
                option.selected = true;
            }
            selectCabania.appendChild(option);
        });

        if (modalModificarReserva) modalModificarReserva.style.display = 'flex';
    };

    const cerrarModalModificar = () => {
        if (modalModificarReserva) modalModificarReserva.style.display = 'none';
    };

    if (btnCloseModalModificar) btnCloseModalModificar.addEventListener('click', cerrarModalModificar);
    if (btnAdminCancelarMod) btnAdminCancelarMod.addEventListener('click', cerrarModalModificar);

    if (modalModificarReserva) {
        modalModificarReserva.addEventListener('click', (e) => {
            if (e.target === modalModificarReserva) cerrarModalModificar();
        });
    }

    // Guardar cambios del formulario de modificación
    if (formModificarReserva) {
        formModificarReserva.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!reservaIdEnEdicion) return;

            const reservaActualizada = {
                estado: document.getElementById('modEstado').value,
                cabaniaId: parseInt(document.getElementById('modCabania').value),
                checkIn: document.getElementById('modCheckIn').value,
                chekOut: document.getElementById('modCheckOut').value,
                cantidadAdultos: parseInt(document.getElementById('modAdultos').value),
                cantidadMenores: parseInt(document.getElementById('modMenores').value),
                telefono: document.getElementById('modTelefono').value,
                precioTotal: parseFloat(document.getElementById('modPrecioTotal').value)
            };

            try {
                const response = await fetch(`/api/reservas/${reservaIdEnEdicion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservaActualizada)
                });

                if (response.ok) {
                    alert('¡Reserva modificada con éxito!');
                    cerrarModalModificar();
                    cargarReservasAdmin();
                } else {
                    const err = await response.text();
                    alert('No se pudo modificar la reserva: ' + err);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // Botón eliminar reserva desde el modal de edición
    if (btnAdminEliminarReserva) {
        btnAdminEliminarReserva.addEventListener('click', async () => {
            if (!reservaIdEnEdicion) return;
            
            if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la reserva #${reservaIdEnEdicion}?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/reservas/${reservaIdEnEdicion}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Reserva eliminada correctamente.');
                    cerrarModalModificar();
                    cargarReservasAdmin();
                } else {
                    const errorMsg = await response.text();
                    alert('No se pudo eliminar la reserva: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // Funciones globales expuestas para eventos onclick en HTML dinámico
    window.desactivarCuenta = async function(id) {
        if (!confirm('¿Estás seguro de que deseas dar de baja este usuario?')) return;

        try {
            const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Usuario eliminado correctamente.');
                cargarUsuariosAdmin();
            } else {
                const errorMsg = await response.text();
                alert('No se pudo eliminar: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    };

    window.eliminarCabana = async function(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta cabaña?')) return;

        try {
            const response = await fetch(`/api/cabanias/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Cabaña eliminada correctamente.');
                cargarCabanasAdmin();
            } else {
                const errorMsg = await response.text();
                alert('No se pudo eliminar la cabaña (es probable que tenga reservas asociadas).');
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    };

    // ==========================================
    // INICIALIZACIÓN DE DATOS AL CARGAR LA PÁGINA
    // ==========================================
    cargarUsuariosAdmin();
    cargarCabanasAdmin();
    cargarReservasAdmin();
});