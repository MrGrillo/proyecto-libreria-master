// servicio-ordenes/server.js
const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

// Copia de los libros (mismos datos que el catálogo)
let libros = [
    { id: 1, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", precio: 250, stock: 10 },
    { id: 2, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", precio: 300, stock: 5 },
    { id: 3, titulo: "El Principito", autor: "Antoine de Saint-Exupéry", precio: 150, stock: 2 },
    { id: 4, titulo: "1984", autor: "George Orwell", precio: 200, stock: 8 },
    { id: 5, titulo: "Pedro Páramo", autor: "Juan Rulfo", precio: 180, stock: 0 }
];

let ordenes = [];
let contadorId = 1;

// El frontend llama /api/libros — respondemos con el catálogo
app.get('/api/libros', (req, res) => {
    res.status(200).json(libros);
});

// Crear una nueva orden
app.post('/api/ordenes', (req, res) => {
    const { libroId, cantidad, cliente } = req.body;

    if (!libroId || !cantidad || !cliente) {
        return res.status(400).json({ error: "Faltan datos obligatorios: libroId, cantidad o cliente." });
    }

    const libro = libros.find(l => l.id === libroId);

    if (!libro) {
        return res.status(404).json({ error: "La orden no pudo procesarse porque el libro no existe." });
    }

    if (libro.stock < cantidad) {
        return res.status(400).json({ 
            error: `Fondos de inventario insuficientes. Solo quedan ${libro.stock} unidades de este libro.` 
        });
    }

    const totalAPagar = libro.precio * cantidad;
    libro.stock -= cantidad;

    const nuevaOrden = {
        id: contadorId++,
        cliente,
        libroId,
        tituloLibro: libro.titulo,
        cantidad,
        totalAPagar,
        fecha: new Date()
    };
    ordenes.push(nuevaOrden);

    res.status(201).json({
        mensaje: "¡Orden generada con éxito!",
        orden: nuevaOrden
    });
});

// Ver todas las órdenes
app.get('/api/ordenes', (req, res) => {
    res.json(ordenes);
});

app.listen(PORT, () => {
    console.log(`Servicio de Órdenes corriendo en http://localhost:${PORT}`);
});

module.exports = app;