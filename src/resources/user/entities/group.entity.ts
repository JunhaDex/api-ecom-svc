import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { ProductEntity } from '@/resources/product/entities/product.entity';

@Entity({ name: 'user_group' })
export class UserGroupEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  groupName: string;
  @Column()
  description: string;
  @Column()
  createdAt: Date;
  @OneToMany(() => UserEntity, (user) => user.userGroup)
  users: UserEntity[];

  @ManyToMany(() => ProductEntity)
  @JoinTable({
    name: 'user_group_product', // junction table name
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  products: ProductEntity[];
}
