// Import library
import { Body, Controller, Inject, Param, ParseIntPipe, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

// Import config
import { ALO_SERVER as CONFIG } from '@common/config/src\input.json';

// Import libs
import { QueryPipe } from '@common/pipe/query-pipe';
import { PaginationQueryDto } from '@common/schema-custom/pagination';
import { CurrentUser, DELETE_PAYLOAD, GET_ALL_PAYLOAD, GET_BY_ID_PAYLOAD, POST_PAYLOAD, PUT_PAYLOAD } from '@common/types/payload';
import { requestTimeout } from '@common/utils/alert-catch.util';
import { JwtGuard } from '@server/common/auth/guards';
import { CRUDServerController } from '@server/common/bases';
import { GetUser, SwaggerController } from '@server/common/decorators/auth';
import { Public } from '@server/common/decorators/auth/public.decorator';
import { MethodConfig } from '@server/common/decorators/crud';

@SwaggerController(CONFIG.NAME)
@Controller(CONFIG.NAME)
@UseGuards(JwtGuard)
// @UseInterceptors(CaslInterceptor)
export class AloServerController extends CRUDServerController<Record<string, any>, Record<string, any>> {
    constructor(@Inject(CONFIG.NAME) client: ClientProxy) {
        super(client, CONFIG.API);
    }

    // Default CRUD
    @MethodConfig(CONFIG.API.GET_LIST)
    @UsePipes(QueryPipe)
    getAloServerList(@GetUser() currentUser: CurrentUser, @Query() query: PaginationQueryDto, @Req() request: Request) {
        const payload: GET_ALL_PAYLOAD = {
            query,
            currentUser,
            request: { path: request.path, isSystemFields: request.headers['sys'] as string },
        };

        return this._gets(payload).pipe(requestTimeout);
    }

    @MethodConfig(CONFIG.API.GET_BY_ID)
    getAloServerById(@GetUser() currentUser: CurrentUser, @Param('id', ParseIntPipe) id: number, @Query() query: PaginationQueryDto, @Req() request: Request) {
        const payload: GET_BY_ID_PAYLOAD = {
            currentUser,
            id,
            query,
            request: { path: request.path, isSystemFields: request.headers['sys'] as string },
        };

        return this._get(payload).pipe(requestTimeout);
    }

    @Public()
    @MethodConfig(CONFIG.API.POST)
    postAloServer(@GetUser() currentUser: CurrentUser, @Query() query: PaginationQueryDto, @Body() dto: Record<string, any>, @Req() request: Request) {
        // @Public() => currentUser: undefined
        const payload: POST_PAYLOAD<Record<string, any>> = {
            currentUser: undefined,
            dto,
            request: { path: request.path, isSystemFields: request.headers['sys'] as string },
        };

        return this._post(payload).pipe(requestTimeout);
    }

    @MethodConfig(CONFIG.API.PATCH)
    patchAloServerId(
        @GetUser() currentUser: CurrentUser,
        @Param('id', ParseIntPipe) id: number,
        @Query() query: PaginationQueryDto,
        @Body() dto: Record<string, any>,
        @Req() request: Request,
    ) {
        const payload: PUT_PAYLOAD<Record<string, any>> = {
            currentUser,
            id,
            dto,
            query,
            request: { path: request.path, isSystemFields: request.headers['sys'] as string },
        };

        return this._patch(payload).pipe(requestTimeout);
    }

    @MethodConfig(CONFIG.API.DELETE)
    deleteAloServerId(@GetUser() currentUser: CurrentUser, @Param('id', ParseIntPipe) id: number, @Query() query: PaginationQueryDto, @Req() request: Request) {
        const payload: DELETE_PAYLOAD = {
            currentUser,
            id,
            truncate: query.truncate,
            request: { path: request.path, isSystemFields: request.headers['sys'] as string },
        };

        return this._delete(payload).pipe(requestTimeout);
    }
}
