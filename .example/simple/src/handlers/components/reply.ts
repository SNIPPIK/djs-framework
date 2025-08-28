import { DeclareComponent, Middlewares, Component } from "snpk-djs-framework"


@DeclareComponent({
    name: "reply"
})
@Middlewares(["checkVoice"])
class Button extends Component<"button"> {
    public callback: Component<"button">["callback"] = (ctx) => {
        return ctx.reply("button ok");
    };
}

/**
 * @export default
 * @description Не даем классам или объектам быть доступными везде в проекте
 */
export default [Button];