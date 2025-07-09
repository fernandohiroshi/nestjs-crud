import { Controller, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global-config';

@Controller('home')
export class AppController {
  constructor(
    @Inject(globalConfig.KEY)
    private readonly globalConfiguration: ConfigType<typeof globalConfig>,
  ) {}
}
