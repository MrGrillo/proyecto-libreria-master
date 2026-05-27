// servicio-catalogo/server.js
const express = require('express');
const app = express();
const PORT = 3001;

// Permitir que Express entienda JSON en las peticiones
app.use(express.json());

// Arreglo en memoria simulando la Base de Datos (Incluye el Reto Extra: stock)
let libros = [
    { id: 1, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", precio: 250, stock: 10 },
    { id: 2, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", precio: 300, stock: 5 },
    { id: 3, titulo: "El Principito", autor: "Antoine de Saint-Exupéry", precio: 150, stock: 2 },
    { id: 4, titulo: "1984", autor: "George Orwell", precio: 200, stock: 8 },
    { id: 5, titulo: "Pedro Páramo", autor: "Juan Rulfo", precio: 180, stock: 0 } // Sin stock para pruebas
];

// Endpoint: Obtener todos los libros del catálogo
app.get('/api/libros', (req, res) => {
    res.status(200).json(libros);
});

// Endpoint: Obtener un libro por su ID
app.get('/api/libros/:id', (req, res) => {
    const libroId = parseInt(req.params.id);
    const libro = libros.find(l => l.id === libroId);

    // Error: Si el libro no existe
    if (!libro) {
        return res.status(404).json({ error: "El libro solicitado no existe en el catálogo." });
    }

    // Éxito: Retorna el libro
    res.status(200).json(libro);
});

// EXTRA: Endpoint interno para que el servicio de órdenes reduzca el stock tras una compra exitosa
app.post('/api/libros/:id/restar-stock', (req, res) => {
    const libroId = parseInt(req.params.id);
    const { cantidad } = req.body;
    const libro = libros.find(l => l.id === libroId);

    if (libro && libro.stock >= cantidad) {
        libro.stock -= cantidad; // Descontar del inventario
        return res.status(200).json({ mensaje: "Stock actualizado", stockRestante: libro.stock });
    }
    res.status(400).json({ error: "No se pudo actualizar el stock." });
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servicio de Catálogo corriendo en http://localhost:${PORT}`);
});