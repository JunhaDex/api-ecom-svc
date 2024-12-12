import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'admin' })
export class AdminUserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  adminId: string;
  @Column()
  pwd: string;
  @Column()
  name: string;
  @Column()
  createdAt: Date;
}
