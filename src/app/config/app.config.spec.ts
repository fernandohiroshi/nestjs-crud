import appConfig from './app.config';

describe('appConfig', () => {
  it('should return the app instance', () => {
    const fakeApp = { useGlobalPipes: jest.fn(), returned: false };
    // @ts-ignore
    const result = appConfig(fakeApp);
    expect(fakeApp.useGlobalPipes).toHaveBeenCalled();
    expect(result).toBe(fakeApp);
  });
});
