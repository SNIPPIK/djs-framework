"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middlewares = void 0;
const handler_1 = require("../utils/handler");
class Middlewares extends handler_1.handler {
    get array() {
        return this.files.array;
    }
    ;
    constructor(path) {
        super(path);
    }
    ;
    register = this.load;
    filter(predicate) {
        return this.files.filter(predicate);
    }
    ;
}
exports.Middlewares = Middlewares;
