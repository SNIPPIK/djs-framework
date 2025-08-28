# Simple framework for discord.js
- Support: SlashCommand, Components (Buttons, Selectors), Middlewares, Events
- Detail: Application User Commands, Guild Commands, Private Commands


### Fast Example
- For more details see [here](.example)
```ts
import { Client } from "discord.js";
import { DjsFramework } from "snpk-djs-framework";

const client = new Client({
    // Права бота
    intents: [
        // Доступ к серверам
        "Guilds",

        // Отправление сообщений
        "GuildMessages",
        "DirectMessages",

        // Нужен для голосовой системы
        "GuildVoiceStates",
    ]
});

// Load DjsFramework
const djs_frame = new DjsFramework({
    locations: {
        base: "src",
        commands: "handlers/commands",
        events: "handlers/events",
        components: "handlers/components",
        middlewares: "handlers/middlewares"
    },
    ownerIDs: ["312909267327778818"],
    failCallbacks: {
        onDontOwner: (ctx) => {
            console.log(ctx);
        },

        onPermissionsClient: (ctx) => {
            console.log(ctx);
        },

        onPermissionsUser: (ctx) => {
            console.log(ctx);
        }
    }
});

// Login
client.login("").then(() => {
    djs_frame.register(client);
});
```