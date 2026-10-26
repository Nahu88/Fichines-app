// Así es un usuario tal como lo devuelve el back (sin la contraseña).
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
