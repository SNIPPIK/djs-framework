import { Colors, CommandInteraction } from "discord.js";
import { Assign, middleware } from "snpk-djs-framework"

/**
 * @author SNIPPIK
 * @description Middleware для проверки подключения к голосовому каналу пользователя
 * @usage Для команд, где требуется голосовой канал
 * @class VoiceChannel
 * @extends Assign
 */
class VoiceChannel extends Assign<middleware<CommandInteraction>> {
    public constructor() {
        super({
            name: "checkVoice",
            callback: (ctx) => {
                const VoiceChannel = ctx.member["voice"].channel;

                // Если нет голосового подключения
                if (!VoiceChannel) {
                    ctx.reply({
                        flags: "Ephemeral",
                        embeds: [
                            {
                                description: "Your dot a voice channer",
                                color: Colors.Yellow
                            }
                        ],
                    })
                    return false;
                }

                return true;
            }
        });
    };
}

/**
 * @export default
 * @description Не даем классам или объектам быть доступными везде в проекте
 */
export default [VoiceChannel];