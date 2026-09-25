import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import 'multer';

export interface ImageValidationOptions {
  required?: boolean;         // Si es obligatoria o no (por defecto: true)
  maxSizeInMb?: number;       // Peso máximo por imagen (por defecto: 5MB)
  maxCount?: number;          // Cantidad máxima de imágenes (por defecto: 5)
  allowedFormats?: string[];  // Formatos permitidos (por defecto: jpg, jpeg, png, webp)
}

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly required: boolean;
  private readonly maxSize: number;
  private readonly maxCount: number;
  private readonly allowedFormats: string[];

  constructor(options: ImageValidationOptions = {}) {
    this.required = options.required ?? true;
    this.maxSize = (options.maxSizeInMb ?? 5) * 1024 * 1024; // 5MB por defecto
    this.maxCount = options.maxCount ?? 5; // Máximo 5 imágenes por defecto
    this.allowedFormats = options.allowedFormats ?? ['image/jpeg', 'image/png', 'image/webp'];
  }

  transform(files: Express.Multer.File | Express.Multer.File[]) {
    // 1. Validar si no se envió ninguna imagen
    if (!files || (Array.isArray(files) && files.length === 0)) {
      if (this.required) {
        throw new BadRequestException('Debes subir al menos una imagen');
      }
      return files;
    }

    const fileList = Array.isArray(files) ? files : [files];

    // 2. Controlar la cantidad máxima de imágenes
    if (fileList.length > this.maxCount) {
      throw new BadRequestException(`Solo puedes subir un máximo de ${this.maxCount} imágenes`);
    }

    // 3. Validar cada imagen (formato y peso)
    for (const file of fileList) {
      // Formato
      if (!this.allowedFormats.includes(file.mimetype)) {
        throw new BadRequestException(
          `Formato no permitido en '${file.originalname}'. Solo se aceptan: JPG, PNG, WEBP`,
        );
      }

      // Peso
      if (file.size > this.maxSize) {
        const mbLimit = this.maxSize / (1024 * 1024);
        throw new BadRequestException(
          `La imagen '${file.originalname}' supera el peso máximo permitido (${mbLimit}MB)`,
        );
      }
    }

    return files;
  }
}
