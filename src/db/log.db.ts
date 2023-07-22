import { AppDataSource } from "../datasource";
import { Log } from "../entities/log.entity";

export default class LogDb {
  public static async log(telegram_id: string, data: string): Promise<void> {
    const repo = AppDataSource.getRepository(Log);
    await repo.insert({ telegram_id, data });
  }

  public static async getAllLogs(): Promise<Log[]> {
    const repo = AppDataSource.getRepository(Log);
    return await repo.find();
  }
}
