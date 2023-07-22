import { DefaultContext, DefaultState } from "koa";
import Koa from "koa";
import Router from "koa-router";
import { config } from "dotenv";
import { Markup, Scenes, Telegraf, session } from "telegraf";
import LogDb from "./db/log.db";
import { AppDataSource } from "./datasource";
import UserDb from "./db/user.db";
import { useMyPassesScene } from "./scenes/useMyPasses.scene";

const app: Koa<DefaultState, DefaultContext> = new Koa();
const router = new Router();
const logDb = new LogDb();
const userDb = new UserDb();
let bot;
config();

export const defaultKeyboard = Markup.keyboard([
  ["Use my passes 💪", "Use someone elses passes 🤔"],
  ["Logs📝", "Stats📊"],
]).resize();
const setup = async () => {
  router.get("/", (ctx) => {
    ctx.body = process.env.TELEGRAM_BOT_TOKEN;
  });
  await AppDataSource.initialize();
  console.log("Database initialized");

  app.use(router.routes()).use(router.allowedMethods());
  bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  bot.use(session());
  const stage = new Scenes.Stage([useMyPassesScene]);
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    const user = await UserDb.getUser(ctx.from.username);
    if (user) {
      //   console.log(user);
      let reply = `Welcome back ${user.name}! 🎉\n\nWhat would you like to do today? \n\n*Remaining passes*:\n`;
      reply += await userDb.getStats();
      ctx.replyWithMarkdown(reply, defaultKeyboard);
    } else {
      ctx.reply("Im sorry, I do not recognise you :(");
    }
  });

  bot.hears("Use my passes 💪", (ctx) => {
    ctx.scene.enter("useMyPassesScene");
  });

  bot.hears("Logs📝", async (ctx) => {
    const logs = await LogDb.getAllLogs();
    let reply = "";
    logs.forEach((log, index) => {
      reply += `${index + 1}: ${log.data}\n`;
    });
    ctx.reply(reply, defaultKeyboard);
  });
  bot.launch();
};

setup();
