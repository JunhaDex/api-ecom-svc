import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'courier' })
export class CourierEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  courierName: string;
  @Column()
  apiUrl: string;
  @Column()
  createdAt: Date;
}
