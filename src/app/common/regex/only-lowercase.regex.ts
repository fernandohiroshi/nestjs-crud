import { RegexProtocol } from './protocol.regex';

export class OnlyLowercaseRegex implements RegexProtocol {
  execute(str: string): string {
    return str.replace(/[^a-z]/g, '');
  }
}
