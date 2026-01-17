import { Entity, PrimaryColumn, Column, VersionColumn } from 'typeorm';

export type TicketTier = 'VIP' | 'FrontRow' | 'GA';

@Entity('tickets')
export class Ticket {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  tier!: TicketTier;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int' })
  available!: number;

  @Column({ type: 'int' })
  total!: number;

  @Column({ type: 'int', default: 0 })
  booked!: number;

  @VersionColumn()
  version!: number;
}
