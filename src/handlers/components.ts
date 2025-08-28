import { AnySelectMenuInteraction, ButtonInteraction } from "discord.js";
import { RegisteredMiddlewares } from "./commands";
import { handler } from "../utils/handler";

/**
 * @author SNIPPIK
 * @description Загружаем динамические компоненты для работы с ними
 * @support Buttons
 * @class Components
 * @extends handler
 * @public
 */
export class Components extends handler<SupportComponent> {
    public constructor(path: string) {
        super(path);
    };

    /**
     * @description Регистрируем кнопки в эко системе бота
     * @public
     */
    public register = () => {
        this.load();
    };

    /**
     * @description Выдача кнопки из всей базы
     * @param name - Название кнопки
     */
    public get = (name: string) => {
        return this.files.find((button) => button.name === name);
    };
}

/**
 * @author SNIPPIK
 * @description
 */
export type SupportComponent<T = "button" | "selector"> = {
    /**
     * @description Название кнопки
     */
    name?: string;

    /**
     * @description Функция выполнения кнопки
     * @param msg - Сообщение пользователя
     */
    callback?: (ctx: T extends "button" ? ButtonInteraction : AnySelectMenuInteraction) => any;

    /**
     * @description Права для использования той или иной команды
     * @default null
     * @readonly
     * @public
     */
    readonly middlewares?: RegisteredMiddlewares[];
}

/**
 * @author SNIPPIK
 * @description Класс для создания компонентов
 */
export class Component<T = "button" | "selector"> implements SupportComponent<T> {
    public callback: SupportComponent<T>["callback"];
}

/**
 * @author SNIPPIK
 * @description Декоратор создающий заголовок команды
 * @decorator
 */
export function DeclareComponent(options: {name: string}) {
    // Загружаем данные в класс
    return <T extends { new (...args: any[]): object }>(target: T) =>
        class extends target {
            name = options.name;
        }
}