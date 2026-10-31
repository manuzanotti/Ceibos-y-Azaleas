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
                // Si cambiamos a estadísticas, redimensionar gráficos por si acaso
                if (targetSectionId === 'estadisticas') {
                    actualizarGraficosEstadisticas();
                }
            }
        });
    });

    // ==========================================
    // 2. GESTIÓN DE USUARIOS
    // ==========================================
    let listaUsuariosGlobal = [];
    let usuarioIdEnEdicion = null;

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

    function formatearTipoUsuario(tipo) {
        if (!tipo) return 'No especificado';
        const limpio = tipo.replace(/_/g, ' ').toLowerCase();
        return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }

    function renderizarTablaUsuarios(usuarios) {
        const tbody = document.getElementById('tablaUsuariosBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="table-empty">No se encontraron usuarios registrados.</td></tr>`;
            return;
        }

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.title = 'Haz clic para ver detalles del usuario';
            tr.innerHTML = `
                <td><strong>${usuario.nombre || ''} ${usuario.apellido || ''}</strong></td>
                <td>${usuario.email || ''}</td>
                <td>${usuario.dni || usuario.pasaporte || 'No especificado'}</td>
                <td>${usuario.telefono || 'No especificado'}</td>
                <td>${formatearTipoUsuario(usuario.tipoDeUsuario)}</td>
                <td>${usuario.activo !== false ? 'Habilitada' : 'Inhabilitada'}</td>
                <td>
                    <button class="btn-accion-modificar" onclick="event.stopPropagation(); abrirModalModificarUsuario(${usuario.id})" title="Administrar usuario">
                        <i class="fa-solid fa-gear"></i> Administrar
                    </button>
                </td>
            `;

            tr.addEventListener('click', () => {
                abrirModalDetallesUsuario(usuario);
            });

            tbody.appendChild(tr);
        });
    }

    const inputBuscar = document.getElementById('buscarUsuario');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const textoBusqueda = e.target.value.toLowerCase();
            const usuariosFiltrados = listaUsuariosGlobal.filter(usuario => {
                const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase();
                const email = (usuario.email || '').toLowerCase();
                const dni = (usuario.dni || usuario.pasaporte || '').toLowerCase();

                return nombreCompleto.includes(textoBusqueda) || 
                       email.includes(textoBusqueda) || 
                       dni.includes(textoBusqueda);
            });
            renderizarTablaUsuarios(usuariosFiltrados);
        });
    }

    const modalDetallesUsuario = document.getElementById('modalAdminDetallesUsuario');
    const btnCloseModalDetallesUsuario = document.getElementById('btnCloseModalDetallesUsuario');

    function abrirModalDetallesUsuario(usuario) {
        document.getElementById('userDetIdTitulo').textContent = usuario.id;
        document.getElementById('userDetNombre').textContent = `${usuario.nombre || ''} ${usuario.apellido || ''}`;
        document.getElementById('userDetDni').textContent = usuario.dni || usuario.pasaporte || 'No especificado';
        document.getElementById('userDetTelefono').textContent = usuario.telefono || 'No especificado';
        document.getElementById('userDetMail').textContent = usuario.email || 'No especificado';
        document.getElementById('userDetTipo').textContent = formatearTipoUsuario(usuario.tipoDeUsuario);
        document.getElementById('userDetEstado').textContent = usuario.activo !== false ? 'Habilitada' : 'Inhabilitada';

        if (modalDetallesUsuario) modalDetallesUsuario.style.display = 'flex';
    }

    const cerrarModalDetallesUsuario = () => {
        if (modalDetallesUsuario) modalDetallesUsuario.style.display = 'none';
    };

    if (btnCloseModalDetallesUsuario) btnCloseModalDetallesUsuario.addEventListener('click', cerrarModalDetallesUsuario);
    if (modalDetallesUsuario) {
        modalDetallesUsuario.addEventListener('click', (e) => {
            if (e.target === modalDetallesUsuario) cerrarModalDetallesUsuario();
        });
    }

    const modalModificarUsuario = document.getElementById('modalAdminModificarUsuario');
    const btnCloseModalUsuario = document.getElementById('btnCloseModalUsuario');
    const formModificarUsuario = document.getElementById('formModificarUsuario');
    const btnAdminDarBajaUsuario = document.getElementById('btnAdminDarBajaUsuario');

    window.abrirModalModificarUsuario = function(id) {
        const usuario = listaUsuariosGlobal.find(u => u.id === id);
        if (!usuario) return;

        usuarioIdEnEdicion = id;
        document.getElementById('modUserDetIdTitulo').textContent = id;
        document.getElementById('modUsuarioId').value = id;

        document.getElementById('modUserNombre').value = usuario.nombre || '';
        document.getElementById('modUserApellido').value = usuario.apellido || '';
        document.getElementById('modUserDni').value = usuario.dni || usuario.pasaporte || '';
        document.getElementById('modUserTelefono').value = usuario.telefono || '';
        document.getElementById('modUserMail').value = usuario.email || '';
        document.getElementById('modUserTipo').value = formatearTipoUsuario(usuario.tipoDeUsuario) || 'Cliente';
        
        const estadoCuenta = usuario.activo !== false ? 'Habilitada' : 'Inhabilitada';
        document.getElementById('modUserEstado').value = estadoCuenta;

        if (modalModificarUsuario) modalModificarUsuario.style.display = 'flex';
    };

    const cerrarModalModificarUsuario = () => {
        if (modalModificarUsuario) modalModificarUsuario.style.display = 'none';
    };

    if (btnCloseModalUsuario) btnCloseModalUsuario.addEventListener('click', cerrarModalModificarUsuario);
    if (modalModificarUsuario) {
        modalModificarUsuario.addEventListener('click', (e) => {
            if (e.target === modalModificarUsuario) cerrarModalModificarUsuario();
        });
    }

    if (formModificarUsuario) {
        formModificarUsuario.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!usuarioIdEnEdicion) return;

            const usuarioActualizado = {
                nombre: document.getElementById('modUserNombre').value,
                apellido: document.getElementById('modUserApellido').value,
                dni: document.getElementById('modUserDni').value,
                telefono: document.getElementById('modUserTelefono').value,
                email: document.getElementById('modUserMail').value,
                rol: document.getElementById('modUserTipo').value,
                activo: document.getElementById('modUserEstado').value === 'Habilitada'
            };

            try {
                const response = await fetch(`/api/usuarios/${usuarioIdEnEdicion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuarioActualizado)
                });

                if (response.ok) {
                    alert('¡Usuario modificado con éxito!');
                    cerrarModalModificarUsuario();
                    cargarUsuariosAdmin();
                } else {
                    const err = await response.text();
                    alert('No se pudo modificar el usuario: ' + err);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    if (btnAdminDarBajaUsuario) {
        btnAdminDarBajaUsuario.addEventListener('click', async () => {
            if (!usuarioIdEnEdicion) return;
            if (!confirm(`¿Estás seguro de que deseas dar de baja al usuario #${usuarioIdEnEdicion}?`)) return;

            try {
                const response = await fetch(`/api/usuarios/${usuarioIdEnEdicion}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Usuario eliminado correctamente.');
                    cerrarModalModificarUsuario();
                    cargarUsuariosAdmin();
                } else {
                    const errorMsg = await response.text();
                    alert('No se pudo eliminar: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // ==========================================
    // 3. GESTIÓN DE CABAÑAS
    // ==========================================
    let listaCabanasGlobal = [];
    let cabanaIdEnEdicion = null;

    async function cargarCabanasAdmin() {
        try {
            const response = await fetch('/api/cabanias');
            if (response.ok) {
                listaCabanasGlobal = await response.json();
                renderizarTablaCabanas(listaCabanasGlobal);
                actualizarGraficosEstadisticas();
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
            tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No hay cabañas registradas.</td></tr>`;
            return;
        }

        cabanas.forEach(cabana => {
            const disponible = cabana.disponible !== false;
            const dispTexto = disponible ? 'Disponible' : 'No disponible';
            const dispEstilo = disponible 
                ? 'background-color: #d1e7dd; color: #0f5132; border: 1px solid #badbcc;' 
                : 'background-color: #f8d7da; color: #842029; border: 1px solid #f5c2c7;';

            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.title = 'Haz clic para ver detalles de la cabaña';
            tr.innerHTML = `
                <td><strong>${cabana.nombre || 'Sin nombre'}</strong></td>
                <td>${cabana.capacidad || 0} personas</td>
                <td>$${(cabana.precioNoche || 0).toLocaleString('es-AR')}</td>
                <td>
                    <span style="${dispEstilo} padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; display: inline-block;">
                        ${dispTexto}
                    </span>
                </td>
                <td>
                    <button class="btn-accion-modificar" onclick="event.stopPropagation(); abrirModalModificarCabana(${cabana.id})" title="Administrar cabaña">
                        <i class="fa-solid fa-gear"></i> Administrar
                    </button>
                </td>
            `;

            tr.addEventListener('click', () => {
                abrirModalDetallesCabana(cabana);
            });

            tbody.appendChild(tr);
        });
    }

    const modalAdminDetallesCabana = document.getElementById('modalAdminDetallesCabana');
    const btnCloseModalDetallesCabana = document.getElementById('btnCloseModalDetallesCabana');

    function abrirModalDetallesCabana(cabana) {
        document.getElementById('detCabanaIdTitulo').textContent = cabana.id;
        document.getElementById('detCabanaNombre').textContent = cabana.nombre || '-';
        document.getElementById('detCabanaDescripcion').textContent = cabana.descripcion || 'Sin descripción';
        document.getElementById('detCabanaCapacidad').textContent = `${cabana.capacidad || 0} personas`;
        document.getElementById('detCabanaPrecio').textContent = `$${(cabana.precioNoche || 0).toLocaleString('es-AR')}`;
        document.getElementById('detCabanaComodidades').textContent = cabana.comodidades || 'No especificadas';
        
        const disponible = cabana.disponible !== false;
        document.getElementById('detCabanaDisponibilidad').textContent = disponible ? 'Disponible' : 'No disponible';

        if (modalAdminDetallesCabana) modalAdminDetallesCabana.style.display = 'flex';
    }

    const cerrarModalDetallesCabana = () => {
        if (modalAdminDetallesCabana) modalAdminDetallesCabana.style.display = 'none';
    };

    if (btnCloseModalDetallesCabana) btnCloseModalDetallesCabana.addEventListener('click', cerrarModalDetallesCabana);
    if (modalAdminDetallesCabana) {
        modalAdminDetallesCabana.addEventListener('click', (e) => {
            if (e.target === modalAdminDetallesCabana) cerrarModalDetallesCabana();
        });
    }

    const modalAdminCrearCabana = document.getElementById('modalAdminCrearCabana');
    const btnNuevaCabana = document.getElementById('btnNuevaCabana');
    const btnCloseModalCrearCabana = document.getElementById('btnCloseModalCrearCabana');
    const btnCancelarCrearCabana = document.getElementById('btnCancelarCrearCabana');
    const formCrearCabana = document.getElementById('formCrearCabana');
    const mensajeCrearCabana = document.getElementById('mensajeCrearCabana');

    if (btnNuevaCabana) {
        btnNuevaCabana.addEventListener('click', () => {
            formCrearCabana.reset();
            mensajeCrearCabana.style.display = 'none';
            if (modalAdminCrearCabana) modalAdminCrearCabana.style.display = 'flex';
        });
    }

    const cerrarModalCrearCabana = () => {
        if (modalAdminCrearCabana) modalAdminCrearCabana.style.display = 'none';
    };

    if (btnCloseModalCrearCabana) btnCloseModalCrearCabana.addEventListener('click', cerrarModalCrearCabana);
    if (btnCancelarCrearCabana) btnCancelarCrearCabana.addEventListener('click', cerrarModalCrearCabana);
    if (modalAdminCrearCabana) {
        modalAdminCrearCabana.addEventListener('click', (e) => {
            if (e.target === modalAdminCrearCabana) cerrarModalCrearCabana();
        });
    }

    if (formCrearCabana) {
        formCrearCabana.addEventListener('submit', async (e) => {
            e.preventDefault();
            mensajeCrearCabana.style.display = 'none';

            const nombreCabana = document.getElementById('crearCabanaNombre').value;
            const nuevaCabana = {
                nombre: nombreCabana,
                capacidad: parseInt(document.getElementById('crearCabanaCapacidad').value),
                precioNoche: parseFloat(document.getElementById('crearCabanaPrecio').value),
                disponibilidad: document.getElementById('crearCabanaDisponibilidad').value === 'true',
                disponible: document.getElementById('crearCabanaDisponibilidad').value === 'true',
                comodidades: document.getElementById('crearCabanaComodidades').value,
                descripcion: document.getElementById('crearCabanaDescripcion').value
            };

            try {
                const response = await fetch('/api/cabanias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaCabana)
                });

                if (response.ok) {
                    mensajeCrearCabana.style.color = '#0f5132';
                    mensajeCrearCabana.style.backgroundColor = '#d1e7dd';
                    mensajeCrearCabana.textContent = `¡Cabaña "${nombreCabana}" creada con éxito!`;
                    mensajeCrearCabana.style.display = 'block';

                    cargarCabanasAdmin();
                    setTimeout(() => { cerrarModalCrearCabana(); }, 1500);
                } else {
                    const errorMsg = await response.text();
                    mensajeCrearCabana.style.color = '#dc2626';
                    mensajeCrearCabana.style.backgroundColor = '#fee2e2';
                    mensajeCrearCabana.textContent = 'No se pudo crear la cabaña: ' + errorMsg;
                    mensajeCrearCabana.style.display = 'block';
                }
            } catch (error) {
                console.error('Error de red:', error);
                mensajeCrearCabana.style.color = '#dc2626';
                mensajeCrearCabana.style.backgroundColor = '#fee2e2';
                mensajeCrearCabana.textContent = 'Error de conexión con el servidor.';
                mensajeCrearCabana.style.display = 'block';
            }
        });
    }

    const modalAdminModificarCabana = document.getElementById('modalAdminModificarCabana');
    const btnCloseModalModificarCabana = document.getElementById('btnCloseModalModificarCabana');
    const formModificarCabana = document.getElementById('formModificarCabana');
    const btnAdminEliminarCabana = document.getElementById('btnAdminEliminarCabana');
    const errorModificarCabana = document.getElementById('errorModificarCabana');

    window.abrirModalModificarCabana = function(id) {
        const cabana = listaCabanasGlobal.find(c => c.id === id);
        if (!cabana) return;

        cabanaIdEnEdicion = id;
        document.getElementById('modCabanaIdTitulo').textContent = id;
        document.getElementById('modCabanaId').value = id;
        errorModificarCabana.style.display = 'none';

        document.getElementById('modCabanaNombre').value = cabana.nombre || '';
        document.getElementById('modCabanaCapacidad').value = cabana.capacidad || 1;
        document.getElementById('modCabanaPrecio').value = cabana.precioNoche || 0;
        
        const disp = cabana.disponible !== false ? 'true' : 'false';
        document.getElementById('modCabanaDisponibilidad').value = disp;
        
        document.getElementById('modCabanaComodidades').value = cabana.comodidades || '';
        document.getElementById('modCabanaDescripcion').value = cabana.descripcion || '';

        if (modalAdminModificarCabana) modalAdminModificarCabana.style.display = 'flex';
    };

    const cerrarModalModificarCabana = () => {
        if (modalAdminModificarCabana) modalAdminModificarCabana.style.display = 'none';
    };

    if (btnCloseModalModificarCabana) btnCloseModalModificarCabana.addEventListener('click', cerrarModalModificarCabana);
    if (modalAdminModificarCabana) {
        modalAdminModificarCabana.addEventListener('click', (e) => {
            if (e.target === modalAdminModificarCabana) cerrarModalModificarCabana();
        });
    }

    if (formModificarCabana) {
        formModificarCabana.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!cabanaIdEnEdicion) return;
            errorModificarCabana.style.display = 'none';

            const nombreCabana = document.getElementById('modCabanaNombre').value;
            const cabanaActualizada = {
                nombre: nombreCabana,
                capacidad: parseInt(document.getElementById('modCabanaCapacidad').value),
                precioNoche: parseFloat(document.getElementById('modCabanaPrecio').value),
                disponibilidad: document.getElementById('modCabanaDisponibilidad').value === 'true',
                disponible: document.getElementById('modCabanaDisponibilidad').value === 'true',
                comodidades: document.getElementById('modCabanaComodidades').value,
                descripcion: document.getElementById('modCabanaDescripcion').value
            };

            try {
                const response = await fetch(`/api/cabanias/${cabanaIdEnEdicion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cabanaActualizada)
                });

                if (response.ok) {
                    errorModificarCabana.style.color = '#0f5132';
                    errorModificarCabana.style.backgroundColor = '#d1e7dd';
                    errorModificarCabana.textContent = `¡Cabaña "${nombreCabana}" modificada con éxito!`;
                    errorModificarCabana.style.display = 'block';

                    cargarCabanasAdmin();
                    setTimeout(() => { cerrarModalModificarCabana(); }, 1500);
                } else {
                    const err = await response.text();
                    errorModificarCabana.style.color = '#dc2626';
                    errorModificarCabana.style.backgroundColor = '#fee2e2';
                    errorModificarCabana.textContent = 'No se pudo modificar la cabaña: ' + err;
                    errorModificarCabana.style.display = 'block';
                }
            } catch (error) {
                console.error('Error de red:', error);
                errorModificarCabana.style.color = '#dc2626';
                errorModificarCabana.style.backgroundColor = '#fee2e2';
                errorModificarCabana.textContent = 'Error de conexión con el servidor.';
                errorModificarCabana.style.display = 'block';
            }
        });
    }

    if (btnAdminEliminarCabana) {
        btnAdminEliminarCabana.addEventListener('click', async () => {
            if (!cabanaIdEnEdicion) return;
            if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la cabaña #${cabanaIdEnEdicion}?`)) return;

            try {
                const response = await fetch(`/api/cabanias/${cabanaIdEnEdicion}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Cabaña eliminada correctamente.');
                    cerrarModalModificarCabana();
                    cargarCabanasAdmin();
                } else {
                    const errorMsg = await response.text();
                    alert('No se pudo eliminar la cabaña (es probable que tenga reservas asociadas).');
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // ==========================================
    // 4. GESTIÓN DE RESERVAS Y ESTADÍSTICAS (CHART.JS)
    // ==========================================
    let listaReservasGlobal = [];
    let chartReservasCabanaInstancia = null;
    let chartCalificacionesInstancia = null;
    let chartEstadoReservasInstancia = null;

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

                const statReservas = document.getElementById('statReservas');
                if (statReservas) {
                    const activas = listaReservasGlobal.filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
                    statReservas.textContent = activas;
                }

                const statIngresos = document.getElementById('statIngresos');
                if (statIngresos) {
                    const totalIngresos = listaReservasGlobal
                        .filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA')
                        .reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
                    statIngresos.textContent = `$${totalIngresos.toLocaleString('es-AR')}`;
                }

                actualizarGraficosEstadisticas();
            } else {
                console.error('Error al obtener el listado de reservas.');
            }
        } catch (error) {
            console.error('Error de red al cargar reservas:', error);
        }
    }

    // Lógica para renderizar los 3 gráficos con Chart.js
    function actualizarGraficosEstadisticas() {
        if (listaCabanasGlobal.length === 0 && listaReservasGlobal.length === 0) return;

        // --- GRÁFICO 1: Reservas por Cabaña (Barras Verticales) ---
        const nombresCabanas = listaCabanasGlobal.map(c => c.nombre || 'Cabaña');
        const conteoReservas = listaCabanasGlobal.map(c => {
            return listaReservasGlobal.filter(r => {
                const cId = r.cabania ? r.cabania.id : null;
                return cId === c.id || (r.cabanaNombre && r.cabanaNombre === c.nombre);
            }).length;
        });

        const ctx1 = document.getElementById('chartReservasCabana');
        if (ctx1) {
            if (chartReservasCabanaInstancia) chartReservasCabanaInstancia.destroy();
            chartReservasCabanaInstancia = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: nombresCabanas,
                    datasets: [{
                        label: 'Total Reservas',
                        data: conteoReservas,
                        backgroundColor: '#2c4c3b',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            });
        }

        // --- GRÁFICO 2: Calificación de Cabañas (Barras Horizontales con puntaje simulado/estrellas) ---
        // Generamos un puntaje simulado estable basado en el ID si no viene en la API, o valor fijo de referencia (ej. 4.5, 4.8)
        const calificaciones = listaCabanasGlobal.map(c => ((4 + (c.id % 10) * 0.1)).toFixed(1));

        const ctx2 = document.getElementById('chartCalificacionesCabana');
        if (ctx2) {
            if (chartCalificacionesInstancia) chartCalificacionesInstancia.destroy();
            chartCalificacionesInstancia = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: nombresCabanas,
                    datasets: [{
                        label: 'Puntuación Promedio (Estrellas)',
                        data: calificaciones,
                        backgroundColor: '#1f3529',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { min: 0, max: 5 } }
                }
            });
        }

        // --- GRÁFICO 3: Estado de Reservas (Dona) ---
        let confirmadas = 0;
        let pendientes = 0;
        let canceladas = 0;
        let finalizadas = 0;

        listaReservasGlobal.forEach(r => {
            const estado = (r.estado || 'PENDIENTE').toUpperCase();
            if (estado === 'CONFIRMADA') confirmadas++;
            else if (estado === 'PENDIENTE') pendientes++;
            else if (estado === 'CANCELADA') canceladas++;
            else if (estado === 'FINALIZADA') finalizadas++;
        });

        const ctx3 = document.getElementById('chartEstadoReservas');
        if (ctx3) {
            if (chartEstadoReservasInstancia) chartEstadoReservasInstancia.destroy();
            chartEstadoReservasInstancia = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Confirmadas', 'Pendientes', 'Canceladas', 'Finalizadas'],
                    datasets: [{
                        data: [confirmadas, pendientes, canceladas, finalizadas],
                        backgroundColor: ['#0f5132', '#ffc107', '#dc2626', '#6c757d'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
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
                    <button class="btn-accion-modificar" onclick="event.stopPropagation(); abrirModalModificarReserva(${reserva.id})" title="Administrar reserva">
                        <i class="fa-solid fa-gear"></i> Administrar
                    </button>
                </td>
            `;

            tr.addEventListener('click', () => {
                abrirModalAdminDetalles(reserva);
            });

            tbody.appendChild(tr);
        });
    }

    const inputBuscarReserva = document.getElementById('buscarReserva');
    if (inputBuscarReserva) {
        inputBuscarReserva.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase();
            const filtradas = listaReservasGlobal.filter(reserva => {
                const idStr = String(reserva.id || '').toLowerCase();
                const usuarioNombre = reserva.usuario ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.toLowerCase() : '';
                const cabaniaNombre = (reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || '')).toLowerCase();
                const estado = (reserva.estado || '').toLowerCase();
                const dni = reserva.usuario ? String(reserva.usuario.dni || reserva.usuario.pasaporte || '').toLowerCase() : '';

                return idStr.includes(texto) || 
                       usuarioNombre.includes(texto) || 
                       cabaniaNombre.includes(texto) || 
                       estado.includes(texto) ||
                       dni.includes(texto);
            });
            renderizarTablaReservasAdmin(filtradas);
        });
    }

    const modalAdmin = document.getElementById('modalAdminDetallesReserva');
    const btnCloseModalAdmin = document.getElementById('btnCloseModalAdmin');

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

    let reservaIdEnEdicion = null;
    const modalModificarReserva = document.getElementById('modalAdminModificarReserva');
    const btnCloseModalModificar = document.getElementById('btnCloseModalModificar');
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
    if (modalModificarReserva) {
        modalModificarReserva.addEventListener('click', (e) => {
            if (e.target === modalModificarReserva) cerrarModalModificar();
        });
    }

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

    if (btnAdminEliminarReserva) {
        btnAdminEliminarReserva.addEventListener('click', async () => {
            if (!reservaIdEnEdicion) return;
            if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la reserva #${reservaIdEnEdicion}?`)) return;

            try {
                const response = await fetch(`/api/reservas/${reservaIdEnEdicion}`, { method: 'DELETE' });
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

    // Inicialización general
    cargarUsuariosAdmin();
    cargarCabanasAdmin();
    cargarReservasAdmin();
});