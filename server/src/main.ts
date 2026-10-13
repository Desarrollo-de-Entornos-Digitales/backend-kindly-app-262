import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let isServerReady = false;

async function bootstrapServerless() {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );
    await app.init();
    isServerReady = true;
}

if (!process.env.VERCEL) {
    async function bootstrap() {
        try {
            const dotenv = await import('dotenv');
            dotenv.config();
        } catch {}
        const app = await NestFactory.create(AppModule);
        app.enableCors();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
            }),
        );
        await app.listen(process.env.PORT ?? 3001);
    }
    bootstrap().catch((error) => {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    });
}

export default async function handler(req: any, res: any) {
    if (!isServerReady) {
        await bootstrapServerless();
    }
    return server(req, res);
}
