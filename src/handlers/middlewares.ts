import { AnySelectMenuInteraction, ButtonInteraction, CommandInteraction } from "discord.js";
import { handler } from "../utils/handler";

/**
 * @author SNIPPIK
 * @description Доступные проверки
 * @type RegisteredMiddlewares
 * @public
 */
export type RegisteredMiddlewares = string;

/**
 * @author SNIPPIK
 * @description Все доступные middlewares, присутствующие в системе динамической загрузки
 * @class Middlewares
 * @extends handler
 * @public
 */
export class Middlewares<T = middleware<CommandInteraction | ButtonInteraction | AnySelectMenuInteraction>> extends handler<T> {
    /**
     * @description Производим поиск по функции
     * @public
     */
    public get array() {
        return this.files.array;
    };

    /**
     * @description Загружаем класс вместе с дочерним
     */
    public constructor(path: string) {
        super(path);
    };

    /**
     * @description Регистрируем в эко системе бота
     * @public
     */
    public register = this.load

    /**
     * @description Производим фильтрацию по функции
     * @param predicate - Функция поиска
     * @public
     */
    public filter(predicate: (item: T) => boolean) {
        return this.files.filter(predicate);
    };
}

/**
 * @author SNIPPIK
 * @description Стандартный middleware, без наворотов!
 * @interface middleware
 * @public
 */
export interface middleware<T> {
    name: RegisteredMiddlewares;
    callback: (message: T) => boolean;
}