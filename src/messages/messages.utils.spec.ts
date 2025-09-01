import { MessagesUtils, MessagesUtilsMock } from './messages.utils';

describe('MessagesUtils', () => {
  let utils: MessagesUtils;

  beforeEach(() => {
    utils = new MessagesUtils();
  });

  it('should invert a string', () => {
    expect(utils.invertString('abc')).toBe('cba');
    expect(utils.invertString('12345')).toBe('54321');
    expect(utils.invertString('')).toBe('');
  });
});

describe('MessagesUtilsMock', () => {
  let utils: MessagesUtilsMock;

  beforeEach(() => {
    utils = new MessagesUtilsMock();
  });

  it('should always return mock string', () => {
    expect(utils.invertString()).toBe('Is Mock !!!');
  });
});
