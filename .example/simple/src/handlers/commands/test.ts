import { Command, Declare, Options, Middlewares, Permissions, CommandContext } from "snpk-djs-framework"
import { ApplicationCommandOptionType } from "discord.js";

@Declare({
    names: {
        "en-US": "test"
    },
    descriptions: {
        "en-US": "Simple description"
    },
    contexts: ["GUILD"],
    integration_types: ["GUILD_INSTALL"],
    type: 1
})
@Options({
    first: {
        names: {
            "en-US": "ctx"
        },
        descriptions: {
            "en-US": "description wow"
        },
        required: true,
        type: ApplicationCommandOptionType.String
    }
})
@Middlewares(["checkVoice"])
@Permissions({
    client: ["Connect"],
    user: ["SendMessages"]
})
class Test extends Command {
    async run ({ctx, args}: CommandContext<string>) {
        const argument = args[0];

        return ctx.reply({
            embeds: [
                {
                    description: argument
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 2,
                            emoji: {
                                name: "⬅"
                            },
                            custom_id: "reply",
                        },
                    ]
                }
            ]
        })
    }
}

/**
 * @export default
 * @description Не даем классам или объектам быть доступными везде в проекте
 */
export default [Test];