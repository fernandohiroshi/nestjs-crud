import { DynamicModule, Module } from '@nestjs/common';

export type MyModuleConfigs = {
  apiKey: string;
  apiUrl: string;
};

export const MY_DYNAMIC_CONFIG = 'MY_DYNAMIC_CONFIG';

@Module({})
export class MyDynamicModule {
  static register(myModuleConfigs: MyModuleConfigs): DynamicModule {
    console.log('MY DYNAMIC MODULE', myModuleConfigs);
    return {
      module: MyDynamicModule,
      imports: [],
      providers: [
        {
          provide: MY_DYNAMIC_CONFIG,
          useValue: myModuleConfigs,
        },
      ],
      controllers: [],
      exports: [MY_DYNAMIC_CONFIG],
      //   global: true,
    };
  }
}
