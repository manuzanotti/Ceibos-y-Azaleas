document.addEventListener('DOMContentLoaded', () => {
    cargarResenasCliente();
});

async function cargarResenasCliente() {
    const tbody = document.getElementById('tablaHistorialResenas');
    const cardDestacada = document.getElementById('cardResenaDestacada');
    const mensajeVacio = document.getElementById('noResenasContainer');
    
    if (!tbody) return;

    try {
        // Petición al backend (cuando esté listo)
        const response = await fetch('/api/resenas/cliente');
        
        if (!response.ok) {
            throw new Error('Error al obtener las reseñas del servidor.');
        }

        const resenas = await response.json();

        if (!resenas || resenas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No tienes reseñas registradas.</td></tr>`;
            if (cardDestacada) cardDestacada.style.display = 'none';
            if (mensajeVacio) mensajeVacio.style.display = 'block';
            return;
        }

        if (mensajeVacio) mensajeVacio.style.display = 'none';
        if (cardDestacada) cardDestacada.style.display = 'block';

        renderizarTablaResenas(resenas);
        actualizarTarjetaDestacada(resenas[0]);

    } catch (error) {
        console.warn('Backend no conectado. Mostrando estado vacío o sin reseñas simuladas automáticas.');
        
        // Simulación temporal para ver el estado vacío (puedes cambiar este array a [] para probar el mensaje de "Aún no has realizado...")
        const resenasVacias = [];

        if (resenasVacias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="table-empty">No tienes reseñas registradas.</td></tr>`;
            if (cardDestacada) cardDestacada.style.display = 'none';
            if (mensajeVacio) mensajeVacio.style.display = 'block';
        } else {
            if (mensajeVacio) mensajeVacio.style.display = 'none';
            if (cardDestacada) cardDestacada.style.display = 'block';
            renderizarTablaResenas(resenasVacias);
            actualizarTarjetaDestacada(resenasVacias[0]);
        }
    }
}

function renderizarTablaResenas(resenas) {
    const tbody = document.getElementById('tablaHistorialResenas');
    tbody.innerHTML = '';

    resenas.forEach((resena, index) => {
        const tr = document.createElement('tr');
        if (index === 0) tr.classList.add('fila-activa');

        let estrellasHtml = '';
        for (let i = 1; i <= 5; i++) {
            estrellasHtml += i <= resena.puntuacion ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
        }

        tr.innerHTML = `
            <td><strong>${resena.cabaniaNombre || resena.cabania}</strong></td>
            <td>${resena.fechasEstadia || resena.fechas}</td>
            <td>
                <div style="color: #ffc107;">
                    ${estrellasHtml}
                    <span style="color: #6c757d; margin-left: 5px;">(${resena.puntuacion}/5)</span>
                </div>
            </td>
            <td>"${(resena.comentario || '').substring(0, 45)}..."</td>
        `;

        tr.addEventListener('click', () => {
            document.querySelectorAll('.reservas-table tr').forEach(row => row.classList.remove('fila-activa'));
            tr.classList.add('fila-activa');
            actualizarTarjetaDestacada(resena);
        });

        tbody.appendChild(tr);
    });
}

function actualizarTarjetaDestacada(resena) {
    const cardDestacada = document.getElementById('cardResenaDestacada');
    if (cardDestacada) cardDestacada.style.display = 'block';

    document.getElementById('nombreCabaniaResena').textContent = resena.cabaniaNombre || resena.cabania;
    document.getElementById('fechasEstadiaResena').textContent = resena.fechasEstadia || resena.fechas;
    document.getElementById('puntuacionEstrellasResena').textContent = `${resena.puntuacion} / 5 Estrellas`;
    document.getElementById('textoComentarioResena').textContent = `"${resena.comentario}"`;
    document.getElementById('badgeEstadoResena').textContent = resena.estado || 'Publicada';
    
    const imgCabania = document.getElementById('imgCabaniaResena');
    if (imgCabania && resena.imagen) imgCabania.src = resena.imagen;
}