import { Module } from '@nestjs/common';
import { Users3dService } from './users-3d.service';
import { Users3dController } from './users-3d.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MicroservicesModule } from '../microservices/microservices.module';

@Module({
  imports: [PrismaModule, MicroservicesModule],
  controllers: [Users3dController],
  providers: [Users3dService],
  exports: [Users3dService],
})
export class Users3dModule {}
