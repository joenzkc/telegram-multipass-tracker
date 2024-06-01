import { Markup, Scenes } from "telegraf";
import { defaultKeyboard } from "..";
import { addPasses } from "../firebase/userDb";

const step1 = async (ctx) => {
  ctx.reply(
    "How many passes would you like to add?",
    Markup.keyboard([
      ["1", "2", "3", "4", "5"],
      ["6", "7", "8", "9", "10"],
    ]).resize()
  );
  ctx.wizard.next();
};

const step2 = async (ctx) => {
  const numPasses = parseInt(ctx.message.text);
  await addPasses(ctx.from.username, numPasses);
  ctx.reply(`You have added ${numPasses} passes!`, defaultKeyboard);
  ctx.scene.leave();
};

export const addPassesScene = new Scenes.WizardScene(
  "addPassesScene",
  step1,
  step2
);
