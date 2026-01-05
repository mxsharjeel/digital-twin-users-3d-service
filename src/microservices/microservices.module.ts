import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ValidationService } from './validation.service';

@Module({
    imports: [
        ConfigModule,
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('AUTH_SERVICE_HOST', 'localhost'),
                        port: configService.get<number>('AUTH_SERVICE_PORT', 3009),
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'STRUCTURE_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('STRUCTURE_SERVICE_HOST', 'localhost'),
                        port: configService.get<number>('STRUCTURE_SERVICE_PORT', 3206),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [ValidationService],
    exports: [ClientsModule, ValidationService],
})
export class MicroservicesModule {}
