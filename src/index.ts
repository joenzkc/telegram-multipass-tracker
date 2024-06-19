import { DefaultContext, DefaultState } from "koa";
import Koa from "koa";
import Router from "koa-router";
import { config } from "dotenv";
import { Markup, Scenes, Telegraf, session } from "telegraf";
// import LogDb from "./db/log.db";
// import { AppDataSource } from "./datasource";
import UserDb from "./db/user.db";
import { useMyPassesScene } from "./scenes/useMyPasses.scene";
import { useSomeoneElsesPassesScene } from "./scenes/useSomeoneElsesPasses.scene";
import { viewLogsScene } from "./scenes/viewLogs.scene";
import { addPassesScene } from "./scenes/addPasses.scene";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStats } from "./firebase/userDb";

const app: Koa<DefaultState, DefaultContext> = new Koa();
const router = new Router();
// const logDb = new LogDb();
// const userDb = new UserDb();
let bot;
config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebase = initializeApp(firebaseConfig);
export const firebaseDb = getFirestore(firebase);

export const defaultKeyboard = Markup.keyboard([
  [
    "Use my passes 💪",
    "Add passes🎟️",
    // , "Use someone elses passes 🤔"
  ],
  ["Logs📝", "Stats📊"],
]).resize();

// const migrateData = async () => {
//   const users = await UserDb.getUsers();
//   const logs = await LogDb.getAllLogs();

//   try {
//     for (const user of users) {
//       await addDoc(collection(firebaseDb, "users"), {
//         telegram_id: user.telegram_id,
//         name: user.name,
//         passes_remaining: user.passes_remaining,
//       });
//     }

//     for (const log of logs) {
//       await addDoc(collection(firebaseDb, "logs"), {
//         id: log.id,
//         telegram_id: log.telegram_id,
//         data: log.data,
//       });
//     }

//     console.log("Data migrated");
//   } catch (e) {
//     console.log(e);
//     console.log("error");
//   }
// };

const setup = async () => {
  router.get("/", (ctx) => {
    ctx.body = "Awake!";
  });
  // await AppDataSource.initialize();
  // console.log("Database initialized");

  app.use(router.routes()).use(router.allowedMethods());
  bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  bot.use(session());
  const stage = new Scenes.Stage([
    useMyPassesScene,
    useSomeoneElsesPassesScene,
    viewLogsScene,
    addPassesScene,
  ]);
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    const user = await UserDb.getUser(ctx.from.username);
    if (user) {
      //   console.log(user);
      let reply = `Welcome back ${user.name}! 🎉\n\nWhat would you like to do today? \n\n*Remaining passes*:\n`;
      reply += await getStats();
      ctx.replyWithMarkdown(reply, defaultKeyboard);
    } else {
      ctx.reply("Im sorry, I do not recognise you :(");
    }
  });

  bot.hears("Use my passes 💪", (ctx) => {
    ctx.scene.enter("useMyPassesScene");
  });

  // bot.hears("Use someone elses passes 🤔", (ctx) => {
  //   ctx.scene.enter("useSomeoneElsesPassesScene");
  // });

  bot.hears("Stats📊", async (ctx) => {
    let reply = "Here are the remaining passes:\n\n";
    reply += await getStats();

    ctx.reply(reply, defaultKeyboard);
  });

  bot.hears("Logs📝", async (ctx) => {
    ctx.scene.enter("viewLogsScene");
  });

  bot.hears("Add passes🎟️", async (ctx) => {
    ctx.scene.enter("addPassesScene");
  });

  // bot.hears(process.env.secret, async (ctx) => {
  //   await migrateData();
  //   ctx.reply("Data migrated");
  // });

  bot.launch();

  app.listen(process.env.PORT || 10000, () => {
    console.log(`Server started on port ${process.env.PORT || "10000"}`);
  });
};

setup();
