document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión activa opcional (si deseas que la página sea privada, o déjalo abierto)
    const usuarioNombre = sessionStorage.getItem('usuarioNombre');
    if (usuarioNombre) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = usuarioNombre;
        }
    }

    // Lógica del Acordeón de Preguntas Frecuentes
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        
        questionBtn.addEventListener('click', () => {
            // Opcional: Cerrar las demás abiertas si solo quieres una activa a la vez
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Alternar el estado activo de la pregunta actual
            item.classList.toggle('active');
        });
    });
});