import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notice' })
export class NoticeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
}
