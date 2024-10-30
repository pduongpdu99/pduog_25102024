export class StringProcessor {
    /**
     * Lấy components từ imports 
     * @param moduleString 
     * @returns 
     */
    static exportImports(moduleString: string): string[] {
        let results: string[] = [];
        const importsMatch = moduleString.match(/imports:\s*\[(.*?)\]/g);
        if (!importsMatch || importsMatch.length < 2) return [];
        results = importsMatch[1]
            .split(',')
            .map(importItem => importItem.trim())
            .filter(importItem => importItem.length > 0);
        return results;
    }

    /**
     * update imports
     * @param moduleString 
     * @param newImports 
     * @returns 
     */
    static updateImports(moduleString: string, newImports: string[]): string {
        const newImportsString = `imports: [\n        ${newImports.join(',\n        ')}\n    ],`;
        const updatedModuleString = moduleString.replace(/imports:\s*\[(.*?)\]/g, newImportsString);

        return updatedModuleString;
    }

}