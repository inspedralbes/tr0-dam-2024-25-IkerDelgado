const express = require('express');
const fs = require('fs');
const path = require('path');  // Importar el módulo 'path' para manejar rutas
const cors = require('cors');  // Importar cors

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());  // Habilitar CORS para todas las rutas
app.use(express.json());  // Para parsear JSON

// Ruta para obtener todas las preguntas
app.get('/api/preguntes', function(req, res) {
    const filePath = path.join(__dirname, 'preguntes.json'); // Usar path.join para asegurar la ruta correcta
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            console.error(err);  // Imprimir el error en la consola
            return res.status(500).send({ message: 'Error al leer el archivo' });
        }
        res.send(JSON.parse(data).preguntes);
    });
});

// Ruta para obtener una pregunta por ID
app.get('/api/preguntes/:id', function(req, res) {
    const id = parseInt(req.params.id); // Pilla la id que puso el cliente
    const filePath = path.join(__dirname, 'preguntes.json');
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al leer el archivo' });
        }
        const preguntes = JSON.parse(data).preguntes;
        const pregunta = preguntes.find(function(p) {
            return p.id === id;
        });
        if (pregunta) {
            res.send(pregunta);
        } else {
            res.status(404).send({ message: 'Pregunta no encontrada' });
        }
    });
});

// Ruta para agregar una nueva pregunta
app.post('/api/preguntes', function(req, res) {
    let newPregunta = req.body;
    const filePath = path.join(__dirname, 'preguntes.json');
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al leer el archivo' });
        }
        const json = JSON.parse(data);
        const newId = json.preguntes.length + 1;

        // Hacemos esto para que el id aparezca al principio del .json
        newPregunta = {
            id: newId,
            pregunta: newPregunta.pregunta,
            respostes: newPregunta.respostes,
            resposta_correcta: newPregunta.resposta_correcta,
            imatge: newPregunta.imatge
        };

        json.preguntes.push(newPregunta);
        fs.writeFile(filePath, JSON.stringify(json, null, 2), function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error al guardar la pregunta' });
            }
            console.log('Pregunta añadida correctamente:', newPregunta);
            res.status(201).send(newPregunta);
        });
    });
});

// Ruta para actualizar una pregunta
app.put('/api/preguntes/:id', function(req, res) {
    const id = parseInt(req.params.id);
    const updatedPregunta = req.body;
    const filePath = path.join(__dirname, 'preguntes.json');

    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) return res.status(500).send({ message: 'Error al leer el archivo' });

        const json = JSON.parse(data);
        const pregunta = json.preguntes.find(p => p.id === id);

        if (pregunta) {
            Object.assign(pregunta, updatedPregunta); // Actualiza los valores de la pregunta
            fs.writeFile(filePath, JSON.stringify(json, null, 2), function(err) {
                if (err) return res.status(500).send({ message: 'Error al guardar la pregunta actualizada' });
                res.send(pregunta); // Responde con la pregunta actualizada
            });
        } else {
            res.status(404).send({ message: 'Pregunta no encontrada' });
        }
    });
});

// Ruta para eliminar una pregunta
app.delete('/api/preguntes/:id', function(req, res) {
    const id = parseInt(req.params.id);
    const filePath = path.join(__dirname, 'preguntes.json');

    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) return res.status(500).send({ message: 'Error al leer el archivo' });

        const json = JSON.parse(data);
        const index = json.preguntes.findIndex(p => p.id === id);

        if (index !== -1) {
            json.preguntes.splice(index, 1); // Elimina la pregunta
            fs.writeFile(filePath, JSON.stringify(json, null, 2), function(err) {
                if (err) return res.status(500).send({ message: 'Error al guardar el archivo' });
                res.send({ message: 'Pregunta eliminada' }); // Responde con éxito
            });
        } else {
            res.status(404).send({ message: 'Pregunta no encontrada' });
        }
    });
});
app.get('/api/hola', function(req, res) {
    const { spawn } = require('child_process');
  
    console.log("Inicio del proceso");
  
    const pythonProcess = spawn('python', ['./server.py', 'text', '4']);
    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();  
        console.log('[Mensaje recibido desde Python:] ', pythonOutput.trim(), "  [end message]");
    });
    pythonProcess.on('close', (code) => {
        console.log(`El proceso de Python se cerró con el código ${code}`);
        if (code === 0) {
            res.json({ message: pythonOutput.trim() });
        } else {
            res.status(500).json({ error: 'El script de Python no se ejecutó correctamente.' });
        }
    });
    pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString().trim();
        console.error('Error en el proceso de Python:', errorMessage);
        res.status(500).json({ error: errorMessage }); // Enviar el error al cliente
    });
  });

app.listen(PORT, function() {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});