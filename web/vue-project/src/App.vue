<template>
  <body>
     <div id="app">
    <h1><b>Gestió de Preguntes</b></h1>

    <!-- Listar preguntas -->
    <div v-if="preguntes.length">
      <h2>Preguntes</h2>
      <ul>
        <li v-for="pregunta in preguntes" :key="pregunta.id" class="question-item">
          <strong>{{ pregunta.pregunta }}</strong>
          <br>
          <img :src="pregunta.imatge" alt="Imatge de la pregunta" class="question-image"> <!-- Imagen debajo de la pregunta -->
          <ul>
            <li v-for="(resposta, index) in pregunta.respostes" :key="index">{{ resposta }}</li>
          </ul>
          <div class="question-actions">
            <button @click="deletePregunta(pregunta.id)">Eliminar</button>
            <button @click="editPregunta(pregunta)">Editar</button>
          </div>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>No hi ha preguntes disponibles.</p>
    </div>

    <!-- Agregar/Editar pregunta -->
    <div>
      <h2>{{ isEditing ? 'Editar Pregunta' : 'Nova Pregunta' }}</h2>
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
      maxRespostes: 0 // Para controlar el índice de respuesta correcta
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
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 20px;
  height: 100vh;
}

h1, h2 {
  color: #333;
  font-weight: bold; /* Negrita para títulos */
}

ul {
  list-style-type: none;
  padding: 0;
}

.question-image {
  width: 240px; 
  height: 240px; 
  object-fit: cover; 
  border-radius: 8px;
}

li {
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  font-weight: bold; /* Negrita para el contenido de las preguntas */
}

.correct-answer {
  color: green; /* Color verde para la respuesta correcta */
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #4CAF50; /* Color por defecto */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s; /* Transición suave */
}

button:hover {
  background-color: #45a049; /* Efecto hover para botón por defecto */
}

button.delete {
  background-color: #f44336; /* Color rojo para el botón de eliminar */
}

button.delete:hover {
  background-color: #d32f2f; /* Efecto hover para el botón de eliminar */
}

form div {
  margin-bottom: 10px;
}

label {
  font-weight: bold; /* Negrita para etiquetas */
}

input[type="text"],
input[type="number"] {
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"] {
  background-color: #008CBA; /* Color para botón de enviar */
}

button[type="submit"]:hover {
  background-color: #007BB5; /* Efecto hover para botón de enviar */
}
</style>