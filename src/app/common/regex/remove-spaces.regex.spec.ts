import { RemoveSpacesRegex } from './remove-spaces.regex';

describe('RemoveSpacesRegex', () => {
  const regex = new RemoveSpacesRegex();

  it('should remove all spaces', () => {
    expect(regex.execute('a b c')).toBe('abc');
  });

  it('should remove tabs and newlines', () => {
    expect(regex.execute('a\tb\nc')).toBe('abc');
  });

  it('should return same string if no spaces', () => {
    expect(regex.execute('abc')).toBe('abc');
  });
});
