import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { Users3dModule } from './users-3d/users-3d.module';
import { MicroservicesModule } from './microservices/microservices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    Users3dModule,
    MicroservicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
