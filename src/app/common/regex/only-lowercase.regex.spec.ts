import { OnlyLowercaseRegex } from './only-lowercase.regex';

describe('OnlyLowercaseRegex', () => {
  const regex = new OnlyLowercaseRegex();

  it('should remove non-lowercase characters', () => {
    expect(regex.execute('abcDEF123!')).toBe('abc');
  });

  it('should return only lowercase if input is all lowercase', () => {
    expect(regex.execute('hello')).toBe('hello');
  });

  it('should return empty string if no lowercase letters', () => {
    expect(regex.execute('123!@#')).toBe('');
  });
});
