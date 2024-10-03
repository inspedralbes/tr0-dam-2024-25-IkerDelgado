<template>
  <body>
     <div id="app">
    <h1><b>Gestió de Preguntes</b></h1>

    <!-- Listar preguntas -->
    <div v-if="preguntes.length">
      <h2>Preguntes</h2>
      <button @click="obtenerMensaje()">Ver estadisticas</button>
      <ul>
        <li v-for="pregunta in preguntes" :key="pregunta.id" class="question-item">
          <strong>{{ pregunta.pregunta }}</strong>
          <br>
          <img :src="pregunta.imatge" alt="Imatge de la pregunta" class="question-image"> <!-- Imagen debajo de la pregunta -->
          <ul>
            <li v-for="(resposta, index) in pregunta.respostes" :key="index">{{ resposta }}</li>
          </ul>
          <div class="question-actions">
            <button onclick="location.href='#editarl'" @click="editPregunta(pregunta)">Editar</button>
            <button @click="deletePregunta(pregunta.id)">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>No hi ha preguntes disponibles.</p>
    </div>

    <!-- Agregar/Editar pregunta -->
    <div>
      <h2 id="editarl">{{ isEditing ? 'Editar Pregunta' : 'Nova Pregunta' }}</h2>
      <form @submit.prevent="submitForm">
        <div>
          <label>Pregunta:</label>
          <input type="text" v-model="newPregunta.pregunta" required>
        </div>
        <div>
          <label>Respostes (separades per comes):</label>
          <input type="text" v-model="newPreguntaRespostes" required>
        </div>
        <div>
          <label>Resposta Correcta (índex):</label>
          <input type="number" v-model="newPregunta.resposta_correcta" min="0" :max="maxRespostes" required>
        </div>
        <div>
          <label>Imatge (URL):</label>
          <input type="text" v-model="newPregunta.imatge" required>
        </div>
        <button type="submit">{{ isEditing ? 'Guardar Canvis' : 'Afegir Pregunta' }}</button>
        <button @click="cancelEdit" v-if="isEditing" type="button">Cancelar</button>
      </form>
    </div>
  </div>
  </body>
</template>

<script>
export default {
  data() {
    return {
      preguntes: [],
      newPregunta: {
        pregunta: '',
        respostes: [],
        resposta_correcta: 0,
        imatge: ''
      },
      newPreguntaRespostes: '',
      isEditing: false,
      editPreguntaId: null,
      maxRespostes: 0 
    };
  },
  mounted() {
    this.getPreguntes();
  },
  methods: {
    async getPreguntes() {
      try {
        const response = await fetch('http://localhost:3000/api/preguntes');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        this.preguntes = data;
        this.maxRespostes = data.length > 0 ? data[0].respostes.length - 1 : 0; // Definir el maxRespostes
      } catch (error) {
        console.error('Error al obtener las preguntas:', error);
        alert('No es va poder carregar les preguntes.'); // Mensaje de error al usuario
      }
    },
    async deletePregunta(id) {
      try {
        const response = await fetch(`http://localhost:3000/api/preguntes/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        this.getPreguntes(); // Recarga la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar la pregunta:', error);
        alert('No es va poder eliminar la pregunta.'); // Mensaje de error al usuario
      }
    },
    async obtenerMensaje() {
      try {
        const response = await fetch('http://localhost:3000/api/hola');  // Ajusta la URL según tu servidor
        if (!response.ok) {
          throw new Error('Error al obtener el mensaje');
        }
        const data = await response.json();
        alert(data.message);  // Muestra un alert con el mensaje obtenido del servidor
      } catch (error) {
        console.error('Error al hacer fetch:', error);
        alert('Hubo un problema al obtener el mensaje');  // Muestra un alert si hay un error
      }
    },
    editPregunta(pregunta) {
      this.isEditing = true;
      this.newPregunta = { ...pregunta };
      this.newPreguntaRespostes = pregunta.respostes.join(', ');
      this.editPreguntaId = pregunta.id;
    },
    async submitForm() {
      this.newPregunta.respostes = this.newPreguntaRespostes.split(',').map(r => r.trim());
      try {
        const method = this.isEditing ? 'PUT' : 'POST';
        const url = this.isEditing 
          ? `http://localhost:3000/api/preguntes/${this.editPreguntaId}` 
          : 'http://localhost:3000/api/preguntes';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newPregunta)
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        this.getPreguntes();
        this.resetForm();
      } catch (error) {
        console.error('Error al guardar la pregunta:', error);
        alert('No es va poder guardar la pregunta.'); // Mensaje de error al usuario
      }
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.newPregunta = {
        pregunta: '',
        respostes: [],
        resposta_correcta: 0,
        imatge: ''
      };
      this.newPreguntaRespostes = '';
      this.isEditing = false;
      this.editPreguntaId = null;
    }
  }
};
</script>

<style scoped>
#app {
  font-family: 'Roboto', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f9;
  min-height: 100vh;
}

h1, h2 {
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 3px solid #3498db;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 1.8rem; }

ul { list-style: none; padding: 0; }

.question-item {
  background: #fff; border-radius: 10px; padding: 20px; margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: transform 0.3s, box-shadow 0.3s;
}

.question-item:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); }

.question-image { width: 100%; height: auto; max-width: 300px; border-radius: 10px; margin-top: 10px; }

.question-actions { display: flex; justify-content: space-between; margin-top: 10px; }

button {
  padding: 10px 20px; border: none; border-radius: 50px; cursor: pointer; font-size: 1rem;
  transition: background-color 0.3s, transform 0.3s;
}

button { background: #3498db; color: #fff; }
button:hover { background: #2980b9; transform: translateY(-2px); }

button.delete { background: #e74c3c; }
button.delete:hover { background: #c0392b; }

form div { margin-bottom: 15px; }
label { font-weight: bold; color: #2c3e50; font-size: 1.1rem; }

input[type="text"], input[type="number"] {
  padding: 10px; width: 100%; border: 1px solid #ccc; border-radius: 10px; font-size: 1rem;
}

button[type="submit"] { background: #1abc9c; }
button[type="submit"]:hover { background: #16a085; }

button[type="button"] { background: #f39c12; }
button[type="button"]:hover { background: #e67e22; }

p { color: #7f8c8d; font-size: 1.2rem; }
#editarl { margin-top: 50px; border-bottom: 2px solid #1abc9c; padding-bottom: 10px; }
</style>