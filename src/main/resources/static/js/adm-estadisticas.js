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
        // 1. Obtener Reservas, Cabañas, Usuarios y Reseñas en paralelo
        const [resReservas, resCabanias, resUsuarios, resResenias] = await Promise.all([
            fetch('/api/reservas'),
            fetch('/api/cabanias'),
            fetch('/api/usuarios'),
            fetch('/api/resenas/publicas')
        ]);

        let reservas = [];
        let cabanias = [];
        let usuarios = [];
        let resenias = [];

        if (resReservas.ok) reservas = await resReservas.json();
        if (resCabanias.ok) cabanias = await resCabanias.json();
        if (resUsuarios.ok) usuarios = await resUsuarios.json();
        if (resResenias.ok) resenias = await resResenias.json();

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
        renderizarGraficos(reservas, cabanias, resenias);

    } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
    }
}

function renderizarGraficos(reservas, cabanias, resenias) {
    // ----------------------------------------------------
    // Gráfico 1: Reservas por Cabaña (Gráfico de Barras)
    // ----------------------------------------------------
    const ctxReservas = document.getElementById('chartReservasCabana');
    if (ctxReservas) {
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
    // Gráfico 2: Calificación Real de Cabañas (Basado en Reseñas)
    // ----------------------------------------------------
    const ctxCalificaciones = document.getElementById('chartCalificacionesCabana');
    if (ctxCalificaciones) {
        const nombresCabanias = cabanias.map(c => c.nombre);
        
        // Calcular el promedio real de puntuación para cada cabaña basándonos en las reseñas
        const calificacionesReales = cabanias.map(c => {
            const reseniasCabania = resenias.filter(r => 
                (r.cabaniaNombre || '').toLowerCase() === (c.nombre || '').toLowerCase()
            );
            
            if (reseniasCabania.length === 0) return 0; // Si no tiene reseñas, arranca en 0 o un valor neutro
            
            const sumaPuntuaciones = reseniasCabania.reduce((acc, curr) => acc + (curr.puntuacion || 0), 0);
            return parseFloat((sumaPuntuaciones / reseniasCabania.length).toFixed(1));
        });

        if (chartCalificacionesCabanaInstance) chartCalificacionesCabanaInstance.destroy();

        chartCalificacionesCabanaInstance = new Chart(ctxCalificaciones, {
            type: 'line',
            data: {
                labels: nombresCabanias.length > 0 ? nombresCabanias : ['Sin Cabañas'],
                datasets: [{
                    label: 'Calificación Promedio (Estrellas)',
                    data: calificacionesReales.length > 0 ? calificacionesReales : [0],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.15)',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffc107',
                    pointRadius: 5,
                    fill: true,
                    tension: 0.35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    y: { 
                        min: 0, 
                        max: 5,
                        ticks: { stepSize: 1 }
                    } 
                },
                plugins: {
                    legend: { display: true, position: 'bottom' }
                }
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
        const finalizadas = reservas.filter(r => (r.estado || '').toUpperCase() === 'FINALIZADA').length;

        if (chartEstadoReservasInstance) chartEstadoReservasInstance.destroy();

        chartEstadoReservasInstance = new Chart(ctxEstado, {
            type: 'doughnut',
            data: {
                labels: ['Confirmadas', 'Pendientes', 'Canceladas', 'Finalizadas'],
                datasets: [{
                    data: [confirmadas, pendientes, canceladas, finalizadas],
                    backgroundColor: ['#198754', '#ffc107', '#dc3545', '#6c757d']
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