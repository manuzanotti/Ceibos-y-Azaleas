// ==========================================
// MÓDULO DE ESTADÍSTICAS Y MÉTRICAS (adm-estadisticas.js)
// ==========================================

let chartReservasCabanaInstance = null;
let chartCalificacionesCabanaInstance = null;
let chartEstadoReservasInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticasGenerales();
});

async function cargarEstadisticasGenerales() {
    try {
        // 1. Obtener Reservas, Cabañas y Usuarios en paralelo
        const [resReservas, resCabanias, resUsuarios] = await Promise.all([
            fetch('/api/reservas'),
            fetch('/api/cabanias'),
            fetch('/api/usuarios')
        ]);

        let reservas = [];
        let cabanias = [];
        let usuarios = [];

        if (resReservas.ok) reservas = await resReservas.json();
        if (resCabanias.ok) cabanias = await resCabanias.json();
        if (resUsuarios.ok) usuarios = await resUsuarios.json();

        // 2. Actualizar Métricas Superiores
        const statReservas = document.getElementById('statReservas');
        if (statReservas) {
            const activas = reservas.filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
            statReservas.textContent = activas;
        }

        const statIngresos = document.getElementById('statIngresos');
        if (statIngresos) {
            const totalIngresos = reservas
                .filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA')
                .reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
            statIngresos.textContent = `$${totalIngresos.toLocaleString('es-AR')}`;
        }

        const statUsuarios = document.getElementById('statUsuarios');
        if (statUsuarios) {
            statUsuarios.textContent = usuarios.length;
        }

        // 3. Renderizar los Gráficos con Chart.js
        renderizarGraficos(reservas, cabanias);

    } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
    }
}

function renderizarGraficos(reservas, cabanias) {
    // ----------------------------------------------------
    // Gráfico 1: Reservas por Cabaña (Gráfico de Barras)
    // ----------------------------------------------------
    const ctxReservas = document.getElementById('chartReservasCabana');
    if (ctxReservas) {
        // Mapear nombres de cabañas y contar cuántas reservas tiene cada una
        const nombresCabanias = cabanias.map(c => c.nombre);
        const conteoReservas = cabanias.map(c => {
            return reservas.filter(r => {
                const idCabaniaRelacionada = r.cabania ? r.cabania.id : r.cabaniaId;
                return idCabaniaRelacionada === c.id;
            }).length;
        });

        if (chartReservasCabanaInstance) chartReservasCabanaInstance.destroy();

        chartReservasCabanaInstance = new Chart(ctxReservas, {
            type: 'bar',
            data: {
                labels: nombresCabanias.length > 0 ? nombresCabanias : ['Sin Cabañas'],
                datasets: [{
                    label: 'Reservas',
                    data: conteoReservas.length > 0 ? conteoReservas : [0],
                    backgroundColor: '#198754',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // ----------------------------------------------------
    // Gráfico 2: Calificación de Cabañas (Gráfico de Líneas / Radar o Promedio)
    // ----------------------------------------------------
    const ctxCalificaciones = document.getElementById('chartCalificacionesCabana');
    if (ctxCalificaciones) {
        // Como las calificaciones dependen de si tienes un sistema de reviews implementado, 
        // colocamos valores de ejemplo o neutros si aún no hay un endpoint de reseñas.
        const nombresCabanias = cabanias.map(c => c.nombre);
        const calificacionesEjemplo = cabanias.map(() => 5.0); // Calificación por defecto o simulada

        if (chartCalificacionesCabanaInstance) chartCalificacionesCabanaInstance.destroy();

        chartCalificacionesCabanaInstance = new Chart(ctxCalificaciones, {
            type: 'line',
            data: {
                labels: nombresCabanias.length > 0 ? nombresCabanias : ['Sin Cabañas'],
                datasets: [{
                    label: 'Calificación Promedio',
                    data: calificacionesEjemplo,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 5 } }
            }
        });
    }

    // ----------------------------------------------------
    // Gráfico 3: Estado de Reservas (Gráfico de Dona / Circular)
    // ----------------------------------------------------
    const ctxEstado = document.getElementById('chartEstadoReservas');
    if (ctxEstado) {
        const confirmadas = reservas.filter(r => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
        const pendientes = reservas.filter(r => (r.estado || '').toUpperCase() === 'PENDIENTE').length;
        const canceladas = reservas.filter(r => (r.estado || '').toUpperCase() === 'CANCELADA').length;

        if (chartEstadoReservasInstance) chartEstadoReservasInstance.destroy();

        chartEstadoReservasInstance = new Chart(ctxEstado, {
            type: 'doughnut',
            data: {
                labels: ['Confirmadas', 'Pendientes', 'Canceladas'],
                datasets: [{
                    data: [confirmadas, pendientes, canceladas],
                    backgroundColor: ['#198754', '#ffc107', '#dc3545']
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