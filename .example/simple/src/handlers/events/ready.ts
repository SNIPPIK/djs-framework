import { Assign, Event } from "djs-framework"
import { Events } from "discord.js";

/**
 * @author SNIPPIK
 * @description Класс события ClientReady
 * @class ClientReady
 * @extends Assign
 * @event Events.ClientReady
 * @public
 */
export class ClientReady extends Assign<Event<Events.ClientReady>> {
    public constructor() {
        super({
            name: Events.ClientReady,
            once: false,
            execute: (client) => {
                console.log(client.user.username);
            }
        });
    };
}

/**
 * @export default
 * @description Не даем классам или объектам быть доступными везде в проекте
 */
export default [ClientReady];