import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john.doe@example.com';
    dto.password = 'securePass123';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBe(0); // No errors means the DTO is valid
  });

  it('should fail if the email is invalid', async () => {
    const dto = new CreateUserDto();
    dto.email = 'invalid-email';
    dto.password = 'securePass123';
    dto.name = 'John Doe';

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if the password is too short', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john.doe@example.com';
    dto.password = '123';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail if the name is empty', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john.doe@example.com';
    dto.password = 'securePass123';
    dto.name = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail if the name is too long', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john.doe@example.com';
    dto.password = 'securePass123';
    dto.name = 'a'.repeat(101);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
});
