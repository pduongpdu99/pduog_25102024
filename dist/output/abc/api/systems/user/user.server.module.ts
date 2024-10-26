import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SYSTEMS as APP_CONFIG } from '@common/config/app.config.json';
import { USER_SERVER as CONFIG } from '@common/config/C:\Users\pduon\OneDrive\Desktop\projects\pduog_25102024\dist\input.json';
import { TransportModule } from '@common/transport';
import { doParsingMessage } from '@server/common/messages/parser.message';
import { UserServerController } from './userserver.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TransportModule.register(CONFIG.MICROSERVICE, CONFIG.NAME),
    ],
    controllers: [UserServerController],
    providers: [
        Logger,
        {
            provide: APP_CONFIG.QUERY_PIPE_PARAMS,
            useValue: {
                item: {
                    defaultSystemFields: false, 
                },
                list: {
                    filterFields: [name, email],
                    searchFields: [], 
                    orderFields: [],
                },
            },
        },
        {
            provide: APP_CONFIG.QUERY_PIPE_NAME,
            useValue: CONFIG.NAME,
        },
        {
            provide: APP_CONFIG.MESSAGE_CONFIG,
            useFactory: () => doParsingMessage(CONFIG.NAME),
        },
    ],
})
export class UserServerModule {}
