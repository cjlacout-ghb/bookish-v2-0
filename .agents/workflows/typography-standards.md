---
description: Estándares de tipografía y escala visual para Bookish — El Archivo Noir.
---

# 📜 Regla de Tipografía y Escala Visual

Para mantener la legibilidad premium y la estética "Noir/Art Déco" de Bookish, toda nueva interfaz o componente debe seguir la escala establecida en la sección de **Edición** (`FormLibro.jsx`).

## 📐 Escala de Referencia (REMs)

| Nivel | Tamaño | Familia Tipográfica | Uso Típico |
| :--- | :--- | :--- | :--- |
| **H1 / Héroe** | `2.1rem` - `3rem` | `Cinzel` | Títulos principales de página, Landing hero |
| **H2 / Destacados** | `1.5rem` - `1.8rem` | `Cinzel` / `EB Garamond` | Títulos de libro, Entradas destacadas (Editar) |
| **Contenido Principal** | `1.1rem` - `1.25rem` | `EB Garamond` | Texto de tarjetas de libro, Entradas de datos (`.campo__entrada`) |
| **Cuerpo / Botones** | `1.0rem` | `EB Garamond` / `Cinzel` | Párrafos estándar, Navegación principal, Botones estándar |
| **Etiquetas / Metadata** | `0.8rem` - `0.85rem`| `EB Garamond` / `Cinzel` | Labels (`.campo__etiqueta`), Subtítulos, Estadísticas secundarias |
| **Micro-texto / Badges**| `0.7rem` - `0.75rem`| `Cinzel` | Badges de estado, Etiquetas mini, Detalles técnicos |

## 🚫 Restricciones Críticas

1.  **Legibilidad mínima:** Bajo ninguna circunstancia se debe usar un `font-size` menor a **0.7rem**.
2.  **Consistencia de Labels:** Todas las etiquetas de campo (`label`) deben mantenerse en el rango de **0.8rem - 0.85rem**.
3.  **Jerarquía de Inputs:** Toda entrada de datos estándar debe heredar el tamaño de **1.15rem** definido en `.campo__entrada`.
4.  **Separación de Estilos:** Se prefiere el uso de clases globales definidas en `global.css` frente a estilos inline o locales para asegurar que los cambios de escala se propaguen correctamente.

## ✍️ Nota de Aplicación
Esta regla se estableció después de la nivelación masiva de toda la aplicación para garantizar que Bookish no pierda su legibilidad "Noir" conforme crezca el sistema.
