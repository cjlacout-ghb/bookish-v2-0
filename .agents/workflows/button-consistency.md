---
description: Mantener consistencia visual y de comportamiento en los botones de Bookish.
---
# Workflow: Consistencia de Botones ◆ "El Archivo Noir"

Para asegurar que todos los botones de la aplicación respiren la estética Art Déco del proyecto y mantengan un comportamiento predecible para el usuario, sigue estas reglas:

## 1. Estructura de Clases
Todos los botones deben utilizar la clase base `.btn` combinada con una variante de color y, opcionalmente, de tamaño.

- **Primario (Model: Actualizar/Guardar)**: Utiliza `.btn-primario`.
  - Color: Oro primario (`#c9a84c`).
  - Uso: Acciones que confirman, guardan o avanzan (ej. Guardar, Actualizar, Agregar).
- **Secundario (Model: Volver/Cancelar)**: Utiliza `.btn-secundario`.
  - Color: Oro silenciado/texto beige.
  - Uso: Acciones de navegación hacia atrás, cancelación o cierres de modal.
- **Peligro (Model: Eliminar)**: Utiliza `.btn-peligro`.
  - Color: Rojo advertencia (`#c0392b`).
  - Uso: Acciones destructivas (Eliminar libro, Borrar nota).

## 2. Unificación de Otros Botones del Sistema
Aunque no lleven la clase `.btn` explícitamente, los siguientes elementos **deben** seguir la misma estética visual de 1px de borde y fondo de superficie:
- **Filtros**: Clase `.filtro-btn` en Biblioteca.
- **Toggles**: Clase `.toggle-btn` en Modales.
- **Botones de Archivo**: Clase `.btn-archivo` en formularios.
- **Iconos de Acción**: Clase `.btn-icono`.

## 3. Tamaños
- **Estándar**: Por defecto (clase `.btn`).
- **Pequeño**: Para interfaces compactas, usa `.btn-sm`. **Bajo ninguna circunstancia se deben usar estilos inline (como padding o font-size manuales) en el JSX**.

## 4. Estado de Advertencia (Doble Confirmación)
Cualquier acción destructiva (especialmente las que usen `.btn-peligro`) **DEBE** implementar un estado de advertencia de doble confirmación con este patrón visual unificado:

1. **Estado Inicial**: Botón con etiqueta clara (ej: "✕ Eliminar").
2. **Estado de Confirmación**: Al hacer clic, el botón se transforma en un contenedor de alerta que:
   - Indica el peligro en color rojo (ej: `<span style={{ ... }}>¿CONFIRMAR?</span>`).
   - Muestra el fondo `var(--sup-alta)` y borde `1px solid var(--texto-error)`.
   - Ofrece botones `.btn-sm` para `SÍ` y `NO`.

## 5. Especificaciones Visuales Críticas (CSS)
- **Bordes**: Siempre **1px sólido**. Nunca usar 0.5px para botones de acción.
- **Fondo**: Siempre `var(--superficie)` para mantener el contraste Noir.
- **Tipografía**: Siempre Cinzel (Titular) con `text-transform: uppercase`.
- **Transiciones**: Deben usar `all var(--transicion)` para suavidad en hover y cambios de estado.

---
// turbo-all
