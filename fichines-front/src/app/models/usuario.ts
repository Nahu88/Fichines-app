export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenUrl: string;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
  createdAt: string;
}

// Respuesta del login y el registro.
export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}
