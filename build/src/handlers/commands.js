"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCommand = exports.Command = exports.BaseCommand = exports.Commands = void 0;
exports.Declare = Declare;
exports.Options = Options;
exports.Middlewares = Middlewares;
exports.Permissions = Permissions;
const discord_js_1 = require("discord.js");
const handler_1 = require("../utils/handler");
class Commands extends handler_1.handler {
    get owner() {
        return this.files.filter(cmd => cmd.owner);
    }
    ;
    get public() {
        return this.files.filter(cmd => !cmd.owner);
    }
    ;
    constructor(path) {
        super(path);
    }
    ;
    get = (names) => {
        return this.files.find((cmd) => {
            if (typeof names === "string")
                return cmd.name === names;
            return names.includes(cmd.name);
        });
    };
    remove = (client, guildID, CommandID) => {
        this.unregisterRest(discord_js_1.Routes.applicationGuildCommand(client.user.id, guildID, CommandID), client);
        this.unregisterRest(discord_js_1.Routes.applicationCommand(client.user.id, CommandID), client);
    };
    register = (client, guildID) => {
        const guild = client.guilds.cache.get(guildID);
        this.load();
        if (!this.files.size)
            throw new Error("Not loaded commands");
        this.registerRest(discord_js_1.Routes.applicationCommands(client.application.id), this.public, client);
        if (guild) {
            this.registerRest(discord_js_1.Routes.applicationGuildCommands(client.application.id, guildID), this.owner, client);
        }
    };
    registerRest = (route, body, client) => {
        const rest = client.rest;
        rest.put(route, {
            body: body ? body.map(cmd => cmd.toJSON()) : null
        })
            .catch(console.error);
    };
    unregisterRest = (route, client) => {
        const rest = client.rest;
        rest.delete(route)
            .catch(console.error);
    };
}
exports.Commands = Commands;
class BaseCommand {
    type = discord_js_1.ApplicationCommandType.ChatInput;
    name;
    name_localizations;
    description;
    description_localizations;
    default_member_permissions;
    nsfw;
    integration_types;
    contexts;
    options;
    owner;
    permissions;
    middlewares;
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            nsfw: !!this.nsfw,
            description: this.description,
            name_localizations: this.name_localizations,
            description_localizations: this.description_localizations,
            default_member_permissions: this.default_member_permissions,
            contexts: this.contexts,
            integration_types: this.integration_types,
        };
    }
    ;
}
exports.BaseCommand = BaseCommand;
class Command extends BaseCommand {
    toJSON = () => {
        const options = [];
        for (const i of this.options ?? []) {
            if (!(i instanceof SubCommand)) {
                options.push({ ...i, autocomplete: "autocomplete" in i });
                continue;
            }
            options.push(i.toJSON());
        }
        return {
            ...super.toJSON(),
            options,
        };
    };
}
exports.Command = Command;
class SubCommand extends BaseCommand {
    type = discord_js_1.ApplicationCommandOptionType.Subcommand;
    toJSON() {
        return {
            ...super.toJSON(),
            options: this.options?.map(x => ({ ...x, autocomplete: "autocomplete" in x })) ?? [],
        };
    }
    ;
}
exports.SubCommand = SubCommand;
function Declare(options) {
    const CommandType = options.type ?? discord_js_1.ApplicationCommandType.ChatInput;
    const [nameKey] = Object.keys(options.names);
    const [descKey] = CommandType === 1 ? Object.keys(options["descriptions"]) : [null];
    return (target) => class extends target {
        name = options.names[nameKey];
        name_localizations = options.names;
        description = CommandType === 1 ? options["descriptions"][descKey] : null;
        description_localizations = CommandType === 1 ? options["descriptions"] : null;
        integration_types = options.integration_types?.map(x => x === "GUILD_INSTALL" ? 0 : 1) ?? [0];
        contexts = options.contexts?.map(x => x === "GUILD" ? 0 : x === "BOT_DM" ? 1 : 2) ?? [0];
        owner = options.owner ?? false;
        type = CommandType;
    };
}
function normalizeOption(opt) {
    const [nameKey] = Object.keys(opt.names);
    const [descKey] = Object.keys(opt.descriptions);
    return {
        ...opt,
        name: opt.names[nameKey],
        nameLocalizations: opt.names,
        description: opt.descriptions[descKey],
        descriptionLocalizations: opt.descriptions,
        options: opt.options?.map(normalizeOption)
    };
}
function Options(options) {
    return (target) => class extends target {
        options = Array.isArray(options)
            ? options.map(x => new x())
            : Object.values(options).map(normalizeOption);
    };
}
function Middlewares(cbs) {
    return (target) => class extends target {
        middlewares = cbs;
    };
}
function Permissions(permissions) {
    return (target) => class extends target {
        permissions = permissions;
    };
}
