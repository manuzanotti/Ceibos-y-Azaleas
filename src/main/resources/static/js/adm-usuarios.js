// ==========================================
    // 2. GESTIÓN DE USUARIOS
    // ==========================================
    let listaUsuariosGlobal = [];
    let usuarioIdEnEdicion = null;

    // Función auxiliar para mostrar mensajes visuales dentro del modal de usuarios
    function mostrarMensajeModalUsuario(mensaje, tipo = 'exito') {
        let alertContainer = document.getElementById('mensajeModalUsuario');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'mensajeModalUsuario';
            alertContainer.style.padding = '10px 14px';
            alertContainer.style.borderRadius = '6px';
            alertContainer.style.fontSize = '0.9rem';
            alertContainer.style.marginBottom = '15px';
            alertContainer.style.fontWeight = '500';
            
            const form = document.getElementById('formModificarUsuario');
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

        // Limpiamos avisos previos en el modal
        const alertContainer = document.getElementById('mensajeModalUsuario');
        if (alertContainer) alertContainer.style.display = 'none';

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
                tipoDeUsuario: document.getElementById('modUserTipo').value.toUpperCase(),
                activo: document.getElementById('modUserEstado').value === 'Habilitada'
            };

            try {
                const response = await fetch(`/api/usuarios/${usuarioIdEnEdicion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuarioActualizado)
                });

                if (response.ok) {
                    mostrarMensajeModalUsuario('¡Usuario modificado con éxito!', 'exito');
                    setTimeout(() => {
                        cerrarModalModificarUsuario();
                        cargarUsuariosAdmin();
                    }, 1200);
                } else {
                    const err = await response.text();
                    mostrarMensajeModalUsuario('No se pudo modificar el usuario: ' + err, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                mostrarMensajeModalUsuario('Error de conexión con el servidor.', 'error');
            }
        });
    }

    // Botón Dar de baja usuario (Sin confirm() nativo, avisos visuales directos)
    if (btnAdminDarBajaUsuario) {
        btnAdminDarBajaUsuario.addEventListener('click', async () => {
            if (!usuarioIdEnEdicion) return;

            try {
                const resReservas = await fetch('/api/reservas');
                if (resReservas.ok) {
                    const reservas = await resReservas.json();
                    
                    const reservasDelUsuario = reservas.filter(r => {
                        const idUserRelacionado = r.usuario ? r.usuario.id : r.usuarioId;
                        return idUserRelacionado === usuarioIdEnEdicion;
                    });

                    for (const reserva of reservasDelUsuario) {
                        await fetch(`/api/reservas/${reserva.id}`, {
                            method: 'DELETE'
                        });
                    }
                }

                const response = await fetch(`/api/usuarios/${usuarioIdEnEdicion}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    mostrarMensajeModalUsuario('Usuario y sus reservas asociadas eliminados correctamente.', 'exito');
                    setTimeout(() => {
                        cerrarModalModificarUsuario();
                        cargarUsuariosAdmin();
                        if (typeof cargarReservasAdmin === 'function') {
                            cargarReservasAdmin();
                        }
                    }, 1200);
                } else {
                    const errorMsg = await response.text();
                    mostrarMensajeModalUsuario('No se pudo eliminar el usuario: ' + errorMsg, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                mostrarMensajeModalUsuario('Error de conexión con el servidor.', 'error');
            }
        });
    }

    cargarUsuariosAdmin();