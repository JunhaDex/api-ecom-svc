import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  userId: string;
  @Column()
  pwd: string;
  @Column()
  branchName: string;
  @Column()
  branchManager: string;
  @Column()
  branchContact: string;
  @Column()
  status: number;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @ManyToOne(() => UserGroupEntity, (userGroup) => userGroup.users)
  userGroup: UserGroupEntity | null;
}
