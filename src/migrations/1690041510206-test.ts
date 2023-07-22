import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1690041510206 implements MigrationInterface {
  name = "Test1690041510206";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log" ("id" SERIAL NOT NULL, "telegram_id" character varying NOT NULL, "data" character varying NOT NULL, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "telegram_id" character varying NOT NULL, "name" character varying NOT NULL, "passes_remaining" integer NOT NULL, CONSTRAINT "UQ_c1ed111fba8a34b812d11f42352" UNIQUE ("telegram_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(`INSERT INTO "user" (telegram_id, name, passes_remaining)
        VALUES ('Gabwky', 'Gabriel', 45);
        `);
    await queryRunner.query(`INSERT INTO "user" (telegram_id, name, passes_remaining)
        VALUES ('joenzzzzz', 'Joenz', 45);
        `);
    await queryRunner.query(`INSERT INTO "user" (telegram_id, name, passes_remaining)
        VALUES ('charlxm', 'Charmaine', 10)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "log"`);
  }
}
