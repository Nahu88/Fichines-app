export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagenUrl: string;
  tipo: 'logro' | 'party' | 'duda';
  juego: string;
  plataforma: string;
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    imagenUrl: string;
  };
  meGusta: string[]; // _id de los usuarios que le dieron me gusta
  cantidadMeGusta: number;
  cantidadComentarios: number;
  createdAt: string;
}

export interface PaginaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
}
