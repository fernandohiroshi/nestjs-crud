import jwtConfig from './jwt.config';

describe('jwtConfig', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should map environment variables to jwt config object', () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_TOKEN_AUDIENCE = 'aud';
    process.env.JWT_TOKEN_ISSUER = 'iss';
    process.env.JWT_TTL = '100';
    process.env.JWT_REFRESH_TTL = '200';
    const config = jwtConfig();
    expect(config).toEqual({
      secret: 'secret',
      audience: 'aud',
      issuer: 'iss',
      ttl: 100,
      refreshTtl: 200,
    });
  });

  it('should use default values for missing TTLs', () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_TOKEN_AUDIENCE = 'aud';
    process.env.JWT_TOKEN_ISSUER = 'iss';
    delete process.env.JWT_TTL;
    delete process.env.JWT_REFRESH_TTL;
    const config = jwtConfig();
    expect(config.ttl).toBe(3600);
    expect(config.refreshTtl).toBe(43200);
  });
});
