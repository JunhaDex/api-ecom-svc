import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'log_tx_export' })
export class LogTxExportEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  adminId: number;
  @Column()
  lastTxId: number;
  @Column()
  createdAt: Date;
}
