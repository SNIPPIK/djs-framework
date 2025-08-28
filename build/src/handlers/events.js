"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.Events = void 0;
const handler_1 = require("../utils/handler");
class Events extends handler_1.handler {
    constructor(path) {
        super(path);
    }
    ;
    register = (client) => {
        if (this.size > 0) {
            for (let item of this.files) {
                client.off(item.name, item.execute);
            }
        }
        this.load();
        for (let item of this.files) {
            client[item.once ? "once" : "on"](item.name, item.execute);
        }
    };
}
exports.Events = Events;
class Event {
    name;
    once;
    execute;
}
exports.Event = Event;
