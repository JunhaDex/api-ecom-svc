import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';

@Entity({ name: 'product' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  productName: string;
  @Column()
  description: string;
  @Column('simple-json')
  imageUrls: string[];
  @Column()
  productPrice: number;
  @Column()
  status: number;
  @Column()
  createdAt: Date;
}

@Entity({ name: 'user_group_product' })
@Index(['userGroupId', 'productId'], { unique: true })
export class UserGroupProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @PrimaryColumn({ name: 'group_id' })
  userGroupId: number;
  @PrimaryColumn()
  productId: number;
  @Column()
  createdAt: Date;
  @ManyToOne(() => UserGroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  userGroup: UserGroupEntity;
  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
