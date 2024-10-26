import { SYSTEMS as APP_CONFIG } from '@common/config/app.config.json';
import { System } from '@common/files/system.files';
import { CustomResponse, HttpMiddlewares } from '@common/middlewares/http.middlewares';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class SystemsService extends HttpMiddlewares {
    private getTag(str: string): string {
        const tagMappings = [
            { regex: /^get-[a-z]+(_[a-z]+)*s$/g, tag: 'VIEW' },
            { regex: /^get-[a-z]+(_[a-z]+)*s-id/g, tag: 'VIEW' },
            { regex: /^post-[a-z]+(_[a-z]+)*s$/g, tag: 'CREATE' },
            { regex: /^patch-[a-z]+(_[a-z]+)*s-id$/g, tag: 'UPDATE' },
            { regex: /^delete-[a-z]+(_[a-z]+)*s-id$/g, tag: 'DELETE' },
        ];

        for (const { regex, tag } of tagMappings) {
            if (str.match(regex) !== null) {
                return tag;
            }
        }

        return 'APPROVE';
    }

    private createItemsForService(service: any, key: string): any[] {
        const items: { value: string; label: string; isFixed?: boolean; isDisabled?: boolean; tag: string }[] = [];

        if (service.API) {
            for (const kei of Object.keys(service.API)) {
                const value = service.API[kei];
                const label = this.formatLabel(kei);
                const item = {
                    value,
                    label,
                    tag: this.getTag(value),
                    isFixed: APP_CONFIG.REQUIRE[key]?.[kei] !== undefined,
                    isDisabled: APP_CONFIG.EXCLUDE[key]?.[kei] !== undefined,
                };

                items.push(item);
            }
        }

        return items;
    }

    private formatLabel(key: string): string {
        let label = key.toLowerCase().replaceAll('_', ' ');
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    getPermissionCode(): CustomResponse {
        return this.success(APP_CONFIG.PERMISSION_COVER);
    }

    getConfigSettings(): CustomResponse {
        return this.success(APP_CONFIG.SETTINGS);
    }

    getConfigServices(): CustomResponse {
        try {
            const configs = System.getKeyConfigAPI();
            if (!configs) {
                return this.error(`\x1b[35m apps/server/systems/systems.server.service.ts:41\x1b[0m`, HttpStatus.BAD_GATEWAY);
            }

            const { keys, services } = configs;
            const response = keys.map(key => {
                const items = this.createItemsForService(services[key], key);
                return {
                    label: this.formatLabel(key),
                    options: items,
                };
            });
            return this.success(response);
        } catch (error) {
            return this.error(`\x1b[35m apps/server/systems/systems.server.service.ts:76\x1b[0m ${error}`, HttpStatus.BAD_GATEWAY);
        }
    }
}
