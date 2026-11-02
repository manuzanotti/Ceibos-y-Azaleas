// ==========================================
// MÓDULO DE RESERVAS - ADMINISTRACIÓN (adm-reservas.js)
// ==========================================

let listaReservasGlobal = [];
let listaCabaniasGlobal = [];
let reservaIdEnEdicion = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarReservasAdmin();
    cargarCabaniasParaSelect();
    configurarEventosReservas();
});

// Función auxiliar para mostrar mensajes visuales dentro del modal en lugar de alert()
function mostrarMensajeModal(mensaje, tipo = 'exito') {
    let alertContainer = document.getElementById('mensajeModalReserva');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'mensajeModalReserva';
        alertContainer.style.padding = '10px 14px';
        alertContainer.style.borderRadius = '6px';
        alertContainer.style.fontSize = '0.9rem';
        alertContainer.style.marginBottom = '15px';
        alertContainer.style.fontWeight = '500';
        
        const form = document.getElementById('formModificarReserva');
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

    // Ocultar automáticamente a los 4 segundos
    setTimeout(() => {
        if (alertContainer) alertContainer.style.display = 'none';
    }, 4000);
}

// 1. Cargar el listado general de reservas para la tabla
async function cargarReservasAdmin() {
    try {
        const response = await fetch('/api/reservas');
        if (response.ok) {
            listaReservasGlobal = await response.json();
            renderizarTablaReservas(listaReservasGlobal);

            // Actualizar estadística de reservas activas
            const statReservas = document.getElementById('statReservas');
            if (statReservas) {
                const activas = listaReservasGlobal.filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
                statReservas.textContent = activas;
            }

            // Actualizar ingresos totales
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

// 2. Cargar las cabañas para el selector del modal de modificación
async function cargarCabaniasParaSelect() {
    try {
        const response = await fetch('/api/cabanias');
        if (response.ok) {
            listaCabaniasGlobal = await response.json();
            const selectCabania = document.getElementById('modCabania');
            if (selectCabania) {
                selectCabania.innerHTML = '<option value="">Seleccione una cabaña...</option>';
                listaCabaniasGlobal.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.id;
                    option.textContent = c.nombre;
                    selectCabania.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar cabañas para el select:', error);
    }
}

// 3. Renderizar la tabla principal de reservas
function renderizarTablaReservas(reservas) {
    const tbody = document.getElementById('tablaReservasBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!reservas || reservas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay reservas registradas en el sistema.</td></tr>`;
        return;
    }

    reservas.sort((a, b) => b.id - a.id);

    reservas.forEach(reserva => {
        const nombreUsuario = reserva.usuario ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.trim() : `Usuario #${reserva.usuarioId || 'N/A'}`;
        const nombreCabania = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || 'Cabaña');
        const estado = reserva.estado || 'PENDIENTE';
        const fechaSalida = reserva.checkOut || reserva.chekOut || 'N/A';

        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.title = 'Haz clic para ver detalles de la reserva';
        tr.innerHTML = `
            <td><strong>#${reserva.id}</strong></td>
            <td>${nombreUsuario}</td>
            <td>${nombreCabania}</td>
            <td>${reserva.checkIn || 'N/A'} al ${fechaSalida}</td>
            <td>
                <span class="badge-estado badge-${estado.toLowerCase()}">
                    ${estado}
                </span>
            </td>
            <td>
                <button class="btn-accion-modificar" onclick="event.stopPropagation(); abrirModalModificarReserva(${reserva.id})" title="Administrar reserva">
                    <i class="fa-solid fa-gear"></i> Administrar
                </button>
            </td>
        `;

        tr.addEventListener('click', () => {
            abrirModalDetallesReserva(reserva);
        });

        tbody.appendChild(tr);
    });
}

// ==========================================
// MODAL DE DETALLES DE RESERVA
// ==========================================
const modalAdminDetallesReserva = document.getElementById('modalAdminDetallesReserva');
const btnCloseModalAdmin = document.getElementById('btnCloseModalAdmin');

function abrirModalDetallesReserva(reserva) {
    document.getElementById('adminDetIdTitulo').textContent = reserva.id;
    document.getElementById('adminDetEstado').textContent = reserva.estado || '-';
    
    const nombreUsuario = reserva.usuario ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.trim() : '-';
    document.getElementById('adminDetUsuario').textContent = nombreUsuario;
    document.getElementById('adminDetDni').textContent = reserva.usuario ? (reserva.usuario.dni || reserva.usuario.pasaporte || '-') : '-';
    
    const nombreCabania = reserva.cabania ? reserva.cabania.nombre : (reserva.cabanaNombre || '-');
    document.getElementById('adminDetCabania').textContent = nombreCabania;
    
    const checkIn = reserva.checkIn || '-';
    const checkOut = reserva.checkOut || reserva.chekOut || '-';
    document.getElementById('adminDetCheckIn').textContent = checkIn;
    document.getElementById('adminDetCheckOut').textContent = checkOut;
    
    let noches = '-';
    if (reserva.checkIn && (reserva.checkOut || reserva.chekOut)) {
        const d1 = new Date(reserva.checkIn);
        const d2 = new Date(reserva.checkOut || reserva.chekOut);
        const diffTime = Math.abs(d2 - d1);
        noches = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) + ' noches';
    }
    document.getElementById('adminDetNoches').textContent = noches;

    document.getElementById('adminDetTelefono').textContent = reserva.telefono || (reserva.usuario ? reserva.usuario.telefono : '-');
    document.getElementById('adminDetCorreo').textContent = reserva.usuario ? (reserva.usuario.email || '-') : '-';
    document.getElementById('adminDetPrecio').textContent = `$${(reserva.precioTotal || 0).toLocaleString('es-AR')}`;

    if (modalAdminDetallesReserva) {
        modalAdminDetallesReserva.style.display = 'flex';
    }
}

const cerrarModalDetallesReserva = () => {
    if (modalAdminDetallesReserva) {
        modalAdminDetallesReserva.style.display = 'none';
    }
};

if (btnCloseModalAdmin) {
    btnCloseModalAdmin.addEventListener('click', cerrarModalDetallesReserva);
}

// ==========================================
// MODAL DE MODIFICACIÓN / ADMINISTRACIÓN (PUT y DELETE)
// ==========================================
const modalAdminModificarReserva = document.getElementById('modalAdminModificarReserva');
const btnCloseModalModificar = document.getElementById('btnCloseModalModificar');
const formModificarReserva = document.getElementById('formModificarReserva');
const btnAdminEliminarReserva = document.getElementById('btnAdminEliminarReserva');

window.abrirModalModificarReserva = function(id) {
    const reserva = listaReservasGlobal.find(r => r.id === id);
    if (!reserva) return;

    reservaIdEnEdicion = id;
    
    const tituloId = document.getElementById('modReservaIdTitulo');
    if (tituloId) tituloId.textContent = id;
    
    const inputId = document.getElementById('modReservaId');
    if (inputId) inputId.value = id;

    // Limpiar alertas previas en el modal
    const alertContainer = document.getElementById('mensajeModalReserva');
    if (alertContainer) alertContainer.style.display = 'none';

    if (document.getElementById('modEstado')) {
        document.getElementById('modEstado').value = reserva.estado || 'PENDIENTE';
    }
    
    if (document.getElementById('modCabania')) {
        const idCabania = reserva.cabania ? reserva.cabania.id : reserva.cabaniaId;
        document.getElementById('modCabania').value = idCabania || '';
    }

    if (document.getElementById('modCheckIn')) {
        document.getElementById('modCheckIn').value = reserva.checkIn || '';
    }
    if (document.getElementById('modCheckOut')) {
        document.getElementById('modCheckOut').value = reserva.checkOut || reserva.chekOut || '';
    }
    if (document.getElementById('modAdultos')) {
        document.getElementById('modAdultos').value = reserva.cantidadAdultos || 1;
    }
    if (document.getElementById('modMenores')) {
        document.getElementById('modMenores').value = reserva.cantidadMenores || 0;
    }
    if (document.getElementById('modTelefono')) {
        document.getElementById('modTelefono').value = reserva.telefono || (reserva.usuario ? reserva.usuario.telefono : '') || '';
    }
    if (document.getElementById('modPrecioTotal')) {
        document.getElementById('modPrecioTotal').value = reserva.precioTotal || 0;
    }

    if (modalAdminModificarReserva) {
        modalAdminModificarReserva.style.display = 'flex';
    }
};

const cerrarModalModificarReserva = () => {
    if (modalAdminModificarReserva) {
        modalAdminModificarReserva.style.display = 'none';
    }
};

if (btnCloseModalModificar) {
    btnCloseModalModificar.addEventListener('click', cerrarModalModificarReserva);
}

// Configuración general de eventos (Buscador y Formularios)
function configurarEventosReservas() {
    // Buscador en tiempo real
    const inputBuscarReserva = document.getElementById('buscarReserva');
    if (inputBuscarReserva) {
        inputBuscarReserva.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase();
            const filtradas = listaReservasGlobal.filter(reserva => {
                const idStr = String(reserva.id || '').toLowerCase();
                const usuarioNombre = reserva.usuario ? `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.toLowerCase() : '';
                const cabaniaNombre = (reserva.cabania ? reserva.cabania.nombre : '').toLowerCase();
                const estado = (reserva.estado || '').toLowerCase();
                const dni = reserva.usuario ? String(reserva.usuario.dni || reserva.usuario.pasaporte || '').toLowerCase() : '';

                return idStr.includes(texto) || 
                       usuarioNombre.includes(texto) || 
                       cabaniaNombre.includes(texto) || 
                       estado.includes(texto) ||
                       dni.includes(texto);
            });
            renderizarTablaReservas(filtradas);
        });
    }

    // Evento Submit del formulario de modificación (PUT)
    if (formModificarReserva) {
        formModificarReserva.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!reservaIdEnEdicion) return;

            const reservaOriginal = listaReservasGlobal.find(r => r.id === reservaIdEnEdicion);

            const reservaActualizada = {
                usuarioId: reservaOriginal && reservaOriginal.usuario ? reservaOriginal.usuario.id : 1,
                cabaniaId: parseInt(document.getElementById('modCabania').value),
                estado: document.getElementById('modEstado').value,
                checkIn: document.getElementById('modCheckIn').value,
                checkOut: document.getElementById('modCheckOut').value,
                cantidadAdultos: parseInt(document.getElementById('modAdultos').value) || 1,
                cantidadMenores: parseInt(document.getElementById('modMenores').value) || 0,
                telefono: document.getElementById('modTelefono').value,
                precioTotal: parseFloat(document.getElementById('modPrecioTotal').value) || 0
            };

            try {
                const response = await fetch(`/api/reservas/${reservaIdEnEdicion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservaActualizada)
                });

                if (response.ok) {
                    mostrarMensajeModal(`¡Reserva #${reservaIdEnEdicion} modificada con éxito!`, 'exito');
                    setTimeout(() => {
                        cerrarModalModificarReserva();
                        cargarReservasAdmin();
                    }, 1200);
                } else {
                    const errorMsg = await response.text();
                    mostrarMensajeModal('No se pudo modificar: ' + errorMsg, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                mostrarMensajeModal('Error de conexión con el servidor.', 'error');
            }
        });
    }

    // Botón Eliminar Reserva (DELETE) con mensajes visuales integrados (Sin confirm() nativo)
    if (btnAdminEliminarReserva) {
        btnAdminEliminarReserva.addEventListener('click', async () => {
            if (!reservaIdEnEdicion) return;

            try {
                const response = await fetch(`/api/reservas/${reservaIdEnEdicion}`, { method: 'DELETE' });
                if (response.ok) {
                    mostrarMensajeModal('Reserva eliminada correctamente.', 'exito');
                    setTimeout(() => {
                        cerrarModalModificarReserva();
                        cargarReservasAdmin();
                    }, 1200);
                } else {
                    const errorMsg = await response.text();
                    mostrarMensajeModal('No se pudo eliminar: ' + errorMsg, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                mostrarMensajeModal('Error de conexión con el servidor.', 'error');
            }
        });
    }

    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modalAdminDetallesReserva) cerrarModalDetallesReserva();
        if (e.target === modalAdminModificarReserva) cerrarModalModificarReserva();
    });
}