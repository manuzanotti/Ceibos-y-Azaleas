document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // Parseamos el JSON que mandó Spring Boot (el objeto Usuario)
                const usuario = await response.json();
                
                // Guardamos el nombre en el sessionStorage del navegador
                sessionStorage.setItem('usuarioNombre', usuario.nombre);
                
                // Redirigimos al dashboard
                window.location.href = '/html/dashboard.html';
            } else {
                const textoError = await response.text();
                errorMessage.textContent = textoError || 'Correo o contraseña incorrectos.';
                errorMessage.style.display = 'block';
            }

        } catch (error) {
            console.error('Error de red:', error);
            errorMessage.textContent = 'No se pudo conectar con el servidor.';
            errorMessage.style.display = 'block';
        }
    });
});