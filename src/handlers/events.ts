import { Client, ClientEvents } from "discord.js";
import { handler } from "../utils/handler";

/**
 * @author SNIPPIK
 * @description Класс для взаимодействия с событиями
 * @class Events
 * @extends handler
 * @public
 */
export class Events extends handler<Event<keyof ClientEvents>> {
    /**
     * @description Загружаем класс вместе с дочерним
     * @public
     */
    public constructor(path: string) {
        super(path);
    };

    /**
     * @description Регистрируем ивенты в эко системе бота
     * @public
     */
    public register = (client: Client) => {
        if (this.size > 0) {
            // Отключаем только загруженные события
            for (let item of this.files) {
                client.off(item.name as any, item.execute);
            }
        }

        // Загружаем события заново
        this.load();

        // Проверяем ивенты
        for (let item of this.files) {
            client[item.once ? "once" : "on"](item.name as any, item.execute);
        }
    };
}

/**
 * @author SNIPPIK
 * @description Все имена событий доступных для прослушивания
 * @type EventNames
 */
type EventNames<T> = T extends keyof ClientEvents ? keyof ClientEvents : never;

/**
 * @author SNIPPIK
 * @description Функция выполняемая при вызове события
 * @type EventCallback
 */
type EventCallback<T> = T extends keyof ClientEvents ? (...args: ClientEvents[T]) => void : never;

/**
 * @author SNIPPIK
 * @description Интерфейс для событий
 * @class Event
 * @public
 */
export abstract class Event<T extends keyof ClientEvents> {
    /**
     * @description Название событие
     * @default null
     * @readonly
     * @public
     */
    readonly name: EventNames<T>;

    /**
     * @description Тип выполнения события
     * @default null
     * @readonly
     * @public
     */
    readonly once: boolean;

    /**
     * @description Функция, которая будет запущена при вызове события
     * @default null
     * @readonly
     * @public
     */
    readonly execute: EventCallback<T>;
}