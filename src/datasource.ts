import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Log } from "./entities/log.entity";
import { User } from "./entities/user.entity";

config();

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   port: parseInt(process.env.DB_PORT),
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   entities: [User, Log],
//   migrations: ["src/migrations/**/*{.ts,.js}"],
// });
