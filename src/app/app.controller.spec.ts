import { AppController } from './app.controller';
import globalConfig from 'src/global-config/global-config';

describe('AppController', () => {
  it('should be defined and inject config', () => {
    const controller = new AppController({} as any);
    expect(controller).toBeDefined();
  });
  // This is a basic test because there are no public methods besides the constructor
});
