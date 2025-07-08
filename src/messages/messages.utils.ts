import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesUtils {
  invertString(str: string) {
    console.log('Not mock!!!');
    return str.split('').reverse().join('');
  }
}

@Injectable()
export class MessagesUtilsMock {
  invertString() {
    return 'Is Mock !!!';
  }
}
