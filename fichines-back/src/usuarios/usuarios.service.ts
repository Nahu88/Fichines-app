import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './entities/usuario.entity.js';

// relaciona con mongo
// el modulo de autenticación lo usa por eso se exporta en usuarios.module
@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>) {}

  crear(datos: Partial<Usuario>) {
    return this.usuarioModel.create(datos);
  }

  // Busca si ya existe alguien con ese correo O con ese nombre de usuario.
  buscarPorCorreoOUsuario(correo: string, usuario: string) {
    return this.usuarioModel
      .findOne({ $or: [{ correo: correo.toLowerCase() }, { usuario: usuario }] })
      .exec();
  }

  // Para el login: lo que escribió la persona puede ser el correo o el usuario,
  // así que buscamos en los dos campos.
  buscarPorIdentificador(identificador: string) {
    return this.usuarioModel
      .findOne({ $or: [{ correo: identificador.toLowerCase() }, { usuario: identificador }] })
      .exec();
  }
}