import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './entities/usuario.entity.js';

// Este servicio es el ÚNICO que habla con la colección "usuarios" de Mongo.
// El módulo de autenticación lo usa (por eso se exporta en usuarios.module).
@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>) {}

  crear(datos: Partial<Usuario>) {
    return this.usuarioModel.create(datos);
  }

  // Busca si ya existe alguien con ese correo O con ese nombre de usuario.
  // $or es un operador de Mongo: "que cumpla una condición o la otra".
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