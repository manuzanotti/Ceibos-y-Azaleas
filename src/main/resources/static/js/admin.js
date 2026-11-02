// ==========================================
// ADMIN.JS - Control exclusivo de Navegación y Menús
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
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
                
                // Si se navega a estadísticas y la función global existe, la actualizamos
                if (targetSectionId === 'estadisticas' && typeof actualizarGraficosEstadisticas === 'function') {
                    actualizarGraficosEstadisticas();
                }
            }
        });
    });
});