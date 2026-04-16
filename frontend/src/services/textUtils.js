/**
 * Utilidades de formateo de texto para Bookish.
 */

/**
 * Formatea el título del libro: SIEMPRE EN MAYÚSCULAS.
 * @param {string} titulo 
 * @returns {string}
 */
export const formatTitle = (titulo) => {
  if (!titulo) return '';
  return titulo.toUpperCase().trim();
};

/**
 * Formatea el nombre del autor: Primera letra de cada palabra en mayúscula, resto en minúsculas.
 * Ejemplo: "louisa may alcott" -> "Louisa May Alcott"
 * @param {string} autor 
 * @returns {string}
 */
export const formatAuthor = (autor) => {
  if (!autor) return '';
  return autor
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
