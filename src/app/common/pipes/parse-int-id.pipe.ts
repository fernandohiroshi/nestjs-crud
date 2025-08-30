import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PaserIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parseValue = Number(value);

    if (isNaN(parseValue)) {
      throw new BadRequestException('ParseIntIdPipe need numeric string!');
    }

    if (parseValue < 0) {
      throw new BadRequestException(
        'ParseIntIdPipe expects a number greater than 0',
      );
    }

    return parseValue;
  }
}
