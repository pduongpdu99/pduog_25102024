import { IGeneration } from "./IGeneration";
import { IGenerationValidation } from "./IGenerationValidation";

import { mkdir, existsSync, rmSync, writeFileSync, readFileSync, mkdirSync, writeFile } from "fs";
import { join } from "path";
import inquirer from 'inquirer';


export class ConsumerGeneration implements IGeneration, IGenerationValidation {
    private input: string;
    private microserviceName: string;
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
        delete meta.MICROSERVICE_NAME;
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
        const targetFolder: string = join(__dirname, '..', this.config.TARGET_FOLDER);
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

        let metadata: Record<string, any> = {};
        metadata = JSON.parse(this.input as string);

        const PARENT_FOLDER = metadata.MICROSERVICE_NAME;
        const PARENT_FOLDER_NAME = metadata.NAME;
        delete metadata.MICROSERVICE_NAME;
        delete metadata.NAME;
        const parentPath = join(apiFolder, PARENT_FOLDER.toLowerCase());

        const rootName = PARENT_FOLDER_NAME.toLowerCase();
        const templatePath = join(__dirname, '..', 'templates');
        const rootModuleData = readFileSync(join(templatePath, `parent-module.txt`), 'utf8').toString();
        const rootControllerData = readFileSync(join(templatePath, `parent-controller.txt`), 'utf8').toString();
        const rootServiceData = readFileSync(join(templatePath, `parent-service.txt`), 'utf8').toString();
        this.doGenerateParentModuleByTemplate(
            join(__dirname, '..', this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), `${rootName}.module.ts`),
            rootModuleData,
            PARENT_FOLDER_NAME
        );
        this.doGenerateParentControlerByTemplate(
            join(__dirname, '..', this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), `${rootName}.controller.ts`),
            rootControllerData
        );
        this.doGenerateParentServiceByTemplate(
            join(__dirname, '..', this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), `${rootName}.service.ts`),
            rootServiceData
        );
        // LOG: parent folder created successfully
        console.log("parent folder created successfully");

        for (const [key, value] of Object.entries(metadata)) {
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
        template = template.replace(/<FILTER_FIELD>/g, `[${config.QUERY.FILTER_FIELD.join(", ")}]`);
        template = template.replace(/<SEARCH_FIELD>/g, `[${config.QUERY.SEARCH_FIELD.join(", ")}]`);
        template = template.replace(/<ORDER_FIELD>/g, `[${config.QUERY.ORDER_FIELD.join(", ")}]`);
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


        let meta = JSON.parse(this.input);
        delete meta.MICROSERVICE_NAME;
        delete meta.NAME;

        let moduleImports: string[] = [];
        let moduleInjects: string[] = [];

        for (const [MODEL_NAME, CONFIG] of Object.entries(meta)) {
            const name = (CONFIG as Record<string, any>).NAME;
            const nameLower = name.toLowerCase();
            const norm = nameLower.split('.').map((i: string) => i[0].toUpperCase() + i.slice(1)).join('');
            const modelNameLower = MODEL_NAME.toLowerCase().replace('_', '-');
            moduleImports.push(`import { ${norm}Module } from './${modelNameLower}/${modelNameLower}.module'`);
            moduleInjects.push(`${norm}Module`);
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
        targetFolder = join(__dirname, targetFolder)
        if (existsSync(targetFolder)) {
            rmSync(targetFolder, { recursive: true });
            // LOG: output folder deleted successfully
            console.log("output folder deleted successfully");
        }
    }

    private subCreateAll(parentPath: string, key: string, value: any, metadata: Record<string, any>): void {
        const subPath = join(parentPath, key.toLowerCase());
        console.log(subPath)
        if (existsSync(subPath)) {
            mkdirSync(subPath, { recursive: true });
        }

        mkdirSync(subPath, { recursive: true });
        const rootName = value.NAME.toLowerCase();
        const rootModuleData = readFileSync(join(__dirname, '..', './templates/sub-module.txt'), 'utf8').toString();
        const rootControllerData = readFileSync(join(__dirname, '..', './templates/sub-controller.txt'), 'utf8').toString();

        this.subCreateController(subPath, rootName, rootControllerData, metadata[key]);
        this.subCreateModule(subPath, rootName, rootModuleData, metadata[key]);
        // LOG: sub folder created successfully
        console.log("sub folder created successfully");
    }

    private subCreateController(subPath: string, rootName: string, template: any, metadata: Record<string, any>): void {
        writeFileSync(join(subPath, `${rootName}.controller.ts`), template, { flag: "w" });
        this.doGenerateSubControllerByTemplate(
            join(
                subPath,
                `${rootName}.controller.ts`
            ),
            template,
            metadata,
        );
    }

    private subCreateModule(subPath: string, rootName: string, template: any, metadata: Record<string, any>): void {
        writeFileSync(join(subPath, `${rootName}.module.ts`), template, { flag: "w" });
        this.doGenerateSubModuleByTemplate(
            join(
                subPath,
                `${rootName}.module.ts`
            ),
            template,
            metadata,
        );
    }

    async runtime(): Promise<void> {
        const meta: Record<string, any> = JSON.parse(readFileSync(join(__dirname, '..', this.config.INPUT_PATH), 'utf-8').toString());
        const root = meta.MICROSERVICE_NAME.toLowerCase();
        let micro = meta.NAME.toLowerCase();
        let microLower = micro.toLowerCase();
        delete meta.MICROSERVICE_NAME;
        delete meta.NAME;

        let isReplaceOutput = false;
        await inquirer.prompt({
            type: 'input',
            name: 'answer',
            message: 'Do you want to create new? ',
        }).then(answer => {
            isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
            this.prefix.replace = isReplaceOutput;
        });

        if (this.prefix.replace) {
            if (this.validate()) {
                this.doDeleteStructure(join(__dirname, '..', this.config.TARGET_FOLDER));
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
            }).then(answer => {
                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                this.prefix['rootModule'] = isReplaceOutput;
            });

            await inquirer.prompt({
                type: 'input',
                name: 'answer',
                message: `Discovery ${microNameLower}.controller.ts. Do you want to create new? `,
            }).then(answer => {
                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                this.prefix['rootController'] = isReplaceOutput;
            });

            await inquirer.prompt({
                type: 'input',
                name: 'answer',
                message: `Discovery ${microNameLower}.service.ts. Do you want to create new? `,
            }).then(answer => {
                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                this.prefix['rootService'] = isReplaceOutput;
            });

            if (this.prefix['rootModule']) {
                const modulePath = join(__dirname, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                const rootModuleData = readFileSync(join(__dirname, '..', './templates/parent-module.txt'), 'utf8').toString();

                mkdirSync(modulePath, { recursive: true });
                this.doGenerateParentModuleByTemplate(
                    join(modulePath, `${microLower}.service.ts`),
                    rootModuleData,
                    micro
                );
            }

            if (this.prefix['rootController']) {
                const controllerPath = join(__dirname, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                const rootControllerData = readFileSync(join(__dirname, '..', './templates/parent-controller.txt'), 'utf8').toString();

                mkdirSync(controllerPath, { recursive: true });
                this.doGenerateParentControlerByTemplate(
                    join(controllerPath, `${microLower}.service.ts`),
                    rootControllerData
                );
            }

            if (this.prefix['rootService']) {
                const servicePath = join(__dirname, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                const rootServiceData = readFileSync(join(__dirname, '..', './templates/parent-service.txt'), 'utf8').toString();

                mkdirSync(servicePath, { recursive: true });
                this.doGenerateParentServiceByTemplate(
                    join(servicePath, `${microLower}.service.ts`),
                    rootServiceData
                );
            }

            const models = Object.keys(meta).map((i: string) => i.toLowerCase());
            for (const model of models) {
                const upper = model.toUpperCase();
                let subPath = join(this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                const modelAPIPathAll = join(subPath, model);
                const modelAPIPathController = join(modelAPIPathAll, `${meta[upper].NAME.toLowerCase()}.controller.ts`);
                const modelAPIPathModule = join(modelAPIPathAll, `${meta[upper].NAME.toLowerCase()}.module.ts`);
                if (existsSync(modelAPIPathAll)) {
                    await inquirer.prompt({
                        message: `Discovery ${modelAPIPathAll}. Do you want to create new?`,
                        type: 'input',
                        name: 'answer'
                    }).then(i => {
                        this.prefix[`${model}All`] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                    })
                }

                if (this.prefix[`${model}All`]) {
                    this.subCreateController(modelAPIPathAll, meta[upper].NAME, readFileSync('./templates/sub-controller.txt', 'utf8').toString(), meta[upper]);
                    this.subCreateController(modelAPIPathAll, meta[upper].NAME, readFileSync('./templates/sub-module.txt', 'utf8').toString(), meta[upper]);
                } else {
                    if (existsSync(modelAPIPathController)) {
                        await inquirer.prompt({
                            message: `Discovery ${modelAPIPathController}. Do you want to create new?`,
                            type: 'input',
                            name: 'answer'
                        }).then(i => {
                            this.prefix[`${model}Controller`] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                        })
                    }

                    if (existsSync(modelAPIPathModule)) {
                        await inquirer.prompt({
                            message: `Discovery ${modelAPIPathModule}. Do you want to create new?`,
                            type: 'input',
                            name: 'answer'
                        }).then(i => {
                            this.prefix[`${model}Module`] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                        })
                    }

                    if (this.prefix[`${model}Controller`]) {
                        this.subCreateController(modelAPIPathAll, meta[upper].NAME, readFileSync('./templates/sub-controller.txt', 'utf8').toString(), meta[upper]);
                    }

                    if (this.prefix[`${model}Controller`]) {
                        this.subCreateModule(modelAPIPathAll, meta[upper].NAME, readFileSync('./templates/sub-module.txt', 'utf8').toString(), meta[upper]);
                    }
                }

            }
        }

    }
}
