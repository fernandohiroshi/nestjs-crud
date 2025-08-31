import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import globalConfig from 'src/global-config/global-config';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    GlobalConfigModule,
    ConfigModule.forFeature(globalConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(globalConfig)],
      inject: [globalConfig.KEY],
      useFactory: async (
        globalConfiguration: ConfigType<typeof globalConfig>,
      ) => {
        return {
          type: globalConfiguration.database.type,
          host: globalConfiguration.database.host,
          port: globalConfiguration.database.port,
          username: globalConfiguration.database.username,
          password: globalConfiguration.database.password,
          database: globalConfiguration.database.database,
          autoLoadEntities: globalConfiguration.database.autoLoadEntities,
          synchronize: globalConfiguration.database.synchronize,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
      serveRoot: '/pictures',
    }),
    MessagesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
