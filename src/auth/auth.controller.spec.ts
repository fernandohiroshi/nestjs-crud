import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(() => {
    service = { login: jest.fn(), refreshTokens: jest.fn() };
    controller = new AuthController(service);
  });

  it('should call AuthService.login and return tokens', () => {
    service.login.mockReturnValue({ accessToken: 'a', refreshToken: 'b' });
    const dto = { email: 'a@a.com', password: '123' };
    expect(controller.login(dto)).toEqual({ accessToken: 'a', refreshToken: 'b' });
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('should call AuthService.refreshTokens and return tokens', () => {
    service.refreshTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'b' });
    const dto = { refreshToken: 'token' };
    expect(controller.refreshTokens(dto)).toEqual({ accessToken: 'a', refreshToken: 'b' });
    expect(service.refreshTokens).toHaveBeenCalledWith(dto);
  });
});
