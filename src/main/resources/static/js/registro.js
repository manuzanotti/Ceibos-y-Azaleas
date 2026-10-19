document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ocultar mensajes previos
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.style.display = 'none';
        successMessage.textContent = '';

        // Construir el objeto con los datos del formulario
        const nuevoUsuario = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim()
        };

        try {
            const response = await fetch('/api/usuarios/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoUsuario)
            });

            if (response.ok) {
                successMessage.textContent = '¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...';
                successMessage.style.display = 'block';

                // Esperamos 2 segundos para que el usuario vea el mensaje y redirigimos
                setTimeout(() => {
                    window.location.href = '/html/login.html';
                }, 2000);
            } else {
                // Manejar respuestas de error (DNI/email duplicado o validaciones de backend)
                const textoError = await response.text();
                errorMessage.textContent = textoError || 'Ocurrió un error al registrar la cuenta.';
                errorMessage.style.display = 'block';
            }

        } catch (error) {
            console.error('Error de red:', error);
            errorMessage.textContent = 'No se pudo conectar con el servidor. Inténtalo más tarde.';
            errorMessage.style.display = 'block';
        }
    });
});