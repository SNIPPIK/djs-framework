export * from "./handlers/commands";
export * from "./handlers/events";
export * from "./handlers/components";

import { AnySelectMenuInteraction, AutocompleteInteraction, ButtonInteraction, ChannelType, ChatInputCommandInteraction, Client, CommandInteraction, InteractionType } from "discord.js";
import { Commands, SubCommand } from "./handlers/commands";
import { Middlewares } from "./handlers/middlewares";
import { Components } from "./handlers/components";
import { Events } from "./handlers/events";
import path from "node:path";

/**
 * @author SNIPPIK
 * @description Интерфейс для создания main класса
 * @interface DjFrameworkOptions
 */
interface DjFrameworkOptions {
    // Пути для загрузки
    locations: {
        base: string,
        components: string,
        commands: string,
        events: string,
        middlewares: string
    }

    // Список разработчиков
    ownerIDs: string[];

    // Возвраты ошибок
    failCallbacks: {
        onDontOwner: (ctx: ChatInputCommandInteraction) => void;
        onPermissionsUser: (ctx: ChatInputCommandInteraction) => void;
        onPermissionsClient: (ctx: ChatInputCommandInteraction) => void;
    }
}


/**
 * @author SNIPPIK
 * @description Класс с модулями
 * @public
 */
export class DjFramework {
    public middlewares: Middlewares;
    public components: Components;
    public commands: Commands;
    public events: Events;

    /**
     * @description Создаем класс
     * @param options - Пути для загрузки
     * @public
     */
    public constructor(protected options: DjFrameworkOptions) {
        if (options.locations && options.locations.base) {
            // Загружаем события
            if (options.locations.events) {
                this.events = new Events(path.resolve(options.locations.base, options.locations.events));
            }

            // Загружаем middlewares
            if (options.locations.middlewares) {
                this.middlewares = new Middlewares(path.resolve(options.locations.base, options.locations.middlewares));
            }

            // Загружаем команды
            if (options.locations.commands) {
                this.commands = new Commands(path.resolve(options.locations.base, options.locations.commands));
            }

            // Загружаем компоненты
            if (options.locations.components) {
                this.components = new Components(path.resolve(options.locations.base, options.locations.components));
            }
        }
    };

    /**
     * @description Запуск загрузки данных в модулях
     * @param client - Экземпляр класса
     * @public
     */
    public register = (client: Client) => {
        for (let module of [this.components, this.commands, this.events, this.middlewares]) {
            if (module) module.register(client);
        }

        client.on("interactionCreate", (ctx) => {
            // Если используется функция ответа от бота
            if (ctx.type === InteractionType.ApplicationCommandAutocomplete) {
                return this.SelectAutocomplete(ctx);
            }

            // Если пользователь использует команду
            else if (ctx.type === InteractionType.ApplicationCommand) {
                return this.SelectCommand(ctx as any);
            }

            // Действия выбора/кнопок
            else if (ctx.type == InteractionType.MessageComponent) {
                return this.SelectComponent(ctx);
            }
        });
    };

    /**
     * @description Функция выполняющая действия SelectCommand
     * @param ctx - Данные для запуска функций
     * @readonly
     * @private
     */
    private readonly SelectCommand = (ctx: ChatInputCommandInteraction) => {
        const command = this.commands.get(ctx.commandName);

        // Если нет команды
        // Если пользователь пытается использовать команду разработчика
        if (!command || (command.owner && !this.options.ownerIDs.includes(ctx.member.user.id))) {
            this.commands.remove(ctx.client, ctx.commandGuildId, ctx.commandId);

            return this.options.failCallbacks.onDontOwner(ctx);
        }

        // Проверка middleware
        else if (command.middlewares?.length > 0) {
            for (const rule of this.middlewares.array) {
                if (command.middlewares.includes(rule.name as any) && !rule.callback(ctx)) return null;
            }
        }

        // Проверка прав
        else if (command.permissions && isBased(ctx) === "guild") {
            const { user: userPerms, client: botPerms } = command.permissions;

            // Проверка прав пользователя
            if (userPerms?.length && !userPerms.every(perm => ctx.member?.permissions?.["has"](perm))) {
                return this.options.failCallbacks.onPermissionsUser(ctx);
            }

            // Проверка прав бота
            if (botPerms?.length && !botPerms.every(perm => ctx.guild?.members.me?.permissionsIn(ctx.channel)?.has(perm))) {
                return this.options.failCallbacks.onPermissionsClient(ctx);
            }
        }

        // Ищем подкоманду
        const subcommand: SubCommand = command.options?.find((sub) => sub.name === ctx.options["_subcommand"] && "run" in sub) as any;

        // Ищем аргументы
        const args: any[] = ctx.options?.["_hoistedOptions"]?.map(f => f[f.name] ?? f.value) ?? [];

        // Запускаем команду
        return (subcommand ?? command).run({ ctx, args });
    };

    /**
     * @description Функция выполняющая действия SelectAutocomplete
     * @param ctx - Данные для запуска функций
     * @readonly
     * @private
     */
    private readonly SelectAutocomplete = (ctx: AutocompleteInteraction) => {
        const command = this.commands.get(ctx.commandName);

        // Если не найдена команда
        if (!command) return null;

        // Ищем аргументы
        const args: any[] = ctx.options?.["_hoistedOptions"]?.map(f => f[f.name] ?? f.value) ?? [];
        if (args.length === 0 || args.some(a => a === "")) return null;

        const subName = ctx.options["_subcommand"];
        for (const opt of command.options) {
            if (subName ? opt.name === subName : opt.autocomplete) return (opt.autocomplete ?? opt.options?.find(o => o.autocomplete)?.
                autocomplete)?.({ctx, args}) ?? null;
        }

        return null;
    };

    /**
     * @description Функция выполняющая действия компонентов такие как button/selector
     * @param ctx - Данные для запуска функций
     * @readonly
     * @private
     */
    private readonly SelectComponent = (ctx: ButtonInteraction | AnySelectMenuInteraction) => {
        const component = this.components.get(ctx.customId);

        // Если не найден такой компонент
        if (!component) return null;

        const { middlewares, callback } = component;

        // Делаем проверку ограничений
        if (middlewares?.length > 0) {
            for (const rule of this.middlewares.array) {
                if (middlewares.includes(rule.name as any) && !rule.callback(ctx)) return null;
            }
        }

        // Если компонент был найден
        return callback(ctx);
    };
}

/**
 * @author SNIPPIK
 * @description Получаем тип канала, для работы все сервера
 * @function isBased
 */
function isBased(ctx: CommandInteraction) {
    const type = ctx.channel?.type;

    // Проверяем на наличие типа канала
    if (type !== undefined) {
        // Если используется на сервере
        if (type === ChannelType.GuildText || type === ChannelType.GuildAnnouncement || type === ChannelType.GuildStageVoice || type === ChannelType.GuildVoice) return "guild";

        // Если используется в личном чате
        else if (type === ChannelType.PrivateThread) return "private";
    }

    // Если используется на стороннем сервере
    return "public";
}