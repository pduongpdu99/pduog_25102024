import { Controller, Req } from '@nestjs/common';
import { Request } from 'express';

import { CONFIG } from '@common/config/systems.service.config.json';
import { BaseServerController } from '@server/common/bases';
import { SwaggerController } from '@server/common/decorators/auth';
import { MethodConfig } from '@server/common/decorators/crud';
import { SystemsService } from './systems.server.service';

@SwaggerController(CONFIG.NAME)
@Controller(CONFIG.NAME)
export class SystemsController extends BaseServerController {
    constructor(private readonly apiService: SystemsService) {
        super();
    }

    @MethodConfig(CONFIG.API.GET_PERMISSION_CODE)
    getConfigPermissionCodes(@Req() req: Request) {
        this.console(CONFIG.API.GET_PERMISSION_CODE);

        return this.apiService.getPermissionCode();
    }

    @MethodConfig(CONFIG.API.GET_SETTINGS)
    getConfigSettings(@Req() req: Request) {
        this.console(CONFIG.API.GET_SETTINGS);

        return this.apiService.getConfigSettings();
    }

    @MethodConfig(CONFIG.API.GET_SERVICES)
    getConfigServices(@Req() req: Request) {
        this.console(CONFIG.API.GET_SERVICES);

        return this.apiService.getConfigServices();
    }
}
