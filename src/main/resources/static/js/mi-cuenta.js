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

                // Actualizar inicial en el avatar de la tarjeta
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

    // Enviar formulario de actualización
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
                    headers: {
                        'Content-Type': 'application/json'
                    },
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

    // Botón Cancelar (regresa al dashboard)
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
});