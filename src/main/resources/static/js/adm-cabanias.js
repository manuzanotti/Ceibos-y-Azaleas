// ==========================================
// MÓDULO CABAÑAS - PASO 4: Listar + Detalles + Crear + Modificar (PUT)
// ==========================================

let listaCabanasGlobal = [];
let cabanaIdEnEdicion = null;

async function cargarCabanasAdmin() {
    try {
        const response = await fetch('/api/cabanias');
        if (response.ok) {
            listaCabanasGlobal = await response.json();
            renderizarTablaCabanas(listaCabanasGlobal);
        } else {
            console.error('Error al obtener las cabañas del servidor.');
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
        const activa = cabana.activa !== false;
        const estadoTexto = activa ? 'Disponible' : 'No disponible';
        const estadoEstilo = activa 
            ? 'background-color: #d1e7dd; color: #0f5132; border: 1px solid #badbcc;' 
            : 'background-color: #f8d7da; color: #842029; border: 1px solid #f5c2c7;';

        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.title = 'Haz clic para ver detalles de la cabaña';
        tr.innerHTML = `
            <td><strong>${cabana.nombre || 'Sin nombre'}</strong></td>
            <td>${cabana.capacidad || 0} personas</td>
            <td>$${(cabana.precioPorNoche || 0).toLocaleString('es-AR')}</td>
            <td>
                <span style="${estadoEstilo} padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; display: inline-block;">
                    ${estadoTexto}
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

// ==========================================
// 1. MODAL DE DETALLES
// ==========================================
const modalAdminDetallesCabana = document.getElementById('modalAdminDetallesCabana');
const btnCloseModalDetallesCabana = document.getElementById('btnCloseModalDetallesCabana');

function abrirModalDetallesCabana(cabana) {
    document.getElementById('detCabanaIdTitulo').textContent = cabana.id;
    document.getElementById('detCabanaNombre').textContent = cabana.nombre || '-';
    document.getElementById('detCabanaDescripcion').textContent = cabana.descripcion || 'Sin descripción';
    document.getElementById('detCabanaCapacidad').textContent = `${cabana.capacidad || 0} personas`;
    document.getElementById('detCabanaPrecio').textContent = `$${(cabana.precioPorNoche || 0).toLocaleString('es-AR')}`;
    document.getElementById('detCabanaComodidades').textContent = cabana.comodidades || 'No especificadas';
    
    const activa = cabana.activa !== false;
    document.getElementById('detCabanaDisponibilidad').textContent = activa ? 'Disponible' : 'No disponible';

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

// ==========================================
// 2. MODAL DE CREACIÓN
// ==========================================
const modalAdminCrearCabana = document.getElementById('modalAdminCrearCabana');
const btnNuevaCabana = document.getElementById('btnNuevaCabana');
const btnCloseModalCrearCabana = document.getElementById('btnCloseModalCrearCabana');
const btnCancelarCrearCabana = document.getElementById('btnCancelarCrearCabana');
const formCrearCabana = document.getElementById('formCrearCabana');
const mensajeCrearCabana = document.getElementById('mensajeCrearCabana');

if (btnNuevaCabana) {
    btnNuevaCabana.addEventListener('click', () => {
        if (formCrearCabana) formCrearCabana.reset();
        if (mensajeCrearCabana) mensajeCrearCabana.style.display = 'none';
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
        if (mensajeCrearCabana) mensajeCrearCabana.style.display = 'none';

        const nombreCabana = document.getElementById('crearCabanaNombre').value;
        const nuevaCabana = {
            nombre: nombreCabana,
            capacidad: parseInt(document.getElementById('crearCabanaCapacidad').value) || 1,
            precioPorNoche: parseFloat(document.getElementById('crearCabanaPrecio').value) || 0,
            activa: document.getElementById('crearCabanaDisponibilidad').value === 'true',
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
                if (mensajeCrearCabana) {
                    mensajeCrearCabana.style.color = '#0f5132';
                    mensajeCrearCabana.style.backgroundColor = '#d1e7dd';
                    mensajeCrearCabana.textContent = `¡Cabaña "${nombreCabana}" creada con éxito!`;
                    mensajeCrearCabana.style.display = 'block';
                }
                cargarCabanasAdmin();
                setTimeout(() => { cerrarModalCrearCabana(); }, 1500);
            } else {
                const errorMsg = await response.text();
                if (mensajeCrearCabana) {
                    mensajeCrearCabana.style.color = '#842029';
                    mensajeCrearCabana.style.backgroundColor = '#f8d7da';
                    mensajeCrearCabana.textContent = 'No se pudo crear la cabaña: ' + errorMsg;
                    mensajeCrearCabana.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error de red:', error);
            if (mensajeCrearCabana) {
                mensajeCrearCabana.style.color = '#842029';
                mensajeCrearCabana.style.backgroundColor = '#f8d7da';
                mensajeCrearCabana.textContent = 'Error de conexión con el servidor.';
                mensajeCrearCabana.style.display = 'block';
            }
        }
    });
}

// ==========================================
// 3. MODAL DE MODIFICACIÓN (ADMINISTRAR / PUT)
// ==========================================
const modalAdminModificarCabana = document.getElementById('modalAdminModificarCabana');
const btnCloseModalModificarCabana = document.getElementById('btnCloseModalModificarCabana');
const formModificarCabana = document.getElementById('formModificarCabana');
const errorModificarCabana = document.getElementById('errorModificarCabana');

window.abrirModalModificarCabana = function(id) {
    const cabana = listaCabanasGlobal.find(c => c.id === id);
    if (!cabana) return;

    cabanaIdEnEdicion = id;
    document.getElementById('modCabanaIdTitulo').textContent = id;
    if (document.getElementById('modCabanaId')) document.getElementById('modCabanaId').value = id;
    if (errorModificarCabana) errorModificarCabana.style.display = 'none';

    document.getElementById('modCabanaNombre').value = cabana.nombre || '';
    document.getElementById('modCabanaCapacidad').value = cabana.capacidad || 1;
    document.getElementById('modCabanaPrecio').value = cabana.precioPorNoche || 0;
    
    const disp = cabana.activa !== false ? 'true' : 'false';
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
        if (errorModificarCabana) errorModificarCabana.style.display = 'none';

        const nombreCabana = document.getElementById('modCabanaNombre').value;
        const cabanaActualizada = {
            nombre: nombreCabana,
            capacidad: parseInt(document.getElementById('modCabanaCapacidad').value) || 1,
            precioPorNoche: parseFloat(document.getElementById('modCabanaPrecio').value) || 0,
            activa: document.getElementById('modCabanaDisponibilidad').value === 'true',
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
                if (errorModificarCabana) {
                    errorModificarCabana.style.color = '#0f5132';
                    errorModificarCabana.style.backgroundColor = '#d1e7dd';
                    errorModificarCabana.style.border = '1px solid #badbcc';
                    errorModificarCabana.textContent = `¡Cabaña "${nombreCabana}" modificada con éxito!`;
                    errorModificarCabana.style.display = 'block';
                }
                
                cargarCabanasAdmin();
                
                setTimeout(() => {
                    cerrarModalModificarCabana();
                }, 1200);
            } else {
                const err = await response.text();
                if (errorModificarCabana) {
                    errorModificarCabana.style.color = '#842029';
                    errorModificarCabana.style.backgroundColor = '#f8d7da';
                    errorModificarCabana.style.border = '1px solid #f5c2c7';
                    errorModificarCabana.textContent = 'No se pudo modificar la cabaña: ' + err;
                    errorModificarCabana.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error de red:', error);
            if (errorModificarCabana) {
                errorModificarCabana.style.color = '#842029';
                errorModificarCabana.style.backgroundColor = '#f8d7da';
                errorModificarCabana.style.border = '1px solid #f5c2c7';
                errorModificarCabana.textContent = 'Error de conexión con el servidor.';
                errorModificarCabana.style.display = 'block';
            }
        }
    });
}

// ==========================================
// 4. BOTÓN ELIMINAR CABAÑA (Sin confirm() nativo, todo visual en modal)
// ==========================================
const btnAdminEliminarCabana = document.getElementById('btnAdminEliminarCabana');

if (btnAdminEliminarCabana) {
    btnAdminEliminarCabana.addEventListener('click', async () => {
        if (!cabanaIdEnEdicion) return;

        if (errorModificarCabana) {
            errorModificarCabana.style.display = 'none';
        }

        try {
            const response = await fetch(`/api/cabanias/${cabanaIdEnEdicion}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (errorModificarCabana) {
                    errorModificarCabana.style.color = '#0f5132';
                    errorModificarCabana.style.backgroundColor = '#d1e7dd';
                    errorModificarCabana.style.border = '1px solid #badbcc';
                    errorModificarCabana.textContent = 'Cabaña y sus reservas asociadas eliminadas correctamente.';
                    errorModificarCabana.style.display = 'block';
                }
                
                cargarCabanasAdmin();
                
                if (typeof cargarReservasAdmin === 'function') {
                    cargarReservasAdmin();
                }

                setTimeout(() => { 
                    cerrarModalModificarCabana(); 
                }, 1200);
            } else {
                const errorMsg = await response.text();
                if (errorModificarCabana) {
                    errorModificarCabana.style.color = '#842029';
                    errorModificarCabana.style.backgroundColor = '#f8d7da';
                    errorModificarCabana.style.border = '1px solid #f5c2c7';
                    errorModificarCabana.textContent = 'No se pudo eliminar la cabaña: ' + errorMsg;
                    errorModificarCabana.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error de red:', error);
            if (errorModificarCabana) {
                errorModificarCabana.style.color = '#842029';
                errorModificarCabana.style.backgroundColor = '#f8d7da';
                errorModificarCabana.style.border = '1px solid #f5c2c7';
                errorModificarCabana.textContent = 'Error de conexión con el servidor.';
                errorModificarCabana.style.display = 'block';
            }
        }
    });
}

cargarCabanasAdmin();