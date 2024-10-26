import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { systems as APP_CONFIG } from '@common/config/app.config.json';
import { CONFIG } from '@common/config/systems.service.config.json';
import { doParsingMessage } from '@server/common/messages/parser.message';

import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';

import { UserServerModule } from './user/user.module';
import { RoleServerModule } from './role/role.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.dev',
        }),

        UserServerModule,
		RoleServerModule
    ],
    providers: [
        Logger,
        SystemsService,
        {
            provide: APP_CONFIG.MESSAGE_CONFIG,
            useFactory: () => doParsingMessage(CONFIG.NAME),
        },
    ],
    controllers: [SystemsController],
})
export class SystemsModule {}
