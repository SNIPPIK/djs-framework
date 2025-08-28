"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = exports.Components = void 0;
exports.DeclareComponent = DeclareComponent;
const handler_1 = require("../utils/handler");
class Components extends handler_1.handler {
    constructor(path) {
        super(path);
    }
    ;
    register = () => {
        this.load();
    };
    get = (name) => {
        return this.files.find((button) => button.name === name);
    };
}
exports.Components = Components;
class Component {
    callback;
}
exports.Component = Component;
function DeclareComponent(options) {
    return (target) => class extends target {
        name = options.name;
    };
}
