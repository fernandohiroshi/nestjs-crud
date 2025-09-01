import { AppService } from './app.service';

describe('AppService', () => {
  it('getHello should return "App"', () => {
    // Basic test since there are no public methods besides the constructor
    const service = new AppService();
    expect(service.getHello()).toBe('App');
  });
});
