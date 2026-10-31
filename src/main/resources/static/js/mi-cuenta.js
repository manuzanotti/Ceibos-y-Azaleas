document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    
    // Si no hay sesión activa, redirigir al login
    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar fecha máxima en el calendario para asegurar mayoría de edad (18 años)
    const hoy = new Date();
    const anioMaximo = hoy.getFullYear() - 18;
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const inputFecha = document.getElementById('fechaNacimiento');
    if (inputFecha) {
        inputFecha.max = `${anioMaximo}-${mes}-${dia}`;
    }

    const formMiCuenta = document.getElementById('formMiCuenta');
    const userInitial = document.getElementById('userInitial');

    // Cargar datos actuales del usuario
    async function cargarDatosUsuario() {
        try {
            const response = await fetch(`/api/usuarios/${usuarioId}`);
            if (response.ok) {
                const usuario = await response.json();
                
                const inputNombre = document.getElementById('nombre');
                const inputApellido = document.getElementById('apellido');
                const inputEmail = document.getElementById('email');
                const inputDni = document.getElementById('dni');
                const inputTelefono = document.getElementById('telefono');
                const inputFechaNac = document.getElementById('fechaNacimiento');

                if (inputNombre) inputNombre.value = usuario.nombre || '';
                if (inputApellido) inputApellido.value = usuario.apellido || '';
                if (inputEmail) inputEmail.value = usuario.email || '';
                if (inputDni) inputDni.value = usuario.dni || '';
                if (inputTelefono) inputTelefono.value = usuario.telefono || '';
                if (inputFechaNac) inputFechaNac.value = usuario.fechaNacimiento || '';

                if (userInitial && usuario.nombre) {
                    userInitial.textContent = usuario.nombre.charAt(0).toUpperCase();
                }
            } else {
                console.error('Error al obtener los datos del usuario.');
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    }

    cargarDatosUsuario();

    // Enviar formulario de actualización de datos
    if (formMiCuenta) {
        formMiCuenta.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datosActualizados = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                email: document.getElementById('email').value,
                dni: document.getElementById('dni').value,
                telefono: document.getElementById('telefono').value,
                fechaNacimiento: document.getElementById('fechaNacimiento').value
            };

            try {
                const response = await fetch(`/api/usuarios/${usuarioId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosActualizados)
                });

                if (response.ok) {
                    alert('¡Tus datos han sido actualizados con éxito!');
                    cargarDatosUsuario();
                } else {
                    const errorMsg = await response.text();
                    alert('No se pudo actualizar: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    // ==========================================
    // LÓGICA DE LA MODAL Y CAMBIO DE CONTRASEÑA
    // ==========================================
    const modalPassword = document.getElementById('modalPassword');
    const btnAbrirModalPass = document.getElementById('btnAbrirModalPass');
    const btnCloseModalPass = document.getElementById('btnCloseModalPass');
    const btnCancelarPass = document.getElementById('btnCancelarPass');
    const formCambiarPassword = document.getElementById('formCambiarPassword');
    const errorMessage = document.getElementById('errorMessage');

    const abrirModalPass = () => { 
        if (modalPassword) modalPassword.classList.add('active');
        if (errorMessage) {
            errorMessage.style.display = 'none'; // Limpiar errores al abrir
            errorMessage.textContent = '';
        }
    };

    const cerrarModalPass = () => { 
        if (modalPassword) modalPassword.classList.remove('active');
        if (formCambiarPassword) formCambiarPassword.reset();
        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
        }
    };

    if (btnAbrirModalPass) btnAbrirModalPass.addEventListener('click', abrirModalPass);
    if (btnCloseModalPass) btnCloseModalPass.addEventListener('click', cerrarModalPass);
    if (btnCancelarPass) btnCancelarPass.addEventListener('click', cerrarModalPass);

    if (formCambiarPassword) {
        formCambiarPassword.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ocultar error previo antes de validar
            if (errorMessage) {
                errorMessage.style.display = 'none';
                errorMessage.textContent = '';
            }

            const passwordActual = document.getElementById('passwordActual').value;
            const passwordNueva = document.getElementById('passwordNueva').value;
            const passwordConfirmar = document.getElementById('passwordConfirmar').value;

            // 1. Validar que las nuevas contraseñas coincidan
            if (passwordNueva !== passwordConfirmar) {
                if (errorMessage) {
                    errorMessage.textContent = 'Las nuevas contraseñas no coinciden.';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            // 2. Validar que la nueva no sea igual a la actual
            if (passwordNueva === passwordActual) {
                if (errorMessage) {
                    errorMessage.textContent = 'La nueva contraseña no puede ser igual a la actual.';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            const datosPassword = {
                passwordActual: passwordActual,
                passwordNueva: passwordNueva
            };

            try {
                const response = await fetch(`/api/usuarios/${usuarioId}/password`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosPassword)
                });

                if (response.ok) {
                    alert('¡Contraseña actualizada con éxito!');
                    cerrarModalPass();
                } else {
                    const errorMsg = await response.text();
                    if (errorMessage) {
                        errorMessage.textContent = errorMsg || 'No se pudo actualizar la contraseña.';
                        errorMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error de red:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'Error de conexión con el servidor.';
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});