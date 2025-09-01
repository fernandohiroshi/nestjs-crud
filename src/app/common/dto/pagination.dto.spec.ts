import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('should be valid with default valid values', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 10, offset: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if limit < 1', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 0, offset: 0 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'limit')).toBe(true);
  });

  it('should fail if limit > 50', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 51, offset: 0 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'limit')).toBe(true);
  });

  it('should fail if offset < 0', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 10, offset: -1 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'offset')).toBe(true);
  });

  it('should pass if offset is omitted', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 10 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass if limit is omitted', async () => {
    const dto = plainToInstance(PaginationDto, { offset: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
