"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const SetArray_1 = require("./SetArray");
const path = __importStar(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
class handler {
    directory;
    _files = new SetArray_1.SetArray();
    get files() {
        return this._files;
    }
    ;
    get size() {
        return this._files.size;
    }
    ;
    constructor(directory) {
        this.directory = directory;
    }
    ;
    load = () => {
        if (this.size > 0) {
            this.files.clear();
        }
        const selfDir = path.resolve(this.directory);
        if (!node_fs_1.default.existsSync(selfDir))
            throw new Error(`Directory not found: ${selfDir}`);
        this._loadRecursive(selfDir);
    };
    _loadRecursive = (dirPath) => {
        const entries = node_fs_1.default.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.resolve(dirPath, entry.name);
            if (entry.isDirectory())
                this._loadRecursive(fullPath);
            else if (entry.isFile()) {
                if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".js"))
                    continue;
                if (entry.name.startsWith("index"))
                    continue;
                this._push(fullPath);
            }
        }
    };
    _push = (path) => {
        const imported = require(path);
        delete require.cache[require.resolve(path)];
        if (!imported?.default)
            throw new Error(`Missing default export in ${path}`);
        const default_export = imported.default;
        if (default_export instanceof Array) {
            for (const obj of default_export) {
                if (obj.prototype)
                    this._files.add(new obj(null));
                else
                    this._files.add(obj);
            }
            return;
        }
        else if (default_export.prototype) {
            this._files.add(new default_export(null));
            return;
        }
        this._files.add(default_export);
    };
}
exports.handler = handler;
