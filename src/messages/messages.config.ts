import { registerAs } from '@nestjs/config';

export default registerAs('messages', () => ({
  test1: 'TEST 1',
  test2: 'TEST 2',
}));
