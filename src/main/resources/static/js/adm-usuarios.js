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
                tipoDeUsuario: document.getElementById('modUserTipo').value.toUpperCase(), // Aseguramos que coincida con el backend y el Enum (ej: CLIENTE / ADMINISTRADOR)
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

// Botón Dar de baja usuario (Elimina sus reservas asociadas primero y luego al usuario)
    if (btnAdminDarBajaUsuario) {
        btnAdminDarBajaUsuario.addEventListener('click', async () => {
            if (!usuarioIdEnEdicion) return;
            
            if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario #${usuarioIdEnEdicion}?\n\n⚠️ Esta acción borrará también todas las reservas asociadas a este usuario de forma permanente.`)) {
                return;
            }

            try {
                // 1. Obtenemos todas las reservas para filtrar las que pertenecen a este usuario
                const resReservas = await fetch('/api/reservas');
                if (resReservas.ok) {
                    const reservas = await resReservas.json();
                    
                    // Filtramos las reservas del usuario (manejando si viene el objeto usuario o solo el ID)
                    const reservasDelUsuario = reservas.filter(r => {
                        const idUserRelacionado = r.usuario ? r.usuario.id : r.usuarioId;
                        return idUserRelacionado === usuarioIdEnEdicion;
                    });

                    // 2. Borramos cada reserva asociada para liberar la restricción de clave foránea
                    for (const reserva of reservasDelUsuario) {
                        await fetch(`/api/reservas/${reserva.id}`, {
                            method: 'DELETE'
                        });
                    }
                }

                // 3. Una vez eliminadas las reservas dependientes, borramos al usuario
                const response = await fetch(`/api/usuarios/${usuarioIdEnEdicion}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Usuario y sus reservas asociadas eliminados correctamente.');
                    cerrarModalModificarUsuario();
                    cargarUsuariosAdmin();
                    cargarReservasAdmin(); // Actualizamos la tabla de reservas de fondo
                } else {
                    const errorMsg = await response.text();
                    alert('No se pudo eliminar el usuario: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    
    }
    cargarUsuariosAdmin();