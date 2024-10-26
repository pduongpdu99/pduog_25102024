
export interface IGeneration {
    doDeleteStructure(target: string): void;
    doGenerateStructure(): Promise<void>;
    doGenerateSubControllerByTemplate(path: string, template: string, config: Record<string, any>, configPath: string): Promise<void>;
    doGenerateSubModuleByTemplate(path: string, template: string, config: Record<string, any>, configPath: string): Promise<void>;
    doGenerateParentModuleByTemplate(path: string, template: string, name: string): Promise<void>;
    doGenerateParentControlerByTemplate(path: string, template: string, name: string): Promise<void>;
    doGenerateParentServiceByTemplate(path: string, template: string, name: string): Promise<void>;
    runtime(): Promise<void>;
}
