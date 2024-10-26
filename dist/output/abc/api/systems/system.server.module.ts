import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { <PARENT_NAME_LOWER> as APP_CONFIG } from '@common/config/app.config.json';
import { CONFIG } from '@common/config/systems.service.config.json';
import { doParsingMessage } from '@server/common/messages/parser.message';

import { <PARENT_NAME>Controller } from './<PARENT_NAME_LOWER>.controller';
import { <PARENT_NAME>Service } from './<PARENT_NAME_LOWER>.service';

<LIST_SUB_MODULE_IMPORT>

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.dev',
        }),

        <LIST_SUB_MODULE_INJECT>
    ],
    providers: [
        Logger,
        <PARENT_NAME>Service,
        {
            provide: APP_CONFIG.MESSAGE_CONFIG,
            useFactory: () => doParsingMessage(CONFIG.NAME),
        },
    ],
    controllers: [<PARENT_NAME>Controller],
})
export class <PARENT_NAME>Module {}
