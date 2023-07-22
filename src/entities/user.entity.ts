import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegram_id: string;

  @Column()
  name: string;

  @Column()
  passes_remaining: number;
}
