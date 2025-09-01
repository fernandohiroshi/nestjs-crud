import { PaserIntIdPipe } from './parse-int-id.pipe';
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

describe('PaserIntIdPipe', () => {
  let pipe: PaserIntIdPipe;
  let metadata: ArgumentMetadata;

  beforeEach(() => {
    pipe = new PaserIntIdPipe();
    metadata = { type: 'param', data: 'id' };
  });

  it('should parse valid numeric string to number', () => {
    expect(pipe.transform('42', metadata)).toBe(42);
  });

  it('should throw BadRequestException if value is not a number', () => {
    expect(() => pipe.transform('abc', metadata)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if value is negative', () => {
    expect(() => pipe.transform('-5', metadata)).toThrow(BadRequestException);
  });

  it('should return value as is if metadata.type is not param', () => {
    const meta: ArgumentMetadata = { type: 'body', data: 'id' };
    expect(pipe.transform('not-checked', meta)).toBe('not-checked');
  });

  it('should return value as is if metadata.data is not id', () => {
    const meta: ArgumentMetadata = { type: 'param', data: 'other' };
    expect(pipe.transform('not-checked', meta)).toBe('not-checked');
  });
});
