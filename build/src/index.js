"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DjFramework = void 0;
__exportStar(require("./handlers/commands"), exports);
__exportStar(require("./handlers/events"), exports);
__exportStar(require("./handlers/components"), exports);
__exportStar(require("./utils/Assign"), exports);
const discord_js_1 = require("discord.js");
const commands_1 = require("./handlers/commands");
const middlewares_1 = require("./handlers/middlewares");
const components_1 = require("./handlers/components");
const events_1 = require("./handlers/events");
const node_path_1 = __importDefault(require("node:path"));
class DjFramework {
    options;
    middlewares;
    components;
    commands;
    events;
    constructor(options) {
        this.options = options;
        if (options.locations && options.locations.base) {
            if (options.locations.events) {
                this.events = new events_1.Events(node_path_1.default.resolve(options.locations.base, options.locations.events));
            }
            if (options.locations.middlewares) {
                this.middlewares = new middlewares_1.Middlewares(node_path_1.default.resolve(options.locations.base, options.locations.middlewares));
            }
            if (options.locations.commands) {
                this.commands = new commands_1.Commands(node_path_1.default.resolve(options.locations.base, options.locations.commands));
            }
            if (options.locations.components) {
                this.components = new components_1.Components(node_path_1.default.resolve(options.locations.base, options.locations.components));
            }
        }
    }
    ;
    register = (client) => {
        for (let module of [this.components, this.commands, this.events, this.middlewares]) {
            if (module)
                module.register(client);
        }
        client.on("interactionCreate", (ctx) => {
            if (ctx.type === discord_js_1.InteractionType.ApplicationCommandAutocomplete) {
                return this.SelectAutocomplete(ctx);
            }
            else if (ctx.type === discord_js_1.InteractionType.ApplicationCommand) {
                return this.SelectCommand(ctx);
            }
            else if (ctx.type == discord_js_1.InteractionType.MessageComponent) {
                return this.SelectComponent(ctx);
            }
        });
    };
    SelectCommand = (ctx) => {
        const command = this.commands.get(ctx.commandName);
        if (!command || (command.owner && !this.options.ownerIDs.includes(ctx.member.user.id))) {
            this.commands.remove(ctx.client, ctx.commandGuildId, ctx.commandId);
            return this.options.failCallbacks.onDontOwner(ctx);
        }
        else if (command.middlewares?.length > 0) {
            for (const rule of this.middlewares.array) {
                if (command.middlewares.includes(rule.name) && !rule.callback(ctx))
                    return null;
            }
        }
        else if (command.permissions && isBased(ctx) === "guild") {
            const { user: userPerms, client: botPerms } = command.permissions;
            if (userPerms?.length && !userPerms.every(perm => ctx.member?.permissions?.["has"](perm))) {
                return this.options.failCallbacks.onPermissionsUser(ctx);
            }
            if (botPerms?.length && !botPerms.every(perm => ctx.guild?.members.me?.permissionsIn(ctx.channel)?.has(perm))) {
                return this.options.failCallbacks.onPermissionsClient(ctx);
            }
        }
        const subcommand = command.options?.find((sub) => sub.name === ctx.options["_subcommand"] && "run" in sub);
        const args = ctx.options?.["_hoistedOptions"]?.map(f => f[f.name] ?? f.value) ?? [];
        return (subcommand ?? command).run({ ctx, args });
    };
    SelectAutocomplete = (ctx) => {
        const command = this.commands.get(ctx.commandName);
        if (!command)
            return null;
        const args = ctx.options?.["_hoistedOptions"]?.map(f => f[f.name] ?? f.value) ?? [];
        if (args.length === 0 || args.some(a => a === ""))
            return null;
        const subName = ctx.options["_subcommand"];
        for (const opt of command.options) {
            if (subName ? opt.name === subName : opt.autocomplete)
                return (opt.autocomplete ?? opt.options?.find(o => o.autocomplete)?.
                    autocomplete)?.({ ctx, args }) ?? null;
        }
        return null;
    };
    SelectComponent = (ctx) => {
        const component = this.components.get(ctx.customId);
        if (!component)
            return null;
        const { middlewares, callback } = component;
        if (middlewares?.length > 0) {
            for (const rule of this.middlewares.array) {
                if (middlewares.includes(rule.name) && !rule.callback(ctx))
                    return null;
            }
        }
        return callback(ctx);
    };
}
exports.DjFramework = DjFramework;
function isBased(ctx) {
    const type = ctx.channel?.type;
    if (type !== undefined) {
        if (type === discord_js_1.ChannelType.GuildText || type === discord_js_1.ChannelType.GuildAnnouncement || type === discord_js_1.ChannelType.GuildStageVoice || type === discord_js_1.ChannelType.GuildVoice)
            return "guild";
        else if (type === discord_js_1.ChannelType.PrivateThread)
            return "private";
    }
    return "public";
}
