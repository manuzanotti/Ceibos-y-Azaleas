document.addEventListener('DOMContentLoaded', () => {
    cargarResenasGenerales();
    configurarModalResenas();
});

async function cargarResenasGenerales() {
    const tbody = document.getElementById('tablaResenasGeneralesBody'); // Asegúrate que el ID coincida con tu HTML
    if (!tbody) return;

    try {
        // Petición al endpoint de Spring Boot que creamos
        const response = await fetch('/api/resenas/publicas');
        if (!response.ok) throw new Error('Error al cargar las reseñas desde el servidor.');
        
        const resenas = await response.json();
        renderizarTablaGeneral(resenas);
    } catch (error) {
        console.warn('Backend no disponible o ruta no encontrada. Usando datos simulados de respaldo.', error);
        
        // Datos simulados de ejemplo adaptados a los campos del backend
        const resenasSimuladas = [
            {
                id: 1,
                cabaniaNombre: "Cabaña Los Ceibos",
                huespedNombre: "Mariana Gómez",
                fechasEstadia: "15/10/2026 - 18/10/2026",
                puntuacion: 5,
                comentario: "Excelente atención y las instalaciones muy cómodas. Ideal para descansar en familia y desconectarse de la ciudad. Sin duda volveremos."
            },
            {
                id: 2,
                cabaniaNombre: "Cabaña Las Azaleas",
                huespedNombre: "Carlos Pérez",
                fechasEstadia: "02/09/2026 - 05/09/2026",
                puntuacion: 4,
                comentario: "Hermoso lugar, muy tranquilo y rodeado de naturaleza pura. La cabaña estaba impecable y muy bien calefaccionada."
            }
        ];

        renderizarTablaGeneral(resenasSimuladas);
    }
}

function renderizarTablaGeneral(resenas) {
    const tbody = document.getElementById('tablaResenasGeneralesBody');
    tbody.innerHTML = '';

    if (!resenas || resenas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No hay reseñas registradas por el momento.</td></tr>`;
        return;
    }

    resenas.forEach(resena => {
        const tr = document.createElement('tr');

        // Generar estrellas dinámicas
        let estrellasHtml = '';
        for (let i = 1; i <= 5; i++) {
            estrellasHtml += i <= resena.puntuacion ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
        }

        // Mapeo seguro contemplando propiedades del backend o de respaldo
        const cabania = resena.cabaniaNombre || resena.cabania || 'Cabaña';
        const huesped = resena.huespedNombre || resena.huesped || 'Huésped';
        const fechas = resena.fechasEstadia || resena.fechas || '--';
        const idResena = resena.id ? `#${resena.id}` : '#--';
        const comentarioTexto = resena.comentario ? resena.comentario : '';

        tr.innerHTML = `
            <td><strong>${cabania}</strong></td>
            <td>${huesped}</td>
            <td>${fechas}</td>
            <td>
                <div class="estrellas-cell" style="color: #ffc107; display: flex; align-items: center; gap: 0.2rem;">
                    ${estrellasHtml}
                    <span style="color: #6c757d; font-size: 0.85rem; margin-left: 0.4rem;">(${resena.puntuacion}/5)</span>
                </div>
            </td>
            <td>"${comentarioTexto.substring(0, 45)}..."</td>
        `;

        // Evento para abrir modal al hacer clic en la fila pasándole el objeto unificado
        tr.addEventListener('click', () => abrirModalResena({
            cabania,
            huesped,
            fechas,
            puntuacion: resena.puntuacion,
            comentario: comentarioTexto
        }));
        
        tbody.appendChild(tr);
    });
}

function abrirModalResena(resena) {
    document.getElementById('rgModalCabania').textContent = resena.cabania;
    document.getElementById('rgModalHuesped').textContent = resena.huesped;
    document.getElementById('rgModalEstadia').textContent = resena.fechas;
    
    let estrellasHtml = '';
    for (let i = 1; i <= 5; i++) {
        estrellasHtml += i <= resena.puntuacion ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    }
    
    document.getElementById('rgModalPuntuacion').innerHTML = `<div style="color: #ffc107; display: inline-flex; align-items: center; gap: 0.2rem;">${estrellasHtml} <span style="color: #6c757d; margin-left: 5px;">(${resena.puntuacion}/5)</span></div>`;
    document.getElementById('rgModalComentario').textContent = `"${resena.comentario}"`;

    document.getElementById('modalDetalleResenaGeneral').classList.add('active');
}

function configurarModalResenas() {
    const modal = document.getElementById('modalDetalleResenaGeneral');
    const btnClose = document.getElementById('btnCloseModalResenaGeneral');

    if (btnClose) {
        btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}