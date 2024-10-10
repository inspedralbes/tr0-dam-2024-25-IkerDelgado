import os
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import warnings

warnings.filterwarnings('ignore')


def mostrar_estadisticas():
    try:
        # Obtén la ruta absoluta del archivo
        file_path = os.path.join(os.path.dirname(__file__), 'estadisticas.json')
        
        # Abre el archivo usando la ruta absoluta
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: El archivo 'estadisticas.json' no se encontró en la ruta: {file_path}")
        return
    except json.JSONDecodeError:
        print("Error: El archivo 'estadisticas.json' no se pudo leer. Verifica que tenga un formato JSON válido.")
        return
    except Exception as e:
        print(f"Se produjo un error inesperado: {e}")
        return

    # Resto de tu código para procesar y mostrar las estadísticas
    preguntas = data.get('preguntas', {})
    if not preguntas:
        print("Error: No se encontraron preguntas en el archivo JSON.")
        return

    df = pd.DataFrame(preguntas).T

    if 'correctas' not in df.columns or 'incorrectas' not in df.columns:
        print("Error: Las columnas 'correctas' e 'incorrectas' no se encontraron en el DataFrame.")
        print("Columnas disponibles:", df.columns.tolist())
        return

    x = np.arange(len(df))
    width = 0.35  # Ajustar el ancho de las barras

    # Crear la figura y el eje
    fig, ax = plt.subplots(figsize=(10, 6))  # Tamaño de la figura

    # Crear las barras
    rects1 = ax.bar(x - width / 2, df['correctas'], width, label='Correctas', color='#4CAF50', edgecolor='black')  # Verde
    rects2 = ax.bar(x + width / 2, df['incorrectas'], width, label='Incorrectas', color='#F44336', edgecolor='black')  # Rojo

    # Mejorar el diseño
    ax.set_xlabel('Preguntas', fontsize=14)
    ax.set_ylabel('Veces Respondidas', fontsize=14)  
    ax.set_title('Estadísticas de las Preguntas', fontsize=16, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(df.index, rotation=45, ha='right')  
    ax.legend(fontsize=12)

    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))

    ax.yaxis.grid(True, linestyle='--', alpha=0.7)  

    plt.tight_layout()

    plt.show()

if __name__ == "__main__":
    mostrar_estadisticas()
