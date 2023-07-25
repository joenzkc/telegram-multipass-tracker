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

  public static async addPasses(telegramId: string, numPasses: number) {
    const user = await this.getUser(telegramId);
    if (user) {
      user.passes_remaining += numPasses;
      await AppDataSource.getRepository(User).save(user);
      const now = moment().format("DD/MM/YYYY").toString();
      await LogDb.log(
        telegramId,
        `Added ${numPasses.toString()} pass(es) on ${now} (${
          user.passes_remaining
        } remaining)`
      );
      return user.passes_remaining;
    } else {
      console.log("User not found");
    }
  }

  public static async getUserByName(name: string) {
    return await AppDataSource.getRepository(User).findOne({
      where: {
        name: name,
      },
    });
  }

  public static async getUsers() {
    return await AppDataSource.getRepository(User).find();
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

  public static async usePasses(
    telegramId: string,
    numPassesUsed: number,
    lending?: boolean,
    borrower_id?: string
  ) {
    const user = await this.getUser(telegramId);
    if (user) {
      user.passes_remaining -= numPassesUsed;
      if (user.passes_remaining < 0) {
        if (lending) {
          throw new Error(
            `${user.name} does not have enough passes to lend you!`
          );
        } else {
          throw new Error(
            "Not enough passes :( Please borrow from someone else!"
          );
        }
      }
      await AppDataSource.getRepository(User).save(user);
      const now = moment().format("DD/MM/YYYY").toString();
      if (lending) {
        const borrower = await this.getUser(borrower_id);
        await LogDb.log(
          borrower.telegram_id,
          `${
            user.name
          } lent you ${numPassesUsed.toString()} pass(es) on ${now}!`
        );
        await LogDb.log(
          user.telegram_id,
          `Lent ${
            borrower.name
          } ${numPassesUsed.toString()} pass(es) on ${now}!`
        );
      } else {
        await LogDb.log(
          telegramId,
          `Used ${numPassesUsed.toString()} pass(es) on ${now} (${
            user.passes_remaining
          } remaining)`
        );
      }
      return user.passes_remaining;
    } else {
      console.log("User not found");
    }
  }
}
