const ordenForm = document.getElementById('ordenForm');
const notificaciones = document.getElementById('notificaciones');
const ordenResumen = document.getElementById('ordenResumen');
const ordenesLista = document.getElementById('ordenesLista');
const refrescarOrdenes = document.getElementById('refrescarOrdenes');
const mostrarLibrosBtn = document.getElementById('mostrarLibros');
const catalogoLibros = document.getElementById('catalogoLibros');
const librosLista = document.getElementById('librosLista');
const libroIdInput = document.getElementById('libroId');

function limpiarNotificaciones() {
    notificaciones.innerHTML = '';
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const item = document.createElement('div');
    item.className = `notification ${tipo}`;
    item.textContent = mensaje;
    notificaciones.prepend(item);
}

function mostrarResumenOrden(orden) {
    ordenResumen.textContent = `ID Orden: ${orden.id}\nCliente: ${orden.cliente}\nLibro: ${orden.tituloLibro}\nCantidad: ${orden.cantidad}\nTotal a pagar: $${orden.totalAPagar}\nFecha: ${new Date(orden.fecha).toLocaleString()}`;
}

async function cargarOrdenes() {
    ordenesLista.innerHTML = '<li>Cargando órdenes...</li>';
    try {
        const response = await fetch('/api/ordenes');
        const ordenes = await response.json();

        if (!Array.isArray(ordenes) || ordenes.length === 0) {
            ordenesLista.innerHTML = '<li>No hay órdenes registradas.</li>';
            return;
        }

        ordenesLista.innerHTML = '';
        ordenes.forEach((orden) => {
            const li = document.createElement('li');
            li.textContent = `#${orden.id} - ${orden.cliente} compró ${orden.cantidad} x ${orden.tituloLibro} (Total: $${orden.totalAPagar})`;
            ordenesLista.appendChild(li);
        });
    } catch (error) {
        ordenesLista.innerHTML = '<li>Error al cargar las órdenes.</li>';
        mostrarNotificacion('No se pudo conectar con el servicio de órdenes.', 'error');
    }
}

async function cargarLibros() {
    librosLista.innerHTML = '<li>Cargando catálogo...</li>';
    try {
        const response = await fetch('/api/libros');
        const libros = await response.json();

        if (!Array.isArray(libros) || libros.length === 0) {
            librosLista.innerHTML = '<li>No hay libros disponibles.</li>';
            return;
        }

        librosLista.innerHTML = '';
        libros.forEach((libro) => {
            const item = document.createElement('li');
            item.className = 'catalogue-item';
            item.innerHTML = `<strong>ID ${libro.id} - ${libro.titulo}</strong>Precio: $${libro.precio} | Stock: ${libro.stock}`;
            item.addEventListener('click', () => {
                libroIdInput.value = libro.id;
                mostrarNotificacion(`Seleccionaste el libro ${libro.titulo} (ID ${libro.id}).`, 'success');
                catalogoLibros.classList.add('hidden');
            });
            librosLista.appendChild(item);
        });
    } catch (error) {
        librosLista.innerHTML = '<li>No se pudo cargar el catálogo.</li>';
        mostrarNotificacion('Error al obtener los libros del catálogo.', 'error');
    }
}

function toggleCatalogo() {
    catalogoLibros.classList.toggle('hidden');
    if (!catalogoLibros.classList.contains('hidden')) {
        cargarLibros();
    }
}

mostrarLibrosBtn.addEventListener('click', toggleCatalogo);
libroIdInput.addEventListener('focus', () => {
    if (catalogoLibros.classList.contains('hidden')) {
        toggleCatalogo();
    }
});

ordenForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    limpiarNotificaciones();

    const libroId = Number(document.getElementById('libroId').value);
    const cantidad = Number(document.getElementById('cantidad').value);
    const cliente = document.getElementById('cliente').value.trim();

    if (!libroId || !cantidad || !cliente) {
        mostrarNotificacion('Debes completar todos los campos.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/ordenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ libroId, cantidad, cliente })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacion('Orden creada con éxito.', 'success');
            mostrarResumenOrden(data.orden);
            cargarOrdenes();
        } else {
            const mensaje = data.error || 'Ocurrió un error al procesar la orden.';
            mostrarNotificacion(mensaje, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error de comunicación con el servicio de órdenes.', 'error');
    }
});

refrescarOrdenes.addEventListener('click', (event) => {
    event.preventDefault();
    cargarOrdenes();
});

cargarOrdenes();
