import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { MatchesModule } from './matches/matches.module';
import { MatchingModule } from './match/matching.module';
import { ParticipationModule } from './participation/participation.module';
import { SubmissionModule } from './submission/submission.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { CauseModule } from './cause/cause.module';
import { OrganizerModule } from './organizer/organizer.module';
import { VolunteersModule } from './volunteer/volunteers.module';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';

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
        OrganizerModule,
        CauseModule,
        AnnouncementModule,
        SubmissionModule,
        ParticipationModule,
        MatchingModule,
        MatchesModule,
        MediaModule,
    ],
})
export class AppModule {}
