"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var ConsumerGeneration_1 = require("./util/ConsumerGeneration");
// const jsonData = JSON.stringify({ name: "John", age: 30 });
// const blob = new Blob([jsonData], { type: "application/json" });
// const file = new File([blob], "input.json", { type: "application/json", lastModified: Date.now() });
var CONFIG = {
    TARGET_FOLDER: "output",
    API_FOLDER: 'abc/api',
    INPUT_PATH: './input.json'
};
// new ConsumerGeneration('input.json', CONFIG).doDeleteStructure(CONFIG.TARGET_FOLDER);
console.log((0, path_1.join)(__dirname, CONFIG.INPUT_PATH));
new ConsumerGeneration_1.ConsumerGeneration((0, path_1.join)(__dirname, CONFIG.INPUT_PATH), CONFIG).runtime();
