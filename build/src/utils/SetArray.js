"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetArray = void 0;
class SetArray extends Set {
    get array() {
        return Array.from(this.values());
    }
    ;
    filter = (predicate) => {
        return this.array.filter(predicate);
    };
    find = (predicate) => {
        return this.array.find(predicate);
    };
}
exports.SetArray = SetArray;
