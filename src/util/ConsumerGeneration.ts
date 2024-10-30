import { IGeneration } from "./IGeneration";
import { IGenerationValidation } from "./IGenerationValidation";

import { existsSync, rmSync, writeFileSync, readFileSync, mkdirSync, writeFile } from "fs";
import { join } from "path";
import inquirer from 'inquirer';
import { StringProcessor } from "./StringProcessor";


export class ConsumerGeneration implements IGeneration, IGenerationValidation {
    private input: string;
    private microserviceName: string;
    private name: string;
    private meta: Record<string, any>;

    private prefix: {
        replace: boolean;
        rootModule: boolean;
        rootController: boolean;
        rootService: boolean;
    } & Record<string, any> = {
            replace: false,
            rootModule: false,
            rootController: false,
            rootService: false,
        };
    constructor(private configPath: string, private config: Record<string, any>) {
        this.input = readFileSync(configPath, 'utf-8').toString();
        const meta: Record<string, any> = JSON.parse(this.input);
        this.microserviceName = meta.MICROSERVICE_NAME;
        this.name = meta.NAME.toLowerCase();
        delete meta.MICROSERVICE_NAME;
        delete meta.NAME;
        this.meta = meta;
        for (let key of Object.keys(meta)) {
            key = key.toLowerCase();
            this.prefix[`${key}All`] = false;
            this.prefix[`${key}Controller`] = false;
            this.prefix[`${key}Module`] = false;
        }
    }

    public validate(): boolean {

        if (!this.isValidJSON(this.input as string)) {
            return false;
        }

        return true;
    }

    public isValidJSON(text: string): boolean {
        try {
            JSON.parse(text);
            return true;
        } catch (error) {
            return false;
        }

    }

    async doGenerateStructure(): Promise<void> {
        const targetFolder: string = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER);
        mkdirSync(targetFolder, { recursive: true });

        // check target folder
        if (!existsSync(targetFolder)) {
            mkdirSync(targetFolder);
            console.log("output folder created successfully");
        }
        const apiFolder: string = join(targetFolder, this.config.API_FOLDER);

        // check api folder
        if (!existsSync(apiFolder)) {
            mkdirSync(apiFolder, { recursive: true });
            console.log("api folder created successfully");
        }

        // LOG: generate structure
        console.log("Generating structure...");

        let metadata = this.meta;
        const PARENT_FOLDER = this.microserviceName;
        const PARENT_FOLDER_NAME = this.name;
        const parentPath = join(apiFolder, PARENT_FOLDER.toLowerCase());

