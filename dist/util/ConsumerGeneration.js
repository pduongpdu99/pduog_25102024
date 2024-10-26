"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerGeneration = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var inquirer_1 = __importDefault(require("inquirer"));
var ConsumerGeneration = /** @class */ (function () {
    function ConsumerGeneration(configPath, config) {
        this.configPath = configPath;
        this.config = config;
        this.prefix = {
            replace: false,
            rootModule: false,
            rootController: false,
            rootService: false,
        };
        this.input = (0, fs_1.readFileSync)(configPath, 'utf-8').toString();
        var meta = JSON.parse(this.input);
        this.microserviceName = meta.MICROSERVICE_NAME;
        delete meta.MICROSERVICE_NAME;
        for (var _i = 0, _a = Object.keys(meta); _i < _a.length; _i++) {
            var key = _a[_i];
            key = key.toLowerCase();
            this.prefix["".concat(key, "All")] = false;
            this.prefix["".concat(key, "Controller")] = false;
            this.prefix["".concat(key, "Module")] = false;
        }
    }
    ConsumerGeneration.prototype.validate = function () {
        if (!this.isValidJSON(this.input)) {
            return false;
        }
        return true;
    };
    ConsumerGeneration.prototype.isValidJSON = function (text) {
        try {
            JSON.parse(text);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    ConsumerGeneration.prototype.doGenerateStructure = function () {
        return __awaiter(this, void 0, void 0, function () {
            var targetFolder, apiFolder, metadata, PARENT_FOLDER, PARENT_FOLDER_NAME, parentPath, rootName, templatePath, rootModuleData, rootControllerData, rootServiceData, _i, _a, _b, key, value;
            return __generator(this, function (_c) {
                targetFolder = (0, path_1.join)(__dirname, '..', this.config.TARGET_FOLDER);
                (0, fs_1.mkdirSync)(targetFolder, { recursive: true });
                // check target folder
                if (!(0, fs_1.existsSync)(targetFolder)) {
                    (0, fs_1.mkdirSync)(targetFolder);
                    console.log("output folder created successfully");
                }
                apiFolder = (0, path_1.join)(targetFolder, this.config.API_FOLDER);
                // check api folder
                if (!(0, fs_1.existsSync)(apiFolder)) {
                    (0, fs_1.mkdirSync)(apiFolder, { recursive: true });
                    console.log("api folder created successfully");
                }
                // LOG: generate structure
                console.log("Generating structure...");
                metadata = {};
                metadata = JSON.parse(this.input);
                PARENT_FOLDER = metadata.MICROSERVICE_NAME;
                PARENT_FOLDER_NAME = metadata.NAME;
                delete metadata.MICROSERVICE_NAME;
                delete metadata.NAME;
                parentPath = (0, path_1.join)(apiFolder, PARENT_FOLDER.toLowerCase());
                rootName = PARENT_FOLDER_NAME.toLowerCase();
                templatePath = (0, path_1.join)(__dirname, '..', 'templates');
                rootModuleData = (0, fs_1.readFileSync)((0, path_1.join)(templatePath, "parent-module.txt"), 'utf8').toString();
                rootControllerData = (0, fs_1.readFileSync)((0, path_1.join)(templatePath, "parent-controller.txt"), 'utf8').toString();
                rootServiceData = (0, fs_1.readFileSync)((0, path_1.join)(templatePath, "parent-service.txt"), 'utf8').toString();
                this.doGenerateParentModuleByTemplate((0, path_1.join)(__dirname, '..', this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), "".concat(rootName, ".module.ts")), rootModuleData, PARENT_FOLDER_NAME);
                this.doGenerateParentControlerByTemplate((0, path_1.join)(__dirname, '..', this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), "".concat(rootName, ".controller.ts")), rootControllerData);
                this.doGenerateParentServiceByTemplate((0, path_1.join)(__dirname, '..', this.config.TARGET_FOLDER, this.config.API_FOLDER, this.microserviceName.toLowerCase(), "".concat(rootName, ".service.ts")), rootServiceData);
                // LOG: parent folder created successfully
                console.log("parent folder created successfully");
                for (_i = 0, _a = Object.entries(metadata); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    this.subCreateAll(parentPath, key, value, metadata);
                }
                return [2 /*return*/];
            });
        });
    };
    ConsumerGeneration.prototype.doGenerateSubControllerByTemplate = function (path, template, config) {
        return __awaiter(this, void 0, void 0, function () {
            var subName, subUpperName;
            return __generator(this, function (_a) {
                subName = config.NAME.toLowerCase();
                subUpperName = config.NAME.toLowerCase();
                subName = subName.split(".").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("");
                subUpperName = subUpperName.split(".").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("_");
                template = template.replace(/<SUB_NAME>/g, subName);
                template = template.replace(/<SUB_NAME_LOWER>/g, subName.toLowerCase());
                template = template.replace(/<SUB_NAME_UPPER>/g, subUpperName.toUpperCase());
                template = template.replace(/<file-config>/g, this.configPath);
                (0, fs_1.writeFile)(path, template, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Generated ".concat(path));
                });
                return [2 /*return*/];
            });
        });
    };
    ConsumerGeneration.prototype.doGenerateSubModuleByTemplate = function (path, template, config) {
        return __awaiter(this, void 0, void 0, function () {
            var subName, subUpperName;
            return __generator(this, function (_a) {
                subName = config.NAME.toLowerCase();
                subUpperName = config.NAME.toLowerCase();
                subName = subName.split(".").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("");
                subUpperName = subUpperName.split(".").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("_");
                template = template.replace(/<SUB_NAME>/g, subName);
                template = template.replace(/<SUB_NAME_LOWER>/g, subName.toLowerCase());
                template = template.replace(/<SUB_NAME_UPPER>/g, subUpperName.toUpperCase());
                template = template.replace(/<FILTER_FIELD>/g, "[".concat(config.QUERY.FILTER_FIELD.join(", "), "]"));
                template = template.replace(/<SEARCH_FIELD>/g, "[".concat(config.QUERY.SEARCH_FIELD.join(", "), "]"));
                template = template.replace(/<ORDER_FIELD>/g, "[".concat(config.QUERY.ORDER_FIELD.join(", "), "]"));
                template = template.replace(/<file-config>/g, this.configPath);
                (0, fs_1.writeFile)(path, template, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Generated ".concat(path));
                });
                return [2 /*return*/];
            });
        });
    };
    ConsumerGeneration.prototype.doGenerateParentModuleByTemplate = function (path, template, name) {
        return __awaiter(this, void 0, void 0, function () {
            var lower, subName, subUpperName, microNameLower, parentNorName, meta, moduleImports, moduleInjects, _i, _a, _b, MODEL_NAME, CONFIG, name_1, nameLower, norm, modelNameLower;
            return __generator(this, function (_c) {
                lower = name.toLowerCase();
                subName = name.toLowerCase();
                subUpperName = name.toLowerCase();
                subName = subName.split("_").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("");
                subUpperName = subUpperName.split("_").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("_");
                microNameLower = this.microserviceName.toLowerCase();
                parentNorName = microNameLower.split("_").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("");
                meta = JSON.parse(this.input);
                delete meta.MICROSERVICE_NAME;
                delete meta.NAME;
                moduleImports = [];
                moduleInjects = [];
                for (_i = 0, _a = Object.entries(meta); _i < _a.length; _i++) {
                    _b = _a[_i], MODEL_NAME = _b[0], CONFIG = _b[1];
                    name_1 = CONFIG.NAME;
                    nameLower = name_1.toLowerCase();
                    norm = nameLower.split('.').map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join('');
                    modelNameLower = MODEL_NAME.toLowerCase().replace('_', '-');
                    moduleImports.push("import { ".concat(norm, "Module } from './").concat(modelNameLower, "/").concat(modelNameLower, ".module'"));
                    moduleInjects.push("".concat(norm, "Module"));
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
                (0, fs_1.writeFile)(path, template, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Generated ".concat(path));
                });
                return [2 /*return*/];
            });
        });
    };
    ConsumerGeneration.prototype.doGenerateParentControlerByTemplate = function (path, template) {
        return __awaiter(this, void 0, void 0, function () {
            var microNameLower, parentNorName;
            return __generator(this, function (_a) {
                microNameLower = this.microserviceName.toLowerCase();
                parentNorName = microNameLower.split("_").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("");
                template = template.replace(/<PARENT_NAME>/g, parentNorName);
                (0, fs_1.writeFile)(path, template, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Generated ".concat(path));
                });
                return [2 /*return*/];
            });
        });
    };
    ConsumerGeneration.prototype.doGenerateParentServiceByTemplate = function (path, template) {
        return __awaiter(this, void 0, void 0, function () {
            var microNameLower, parentNorName;
            return __generator(this, function (_a) {
                microNameLower = this.microserviceName.toLowerCase();
                parentNorName = microNameLower.split("_").map(function (i) { return i[0].toUpperCase() + i.slice(1); }).join("");
                template = template.replace(/<PARENT_NAME>/g, parentNorName);
                (0, fs_1.writeFile)(path, template, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Generated ".concat(path));
                });
                return [2 /*return*/];
            });
        });
    };
    ConsumerGeneration.prototype.doDeleteStructure = function (targetFolder) {
        targetFolder = (0, path_1.join)(__dirname, targetFolder);
        if ((0, fs_1.existsSync)(targetFolder)) {
            (0, fs_1.rmSync)(targetFolder, { recursive: true });
            // LOG: output folder deleted successfully
            console.log("output folder deleted successfully");
        }
    };
    ConsumerGeneration.prototype.subCreateAll = function (parentPath, key, value, metadata) {
        var subPath = (0, path_1.join)(parentPath, key.toLowerCase());
        console.log(subPath);
        if ((0, fs_1.existsSync)(subPath)) {
            (0, fs_1.mkdirSync)(subPath, { recursive: true });
        }
        (0, fs_1.mkdirSync)(subPath, { recursive: true });
        var rootName = value.NAME.toLowerCase();
        var rootModuleData = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', './templates/sub-module.txt'), 'utf8').toString();
        var rootControllerData = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', './templates/sub-controller.txt'), 'utf8').toString();
        this.subCreateController(subPath, rootName, rootControllerData, metadata[key]);
        this.subCreateModule(subPath, rootName, rootModuleData, metadata[key]);
        // LOG: sub folder created successfully
        console.log("sub folder created successfully");
    };
    ConsumerGeneration.prototype.subCreateController = function (subPath, rootName, template, metadata) {
        (0, fs_1.writeFileSync)((0, path_1.join)(subPath, "".concat(rootName, ".controller.ts")), template, { flag: "w" });
        this.doGenerateSubControllerByTemplate((0, path_1.join)(subPath, "".concat(rootName, ".controller.ts")), template, metadata);
    };
    ConsumerGeneration.prototype.subCreateModule = function (subPath, rootName, template, metadata) {
        (0, fs_1.writeFileSync)((0, path_1.join)(subPath, "".concat(rootName, ".module.ts")), template, { flag: "w" });
        this.doGenerateSubModuleByTemplate((0, path_1.join)(subPath, "".concat(rootName, ".module.ts")), template, metadata);
    };
    ConsumerGeneration.prototype.runtime = function () {
        return __awaiter(this, void 0, void 0, function () {
            var meta, root, micro, microLower, isReplaceOutput, microNameLower, modulePath, rootModuleData, controllerPath, rootControllerData, servicePath, rootServiceData, models, _loop_1, this_1, _i, models_1, model;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        meta = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', this.config.INPUT_PATH), 'utf-8').toString());
                        root = meta.MICROSERVICE_NAME.toLowerCase();
                        micro = meta.NAME.toLowerCase();
                        microLower = micro.toLowerCase();
                        delete meta.MICROSERVICE_NAME;
                        delete meta.NAME;
                        isReplaceOutput = false;
                        return [4 /*yield*/, inquirer_1.default.prompt({
                                type: 'input',
                                name: 'answer',
                                message: 'Do you want to create new? ',
                            }).then(function (answer) {
                                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                                _this.prefix.replace = isReplaceOutput;
                            })];
                    case 1:
                        _a.sent();
                        if (!this.prefix.replace) return [3 /*break*/, 5];
                        if (!this.validate()) return [3 /*break*/, 3];
                        this.doDeleteStructure((0, path_1.join)(__dirname, '..', this.config.TARGET_FOLDER));
                        return [4 /*yield*/, this.doGenerateStructure()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // LOG: Some wrong then cannot generate
                        console.log("Some wrong then cannot generate");
                        _a.label = 4;
                    case 4: return [3 /*break*/, 12];
                    case 5:
                        microNameLower = this.microserviceName.toLowerCase();
                        return [4 /*yield*/, inquirer_1.default.prompt({
                                type: 'input',
                                name: 'answer',
                                message: "Discovery ".concat(microNameLower, ".module.ts. Do you want to create new? "),
                            }).then(function (answer) {
                                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                                _this.prefix['rootModule'] = isReplaceOutput;
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, inquirer_1.default.prompt({
                                type: 'input',
                                name: 'answer',
                                message: "Discovery ".concat(microNameLower, ".controller.ts. Do you want to create new? "),
                            }).then(function (answer) {
                                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                                _this.prefix['rootController'] = isReplaceOutput;
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, inquirer_1.default.prompt({
                                type: 'input',
                                name: 'answer',
                                message: "Discovery ".concat(microNameLower, ".service.ts. Do you want to create new? "),
                            }).then(function (answer) {
                                isReplaceOutput = ['y', 'Y', 'yes'].indexOf(answer.answer) !== -1;
                                _this.prefix['rootService'] = isReplaceOutput;
                            })];
                    case 8:
                        _a.sent();
                        if (this.prefix['rootModule']) {
                            modulePath = (0, path_1.join)(__dirname, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                            rootModuleData = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', './templates/parent-module.txt'), 'utf8').toString();
                            (0, fs_1.mkdirSync)(modulePath, { recursive: true });
                            this.doGenerateParentModuleByTemplate((0, path_1.join)(modulePath, "".concat(microLower, ".service.ts")), rootModuleData, micro);
                        }
                        if (this.prefix['rootController']) {
                            controllerPath = (0, path_1.join)(__dirname, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                            rootControllerData = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', './templates/parent-controller.txt'), 'utf8').toString();
                            (0, fs_1.mkdirSync)(controllerPath, { recursive: true });
                            this.doGenerateParentControlerByTemplate((0, path_1.join)(controllerPath, "".concat(microLower, ".service.ts")), rootControllerData);
                        }
                        if (this.prefix['rootService']) {
                            servicePath = (0, path_1.join)(__dirname, this.config.TARGET_FOLDER, this.config.API_FOLDER, root);
                            rootServiceData = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', './templates/parent-service.txt'), 'utf8').toString();
                            (0, fs_1.mkdirSync)(servicePath, { recursive: true });
                            this.doGenerateParentServiceByTemplate((0, path_1.join)(servicePath, "".concat(microLower, ".service.ts")), rootServiceData);
                        }
                        models = Object.keys(meta).map(function (i) { return i.toLowerCase(); });
                        _loop_1 = function (model) {
                            var upper, subPath, modelAPIPathAll, modelAPIPathController, modelAPIPathModule;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        upper = model.toUpperCase();
                                        subPath = (0, path_1.join)(this_1.config.TARGET_FOLDER, this_1.config.API_FOLDER, root);
                                        modelAPIPathAll = (0, path_1.join)(subPath, model);
                                        modelAPIPathController = (0, path_1.join)(modelAPIPathAll, "".concat(meta[upper].NAME.toLowerCase(), ".controller.ts"));
                                        modelAPIPathModule = (0, path_1.join)(modelAPIPathAll, "".concat(meta[upper].NAME.toLowerCase(), ".module.ts"));
                                        if (!(0, fs_1.existsSync)(modelAPIPathAll)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, inquirer_1.default.prompt({
                                                message: "Discovery ".concat(modelAPIPathAll, ". Do you want to create new?"),
                                                type: 'input',
                                                name: 'answer'
                                            }).then(function (i) {
                                                _this.prefix["".concat(model, "All")] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                                            })];
                                    case 1:
                                        _b.sent();
                                        _b.label = 2;
                                    case 2:
                                        if (!this_1.prefix["".concat(model, "All")]) return [3 /*break*/, 3];
                                        this_1.subCreateController(modelAPIPathAll, meta[upper].NAME, (0, fs_1.readFileSync)('./templates/sub-controller.txt', 'utf8').toString(), meta[upper]);
                                        this_1.subCreateController(modelAPIPathAll, meta[upper].NAME, (0, fs_1.readFileSync)('./templates/sub-module.txt', 'utf8').toString(), meta[upper]);
                                        return [3 /*break*/, 8];
                                    case 3:
                                        if (!(0, fs_1.existsSync)(modelAPIPathController)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, inquirer_1.default.prompt({
                                                message: "Discovery ".concat(modelAPIPathController, ". Do you want to create new?"),
                                                type: 'input',
                                                name: 'answer'
                                            }).then(function (i) {
                                                _this.prefix["".concat(model, "Controller")] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                                            })];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5:
                                        if (!(0, fs_1.existsSync)(modelAPIPathModule)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, inquirer_1.default.prompt({
                                                message: "Discovery ".concat(modelAPIPathModule, ". Do you want to create new?"),
                                                type: 'input',
                                                name: 'answer'
                                            }).then(function (i) {
                                                _this.prefix["".concat(model, "Module")] = (['y', 'Y', 'yes'].indexOf(i.answer) !== -1);
                                            })];
                                    case 6:
                                        _b.sent();
                                        _b.label = 7;
                                    case 7:
                                        if (this_1.prefix["".concat(model, "Controller")]) {
                                            this_1.subCreateController(modelAPIPathAll, meta[upper].NAME, (0, fs_1.readFileSync)('./templates/sub-controller.txt', 'utf8').toString(), meta[upper]);
                                        }
                                        if (this_1.prefix["".concat(model, "Controller")]) {
                                            this_1.subCreateModule(modelAPIPathAll, meta[upper].NAME, (0, fs_1.readFileSync)('./templates/sub-module.txt', 'utf8').toString(), meta[upper]);
                                        }
                                        _b.label = 8;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, models_1 = models;
                        _a.label = 9;
                    case 9:
                        if (!(_i < models_1.length)) return [3 /*break*/, 12];
                        model = models_1[_i];
                        return [5 /*yield**/, _loop_1(model)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 9];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    return ConsumerGeneration;
}());
exports.ConsumerGeneration = ConsumerGeneration;
