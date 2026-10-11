import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CausesModule } from './causes/causes.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ParticipationsModule } from './participations/participations.module';
import { MatchesModule } from './matches/matches.module';
import { MediaModule } from './media/media.module';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST') || 'localhost',
                port: Number(configService.get<string | number>('POSTGRES_PORT') || 5433),
                username: configService.get<string>('POSTGRES_USER') || 'postgres',
                password: configService.get<string>('POSTGRES_PASSWORD') || 'postgres',
                database: configService.get<string>('POSTGRES_DB') || 'kindly_db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        AuthModule,
        UsersModule,
        VolunteersModule,
        OrganizationsModule,
        CausesModule,
        AnnouncementsModule,
        ParticipationsModule,
        MatchesModule,
        MediaModule,
        AchievementsModule,
    ],
})
export class AppModule {}
