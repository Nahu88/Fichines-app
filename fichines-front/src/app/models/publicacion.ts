// Así es una publicación tal como la devuelve el back.
export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagenUrl: string;
  tipo: 'logro' | 'party' | 'duda';
  juego: string;
  plataforma: string;
  // El back hace populate: en vez del _id del autor manda sus datos.
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    imagenUrl: string;
  };
  meGusta: string[]; // _id de los usuarios que le dieron me gusta
  cantidadMeGusta: number;
  createdAt: string;
}

// Respuesta del GET /publicaciones: una página de publicaciones y el total que hay.
export interface PaginaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
}