        const rootName = PARENT_FOLDER_NAME.toLowerCase();
        const templatePath = join(this.config.ORIGIN_PATH, 'templates');
        const rootModuleData = readFileSync(join(templatePath, `parent-module.txt`), 'utf8').toString();
        const rootControllerData = readFileSync(join(templatePath, `parent-controller.txt`), 'utf8').toString();
        const rootServiceData = readFileSync(join(templatePath, `parent-service.txt`), 'utf8').toString();
        this.doGenerateParentModuleByTemplate(
            join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), `${rootName}.module.ts`),
            rootModuleData,
            PARENT_FOLDER_NAME
        );
        this.doGenerateParentControlerByTemplate(
            join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), `${rootName}.controller.ts`),
            rootControllerData
        );
        this.doGenerateParentServiceByTemplate(
            join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), `${rootName}.service.ts`),
            rootServiceData
        );
        // LOG: parent folder created successfully
        console.log("parent folder created successfully");

        for (const [key, value] of Object.entries(metadata)) {
            console.log(parentPath, key, value);
            this.subCreateAll(parentPath, key, value, metadata);
        }
    }

    async doGenerateSubControllerByTemplate(path: string, template: string, config: Record<string, any>): Promise<void> {
        let subName = config.NAME.toLowerCase();
        let subUpperName = config.NAME.toLowerCase();
        subName = subName.split(".").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("");
        subUpperName = subUpperName.split(".").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("_");


        template = template.replace(/<SUB_NAME>/g, subName);
        template = template.replace(/<SUB_NAME_LOWER>/g, subName.toLowerCase());
        template = template.replace(/<SUB_NAME_UPPER>/g, subUpperName.toUpperCase());
        template = template.replace(/<file-config>/g, this.configPath);

        writeFile(path, template, (err) => {
            if (err) {
                console.log(err);
            }
            console.log(`Generated ${path}`);
        })
    }

    async doGenerateSubModuleByTemplate(path: string, template: string, config: Record<string, any>): Promise<void> {
        let subName = config.NAME.toLowerCase();
        let subUpperName = config.NAME.toLowerCase();
        subName = subName.split(".").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("");
        subUpperName = subUpperName.split(".").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("_");

        template = template.replace(/<SUB_NAME>/g, subName);
        template = template.replace(/<SUB_NAME_LOWER>/g, subName.toLowerCase());
        template = template.replace(/<SUB_NAME_UPPER>/g, subUpperName.toUpperCase());
        template = template.replace(/<FILTER_FIELD>/g, `[${config.QUERY.FILTER_FIELD.map((i: string) => `'${i}'`).join(", ")}]`);
        template = template.replace(/<SEARCH_FIELD>/g, `[${config.QUERY.SEARCH_FIELD.map((i: string) => `'${i}'`).join(", ")}]`);
        template = template.replace(/<ORDER_FIELD>/g, `[${config.QUERY.ORDER_FIELD.map((i: string) => `'${i}'`).join(", ")}]`);
        template = template.replace(/<file-config>/g, this.configPath);

        writeFile(path, template, (err) => {
            if (err) {
                console.log(err);
            }
            console.log(`Generated ${path}`);
        })
    }

    async doGenerateParentModuleByTemplate(path: string, template: string, name: string): Promise<void> {
        let lower = name.toLowerCase()
        let subName = name.toLowerCase();
        let subUpperName = name.toLowerCase();
        subName = subName.split("_").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("");
        subUpperName = subUpperName.split("_").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("_");

        let microNameLower = this.microserviceName.toLowerCase()
        let parentNorName: string = microNameLower.split("_").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("");


        let meta = this.meta;

        let moduleImports: string[] = [];
        let moduleInjects: string[] = [];

        for (const [MODEL_NAME, CONFIG] of Object.entries(meta)) {
            const name = (CONFIG as Record<string, any>).NAME;
            const nameLower = name.toLowerCase();
            const norm = nameLower.split('.').map((i: string) => i[0].toUpperCase() + i.slice(1)).join('');
            const modelNameLower = MODEL_NAME.toLowerCase().replace('_', '-');
            if (this.prefix[`${modelNameLower}Module`] || this.prefix[`${modelNameLower}All`]) {
                moduleImports.push(`import { ${norm}Module } from './${modelNameLower}/${nameLower}.module'`);
                moduleInjects.push(`${norm}Module`);
            }
        }


        template = template.replace(/<SUB_NAME>/g, subName);
        template = template.replace(/<SUB_NAME_LOWER>/g, lower);
        template = template.replace(/<SUB_NAME_UPPER>/g, subUpperName);
        template = template.replace(/<MODEL_LOWER>/g, name.toLowerCase());
        template = template.replace(/<PARENT_NAME>/g, parentNorName);
        template = template.replace(/<PARENT_NAME_UPPER>/g, this.microserviceName);
        template = template.replace(/<PARENT_NAME_LOWER>/g, microNameLower);
        template = template.replace(/<LIST_SUB_MODULE_IMPORT>/g, moduleImports.join(';\n'));
        template = template.replace(/<LIST_SUB_MODULE_INJECT>/g, moduleInjects.join(",\n\t\t"));
        template = template.replace(/<file-config>/g, this.configPath);

        writeFile(path, template, (err) => {
            if (err) {
                console.log(err);
            }
            console.log(`Generated ${path}`);
        })
    }

    async doGenerateParentControlerByTemplate(path: string, template: string): Promise<void> {
        let microNameLower = this.microserviceName.toLowerCase()
        let parentNorName: string = microNameLower.split("_").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("");
        template = template.replace(/<PARENT_NAME>/g, parentNorName);
        writeFile(path, template, (err) => {
            if (err) {
                console.log(err);
            }
            console.log(`Generated ${path}`);
        })
    }

    async doGenerateParentServiceByTemplate(path: string, template: string): Promise<void> {
        let microNameLower = this.microserviceName.toLowerCase()
        let parentNorName: string = microNameLower.split("_").map((i: string) => i[0].toUpperCase() + i.slice(1)).join("");
        template = template.replace(/<PARENT_NAME>/g, parentNorName);
        writeFile(path, template, (err) => {
            if (err) {
                console.log(err);
            }
            console.log(`Generated ${path}`);
        })
    }

    doDeleteStructure(targetFolder: string): void {
        targetFolder = join(this.config.ORIGIN_PATH, targetFolder)
        if (existsSync(targetFolder)) {
            rmSync(targetFolder, { recursive: true });
            // LOG: output folder deleted successfully
            console.log("output folder deleted successfully");
        }
    }

    private subCreateAll(parentPath: string, key: string, value: any, metadata: Record<string, any>): void {
        const subPath = join(parentPath, key.toLowerCase());
        if (existsSync(subPath)) {
            mkdirSync(subPath, { recursive: true });
        }

        mkdirSync(subPath, { recursive: true });
        const rootName = value.NAME.toLowerCase();
        const rootModuleData = readFileSync(join(this.config.ORIGIN_PATH, 'templates/sub-module.txt'), 'utf8').toString();
        const rootControllerData = readFileSync(join(this.config.ORIGIN_PATH, 'templates/sub-controller.txt'), 'utf8').toString();

        this.subCreateController(subPath, rootName, rootControllerData, metadata[key]);
        this.subCreateModule(subPath, rootName, rootModuleData, metadata[key]);
        // LOG: sub folder created successfully
        console.log("sub folder created successfully");
    }

    private subCreateController(subPath: string, rootName: string, template: any, metadata: Record<string, any>): void {
        if (!existsSync(subPath)) {
            mkdirSync(subPath, { recursive: true });
        }
        writeFile(join(subPath, `${rootName}.controller.ts`), template, (e) => {
            if (e) {
                console.log(e)
            } else {
                console.log("Generated ".concat(join(subPath, `${rootName}.controller.ts`)));
                this.doGenerateSubControllerByTemplate(
                    join(
                        subPath,
                        `${rootName}.controller.ts`
                    ),
                    template,
                    metadata,
                );
            }
        })
    }

    private subCreateModule(subPath: string, rootName: string, template: any, metadata: Record<string, any>): void {
        if (!existsSync(subPath)) {
            mkdirSync(subPath, { recursive: true });
        }
        writeFile(join(subPath, `${rootName}.module.ts`), template, (e) => {
            if (e) {
                console.log(e)
            } else {
                console.log("Generated ".concat(join(subPath, `${rootName}.controller.ts`)));
                this.doGenerateSubModuleByTemplate(
                    join(
                        subPath,
                        `${rootName}.module.ts`
                    ),
                    template,
                    metadata,
                );
            }
        })
    }

    private updateModuleFile(path: string, moduleStringList: string[]): void {
        if (existsSync(path)) {
            const targetModuleString = readFileSync(path, 'utf8').toString();
            let modules = StringProcessor.exportImports(targetModuleString);
            const updatedModuleString = StringProcessor.updateImports(targetModuleString, [...modules, ...moduleStringList]);
            writeFileSync(path, updatedModuleString);
            console.log("Updated")
        } else {
            console.log("Not found")
        }
    }

    private doProcessingRootFiles(microLower: string, micro: string, root: string): void {
        if (this.prefix['rootModule']) {
            const modulePath = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
            const rootModuleData = readFileSync(join(this.config.ORIGIN_PATH, 'templates/parent-module.txt'), 'utf8').toString();

            mkdirSync(modulePath, { recursive: true });
            this.doGenerateParentModuleByTemplate(
                join(modulePath, `${microLower}.module.ts`),
                rootModuleData,
                micro
            );
        }

        if (this.prefix['rootController']) {
            const controllerPath = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
            const rootControllerData = readFileSync(join(this.config.ORIGIN_PATH, 'templates/parent-controller.txt'), 'utf8').toString();

            mkdirSync(controllerPath, { recursive: true });
            this.doGenerateParentControlerByTemplate(
                join(controllerPath, `${microLower}.controller.ts`),
                rootControllerData
            );
        }

        if (this.prefix['rootService']) {
            const servicePath = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
            const rootServiceData = readFileSync(join(this.config.ORIGIN_PATH, 'templates/parent-service.txt'), 'utf8').toString();

            mkdirSync(servicePath, { recursive: true });
            this.doGenerateParentServiceByTemplate(
                join(servicePath, `${microLower}.service.ts`),
                rootServiceData
            );
        }
    }

    async runtime(): Promise<void> {
        const meta: Record<string, any> = JSON.parse(readFileSync(join(this.config.ORIGIN_PATH, this.config.INPUT_PATH), 'utf-8').toString());
        const root = meta.MICROSERVICE_NAME.toLowerCase();
        let micro = meta.NAME;
        let microLower = micro.toLowerCase();
        delete meta.MICROSERVICE_NAME;
        delete meta.NAME;

        const _rootPath = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
        if (!existsSync(_rootPath)) mkdirSync(_rootPath, { recursive: true });

        let isGenAll = process.argv.filter(i => i.includes('--gen-all') || i.includes('-ga')).length > 0;
        if (isGenAll) {
            if (this.validate()) {
                const models = Object.keys(meta).map((i: string) => i.toLowerCase());
                for (const model of models) {
                    this.prefix[`${model}All`] = true;
                    this.prefix[`${model}Controler`] = true;
                    this.prefix[`${model}Service`] = true;
                }

                this.doDeleteStructure(join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER));
                await this.doGenerateStructure();
            } else {
                // LOG: Some wrong then cannot generate
                console.log("Some wrong then cannot generate");
            }
        } else {
            const microNameLower = this.microserviceName.toLowerCase();
            await inquirer.prompt({
                type: 'input',
                name: 'answer',
                message: `Discovery ${microNameLower}.module.ts. Do you want to create new? `,
            }).then(i => {
                this.prefix['rootModule'] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                let path = join(_rootPath, `${microLower}.module.ts`);
                if (!existsSync(path)) writeFileSync(path, readFileSync('empty_parent-module.txt').toString());
            });

            await inquirer.prompt({
                type: 'input',
                name: 'answer',
                message: `Discovery ${microNameLower}.controller.ts. Do you want to create new? `,
            }).then(i => {
                this.prefix['rootController'] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                let path = join(_rootPath, `${microLower}.controller.ts`);
                if (!existsSync(path)) writeFileSync(path, readFileSync('empty_parent-controller.txt').toString());
            });

            await inquirer.prompt({
                type: 'input',
                name: 'answer',
                message: `Discovery ${microNameLower}.service.ts. Do you want to create new? `,
            }).then(i => {
                this.prefix['rootService'] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                let path = join(_rootPath, `${microLower}.service.ts`);
                if (!existsSync(path)) writeFileSync(path, readFileSync('empty_parent-service.txt').toString());
            });

            const models = Object.keys(meta).map((i: string) => i.toLowerCase());
            for (const model of models) {
                const upper = model.toUpperCase();
                let subPath = join(this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                const modelAPIPathAll = join(subPath, model);
                const modelAPIPathController = join(modelAPIPathAll, `${meta[upper].NAME.toLowerCase()}.controller.ts`);
                const modelAPIPathModule = join(modelAPIPathAll, `${meta[upper].NAME.toLowerCase()}.module.ts`);
                await inquirer.prompt({
                    message: `Discovery ${modelAPIPathAll}. Do you want to create new?`,
                    type: 'input',
                    name: 'answer'
                }).then(i => {
                    let isTrue = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                    this.prefix[`${model}All`] = isTrue;
                    this.prefix[`${model}Module`] = isTrue;
                    this.prefix[`${model}Controller`] = isTrue;
                })

                if (!this.prefix[`${model}All`]) {
                    await inquirer.prompt({
                        message: `Discovery ${modelAPIPathController}. Do you want to create new?`,
                        type: 'input',
                        name: 'answer'
                    }).then(i => {
                        this.prefix[`${model}Controller`] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                    })

                    await inquirer.prompt({
                        message: `Discovery ${modelAPIPathModule}. Do you want to create new?`,
                        type: 'input',
                        name: 'answer'
                    }).then(i => {
                        this.prefix[`${model}Module`] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                    });
                }
            }
            // update module
            let moduleInjects: string[] = [];
            let _meta = JSON.parse(readFileSync(join(this.config.ORIGIN_PATH, this.config.INPUT_PATH), 'utf8').toString());
            if (_meta.MICROSERVICE_NAME) delete _meta.MICROSERVICE_NAME;
            if (_meta.NAME) delete _meta.NAME;
            let upperName = this.name;

            for (const [_, CONFIG] of Object.entries(_meta)) {
                const name = (CONFIG as Record<string, any>).NAME;
                const nameLower = name.toLowerCase();
                const norm = nameLower.split('.').map((i: string) => i[0].toUpperCase() + i.slice(1)).join('');
                const model = _.toLowerCase();
                const upper = model.toUpperCase();
                const subPath = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                const modelAPIPathAll = join(subPath, model);


                if (this.prefix[`${model}All`]) {
                    this.subCreateController(modelAPIPathAll, meta[upper].NAME, readFileSync(join(this.config.ORIGIN_PATH, 'templates/sub-controller.txt'), 'utf8').toString(), meta[upper]);
                    this.subCreateModule(modelAPIPathAll, meta[upper].NAME, readFileSync(join(this.config.ORIGIN_PATH, 'templates/sub-module.txt'), 'utf8').toString(), meta[upper]);
                    moduleInjects.push(`${norm}Module`);
                } else {
                    if (this.prefix[`${model}Module`]) {
                        this.subCreateModule(modelAPIPathAll, meta[upper].NAME, readFileSync(join(this.config.ORIGIN_PATH, 'templates/sub-module.txt'), 'utf8').toString(), meta[upper]);
                        moduleInjects.push(`${norm}Module`);
                    }
                    if (this.prefix[`${model}Controller`]) {
                        this.subCreateController(modelAPIPathAll, meta[upper].NAME, readFileSync(join(this.config.ORIGIN_PATH, 'templates/sub-controller.txt'), 'utf8').toString(), meta[upper]);
                    }
                }

            }

            const targetPath = join(this.config.ORIGIN_PATH, this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toUpperCase(), `${upperName.toLowerCase()}.module.ts`);
            this.doProcessingRootFiles(microLower, micro, root);
            this.updateModuleFile(targetPath, moduleInjects);
        }
    }
}
