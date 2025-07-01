import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('messages')
export class MessagesController {
  @Get()
  findAll() {
    return 'This route returns all messages';
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return `This route returns a message by ID: ${id}`;
  }

  @Post()
  create(@Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return body;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      id,
      ...body,
    };
  }
}
