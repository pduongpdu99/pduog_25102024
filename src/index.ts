import { join } from "path";
import { ConsumerGeneration } from "./util/ConsumerGeneration";

// const jsonData = JSON.stringify({ name: "John", age: 30 });
// const blob = new Blob([jsonData], { type: "application/json" });
// const file = new File([blob], "input.json", { type: "application/json", lastModified: Date.now() });

const CONFIG = {
    TARGET_FOLDER: "../output",
    ORIGIN_PATH: 'src',
    TARGET_MODULE_FOLDER: 'target',
    API_FOLDER: 'abc/api',
    INPUT_PATH: './input.json'
}

// new ConsumerGeneration('input.json', CONFIG).doDeleteStructure(CONFIG.TARGET_FOLDER);
new ConsumerGeneration(join('src', CONFIG.INPUT_PATH), CONFIG).runtime();