import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ImageModule } from './image/image.module';

@Module({
  imports: [ImageModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [ImageModule],
})
export class MediaModule {}
