document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si hay un usuario logueado en sessionStorage
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

    // Función auxiliar para mostrar mensajes visuales de la cuenta en lugar de alert()
    function mostrarMensajeCuenta(mensaje, tipo = 'exito') {
        let alertContainer = document.getElementById('mensajeAlertaCuenta');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'mensajeAlertaCuenta';
            alertContainer.style.padding = '10px 14px';
            alertContainer.style.borderRadius = '6px';
            alertContainer.style.fontSize = '0.9rem';
            alertContainer.style.marginBottom = '15px';
            alertContainer.style.fontWeight = '500';
            
            if (formMiCuenta) formMiCuenta.prepend(alertContainer);
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

    // Enviar formulario de actualización de datos (Sin alert nativo)
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
                    mostrarMensajeCuenta('¡Tus datos han sido actualizados con éxito!', 'exito');
                    cargarDatosUsuario();
                } else {
                    const errorMsg = await response.text();
                    mostrarMensajeCuenta('No se pudo actualizar: ' + errorMsg, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                mostrarMensajeCuenta('Error de conexión con el servidor.', 'error');
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
                    // Para el cambio de contraseña usamos el errorMessage del modal pero con estilo de éxito o un aviso visual limpio
                    if (errorMessage) {
                        errorMessage.style.backgroundColor = '#d1e7dd';
                        errorMessage.style.color = '#0f5132';
                        errorMessage.style.border = '1px solid #badbcc';
                        errorMessage.textContent = '¡Contraseña actualizada con éxito!';
                        errorMessage.style.display = 'block';
                    }
                    setTimeout(() => {
                        cerrarModalPass();
                    }, 1200);
                } else {
                    const errorMsg = await response.text();
                    if (errorMessage) {
                        errorMessage.style.backgroundColor = '#f8d7da';
                        errorMessage.style.color = '#842029';
                        errorMessage.style.border = '1px solid #f5c2c7';
                        errorMessage.textContent = errorMsg || 'No se pudo actualizar la contraseña.';
                        errorMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error de red:', error);
                if (errorMessage) {
                    errorMessage.style.backgroundColor = '#f8d7da';
                    errorMessage.style.color = '#842029';
                    errorMessage.style.border = '1px solid #f5c2c7';
                    errorMessage.textContent = 'Error de conexión con el servidor.';
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});