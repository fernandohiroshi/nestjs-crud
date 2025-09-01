import { MyExceptionFilter } from './my-exception.filter';
import { ArgumentsHost, BadRequestException } from '@nestjs/common';

describe('MyExceptionFilter', () => {
  let filter: MyExceptionFilter<BadRequestException>;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new MyExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should send the correct response for BadRequestException (object)', () => {
    const exception = new BadRequestException({ message: 'fail', code: 123 });
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'fail', code: 123 });
  });

  it('should send the correct response for BadRequestException (string)', () => {
    const exception = new BadRequestException('fail');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ statusCode: 400, message: 'fail', error: 'Bad Request' });
  });
});
