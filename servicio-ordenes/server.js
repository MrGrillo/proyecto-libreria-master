// servicio-ordenes/server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3002;

app.use(express.json());

// Arreglo en memoria para almacenar las órdenes generadas
let ordenes = [];
let contadorId = 1;

// URL de conexión hacia el otro microservicio
const CATALOGO_URL = process.env.CATALOGO_URL || 'https://proyecto-libreri-9609x7ols-carlos-bojorquez-s-projects.vercel.app/api/libros';

// Endpoint proxy: obtener el catálogo completo desde el servicio de catálogo
app.get('/api/libros', async (req, res) => {
    try {
        const respuestaCatalogo = await axios.get(CATALOGO_URL);
        res.status(200).json(respuestaCatalogo.data);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo obtener el catálogo de libros.' });
    }
});

// Endpoint: Crear una nueva orden de compra
app.post('/api/ordenes', async (req, res) => {
    const { libroId, cantidad, cliente } = req.body;

    // Validación básica de entrada
    if (!libroId || !cantidad || !cliente) {
        return res.status(400).json({ error: "Faltan datos obligatorios: libroId, cantidad o cliente." });
    }

    try {
        // 1. Comunicación Síncrona: Preguntar al Servicio de Catálogo por el libro
        const respuestaCatalogo = await axios.get(`${CATALOGO_URL}/${libroId}`);
        const libro = respuestaCatalogo.data;

        // 2. Lógica del Reto Extra: Verificar si hay suficiente Stock
        if (libro.stock < cantidad) {
            return res.status(400).json({ 
                error: `Fondos de inventario insuficientes. Solo quedan ${libro.stock} unidades de este libro.` 
            });
        }

        // 3. Calcular Total a Pagar
        const totalAPagar = libro.precio * cantidad;

        // 4. Crear el registro de la orden
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

        // 5. Opcional/Recomendado: Avisarle al catálogo que reste el stock vendido
        await axios.post(`${CATALOGO_URL}/${libroId}/restar-stock`, { cantidad });

        // Responder con éxito (201 Created)
        res.status(201).json({
            mensaje: "¡Orden generada con éxito!",
            orden: nuevaOrden
        });

    } catch (error) {
        // Manejo de errores en la comunicación HTTP
        if (error.response && error.response.status === 404) {
            // El catálogo respondió con un 404 explícito
            return res.status(404).json({ error: "La orden no pudo procesarse porque el libro no existe." });
        }
        // Cualquier otro fallo de red o del servidor
        res.status(500).json({ error: "Error de comunicación entre los servicios de la plataforma." });
    }
});

// Endpoint adicional para que puedas ver todas las órdenes acumuladas
app.get('/api/ordenes', (req, res) => {
    res.json(ordenes);
});

// Servir frontend estático después de las rutas API
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Servicio de Órdenes corriendo en http://localhost:${PORT}`);
});

module.exports = app;