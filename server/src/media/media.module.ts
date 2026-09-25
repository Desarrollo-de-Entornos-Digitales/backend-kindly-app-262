import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ImageModule } from './image/image.module';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  imports: [ImageModule],
})
export class MediaModule {}
