import { Markup, Scenes } from "telegraf";
import UserDb from "../db/user.db";
import LogDb from "../db/log.db";
import { defaultKeyboard } from "../index";

const step1 = async (ctx) => {
  const users = (await UserDb.getUsers()).map((user) => user.name);
  ctx.replyWithMarkdown(
    "Whos logs would you like to see?",
    Markup.keyboard([users]).resize()
  );
  ctx.wizard.next();
};

const step2 = async (ctx) => {
  const user = await UserDb.getUserByName(ctx.message.text);
  const logs = await LogDb.getUsersLogs(user.telegram_id);
  let reply = `Here are ${user.name}'s logs📚:\n\n`;
  logs.forEach((log) => {
    reply += `${log.data}\n`;
  });
  ctx.reply(reply, defaultKeyboard);
  ctx.scene.leave();
};

export const viewLogsScene = new Scenes.WizardScene(
  "viewLogsScene",
  step1,
  step2
);
