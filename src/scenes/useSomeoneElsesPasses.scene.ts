import { Markup, Scenes } from "telegraf";
import { defaultKeyboard } from "..";
import { getUserByName, getUsers, usePasses } from "../firebase/userDb";

const step1 = async (ctx) => {
  // let users = await UserDb.getUsers();
  let users = await getUsers();
  const usersStrings: string[] = users
    .filter((user) => user.telegram_id !== ctx.from.username)
    .map((user) => user.name);
  ctx.reply(
    "Who are we borrowing passes from?",
    Markup.keyboard(usersStrings).resize()
  );
  ctx.wizard.next();
};

const step2 = async (ctx) => {
  // const user = await UserDb.getUserByName(ctx.message.text);
  const user = getUserByName(ctx.message.text);
  ctx.wizard.state["borrowing_from"] = user;
  ctx.reply(
    "How many passes are we borrowing?",
    Markup.keyboard([
      ["1", "2", "3", "4", "5"],
      ["6", "7", "8", "9", "10"],
    ]).resize()
  );
  ctx.wizard.next();
};

const step3 = async (ctx) => {
  const numPassesBorrowed = parseInt(ctx.message.text);
  const user = ctx.wizard.state["borrowing_from"];
  // await UserDb.usePasses(
  //   user.telegram_id,
  //   numPassesBorrowed,
  //   true,
  //   ctx.from.username
  // );
  await usePasses(user.telegram_id, numPassesBorrowed, true, ctx.from.username);
  ctx.reply(
    `You have borrowed ${numPassesBorrowed} passes from ${user.name}!`,
    defaultKeyboard
  );
  ctx.scene.leave();
};

export const useSomeoneElsesPassesScene = new Scenes.WizardScene(
  "useSomeoneElsesPassesScene",
  step1,
  step2,
  step3
);
