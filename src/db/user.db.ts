import moment from "moment";
import { AppDataSource } from "../datasource";
import { User } from "../entities/user.entity";
import LogDb from "./log.db";

export default class UserDb {
  private logDb = new LogDb();

  public static async getUser(telegramId: string) {
    return await AppDataSource.getRepository(User).findOne({
      where: {
        telegram_id: telegramId,
      },
    });
  }

  public async getStats() {
    let data = "";
    // sort by passes_remaining

    (
      await AppDataSource.getRepository(User).find({
        order: { passes_remaining: "DESC" },
      })
    ).forEach((user) => {
      data += `${user.name}: ${user.passes_remaining}\n`;
    });

    return data;
  }

  public static async usePasses(telegramId: string, numPassesUsed: number) {
    const user = await this.getUser(telegramId);
    if (user) {
      user.passes_remaining -= numPassesUsed;
      if (user.passes_remaining < 0) {
        throw new Error(
          "Not enough passes :( Please borrow from someone else!"
        );
      }
      await AppDataSource.getRepository(User).save(user);
      const now = moment().format("YYYY-MM-DD HH:mm:ss").toString();
      await LogDb.log(
        telegramId,
        `${
          user.name
        } used ${numPassesUsed.toString()} pass(es) at ${now} and has ${
          user.passes_remaining
        } remaining!`
      );
      return user.passes_remaining;
    } else {
      console.log("User not found");
    }
  }
}
