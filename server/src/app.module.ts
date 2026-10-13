import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            port: Number(process.env.POSTGRES_PORT || 5433),
            username: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'postgres',
            database: process.env.POSTGRES_DB || 'kindly_db',
            autoLoadEntities: true,
            synchronize: true,
            ssl:
                process.env.POSTGRES_SSL === 'true' ||
                (Boolean(process.env.POSTGRES_HOST) &&
                    process.env.POSTGRES_HOST !== 'localhost')
                    ? { rejectUnauthorized: false }
                    : false,
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
