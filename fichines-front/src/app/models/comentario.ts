// Así es un comentario tal como lo devuelve el back.
export interface Comentario {
  _id: string;
  publicacion: string;
  mensaje: string;
  modificado: boolean; // true si el autor lo editó
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    imagenUrl: string;
  };
  createdAt: string;
}

// Respuesta del GET de comentarios: una tanda y el total que hay.
export interface PaginaComentarios {
  comentarios: Comentario[];
  total: number;
}
