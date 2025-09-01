import messagesConfig from './messages.config';

describe('messagesConfig', () => {
  it('should export correct values', () => {
    expect(messagesConfig().test1).toBe('TEST 1');
    expect(messagesConfig().test2).toBe('TEST 2');
  });
});
