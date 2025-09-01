import * as constants from './messages.constant';

describe('messages.constant', () => {
  it('should export the correct constants', () => {
    expect(constants.ONLY_LOWERCASE_REGEX).toBe('ONLY_LOWERCASE_REGEX');
    expect(constants.REMOVE_SPACES_REGEX).toBe('REMOVE_SPACES_REGEX');
  });
});
