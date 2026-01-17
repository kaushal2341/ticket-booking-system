import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { TicketTier } from './Ticket.js';

@Entity('ticket_holds')
export class TicketHold {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  tier!: TicketTier;

  @Column({ type: 'int' })
  quantity!: number;

  @CreateDateColumn()
  expiresAt!: Date;

  @Index('IDX_ticket_hold_user_tier')
  @Column({ type: 'varchar', length: 100 })
  userIdTier!: string; // Composite index field
}
