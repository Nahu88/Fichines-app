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

export interface PaginaComentarios {
  comentarios: Comentario[];
  total: number;
}
