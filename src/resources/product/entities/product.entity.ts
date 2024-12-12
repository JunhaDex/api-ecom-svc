import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'product' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  productName: string;
  @Column()
  description: string;
  @Column('simple-json')
  imageUris: string;
  @Column()
  productPrice: number;
  @Column()
  status: number;
  @Column()
  productDescription: string;
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
}
