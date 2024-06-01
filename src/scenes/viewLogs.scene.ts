import { Markup, Scenes } from "telegraf";
import { defaultKeyboard } from "../index";
import { getUsersLogs } from "../firebase/logDb";
import { getUserByName, getUsers } from "../firebase/userDb";

const step1 = async (ctx) => {
  const users = (await getUsers()).map((user) => user.name);
  ctx.replyWithMarkdown(
    "Whos logs would you like to see?",
    Markup.keyboard([users]).resize()
  );
  ctx.wizard.next();
};

const step2 = async (ctx) => {
  const user = await getUserByName(ctx.message.text);
  const firebaseLogs = await getUsersLogs(user.telegram_id);
  let reply = `Here are ${user.name}'s logs📚:\n\n`;
  firebaseLogs.forEach((log) => {
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
