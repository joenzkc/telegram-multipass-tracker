import { Markup, Scenes } from "telegraf";
import userDb from "../db/user.db";
import { defaultKeyboard } from "..";

const step1 = (ctx) => {
  ctx.reply(
    "How many passes did you use?",
    Markup.keyboard([["1", "2", "3", "4", "5"], ["Custom"]]).resize()
  );
  ctx.wizard.next();
};

const step2 = (ctx) => {
  let numPassesUsed = 0;
  if (parseInt(ctx.message.text)) {
    ctx.wizard.state["numPassesUsed"] = parseInt(ctx.message.text);
    ctx.wizard.selectStep(3);
    ctx.wizard.steps[ctx.wizard.cursor](ctx);
  } else {
    ctx.reply("Enter how many passes you used:");
    ctx.wizard.next();
  }
};

const step3 = (ctx) => {
  console.log(ctx.message.text);
  if (Number.isInteger(parseInt(ctx.message.text))) {
    ctx.wizard.state["numPassesUsed"] = parseInt(ctx.message.text);
    ctx.wizard.selectStep(3);
    ctx.wizard.steps[ctx.wizard.cursor](ctx);
  }
};

const step4 = async (ctx) => {
  try {
    const remaining = await userDb.usePasses(
      ctx.from.username,
      ctx.wizard.state["numPassesUsed"]
    );
    ctx.replyWithMarkdown(
      `You have ${remaining} passes remaining!`,
      defaultKeyboard
    );
    ctx.scene.leave();
  } catch (e) {
    ctx.reply(e.message, defaultKeyboard);
    ctx.scene.leave();
  }
};

export const useMyPassesScene = new Scenes.WizardScene(
  "useMyPassesScene",
  step1,
  step2,
  step3,
  step4
);
