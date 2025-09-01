import { SimpleMiddleware } from './simple.middleware';

describe('SimpleMiddleware', () => {
  let middleware: SimpleMiddleware;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new SimpleMiddleware();
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('should set user if authorization header exists', () => {
    req.headers.authorization = 'Bearer token';
    middleware.use(req, res, next);
    expect(req.user).toEqual({ name: 'Ragnar', role: 'admin' });
    expect(next).toHaveBeenCalled();
  });

  it('should not set user if authorization header does not exist', () => {
    middleware.use(req, res, next);
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
