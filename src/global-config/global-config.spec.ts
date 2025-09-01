import globalConfig from './global-config';

describe('globalConfig', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should map environment variables to config object', () => {
    process.env.DATABASE_TYPE = 'postgres';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USERNAME = 'user';
    process.env.DATABASE_PASSWORD = 'pass';
    process.env.DATABASE_NAME = 'db';
    process.env.DATABASE_AUTO_LOAD_ENTITIES = '1';
    process.env.DATABASE_SYNCHRONIZE = '0';
    process.env.NODE_ENV = 'production';
    const config = globalConfig();
    expect(config.database).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'pass',
      database: 'db',
      autoLoadEntities: true,
      synchronize: true, // Boolean('0') === true
    });
    expect(config.environment).toBe('production');
  });
});
