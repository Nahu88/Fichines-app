import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { Usuario, UsuarioSchema } from './entities/usuario.entity.js';

@Module({
  // Registra el modelo "Usuario" para poder inyectarlo con @InjectModel.
  imports: [MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  // Lo exportamos para que AuthModule pueda usar UsuariosService.
  exports: [UsuariosService],
})
export class UsuariosModule {}