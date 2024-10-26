
export interface IGenerationValidation {
    validate(): boolean;
    isValidJSON(text: string): boolean;
}
