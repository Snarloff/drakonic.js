import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('queue')
export class Queue {
  @PrimaryGeneratedColumn('uuid')
  readonly id?: number

  @Column({ type: 'text', default: null })
  public topic: string

  @Column({ type: 'text' })
  public data: any

  @Column({ type: 'int', default: 0 })
  public attempts: number

  @Column({ type: 'datetime', default: 0 })
  public alreadyAttempts?: number

  @Column({ type: 'text', name: 'retry_at', default: null, nullable: true })
  public retryAt?: string

  @Column({ type: 'boolean', default: false })
  public error?: boolean

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt?: Date

  @UpdateDateColumn({ name: 'updated_at' })
  readonly updatedAt?: Date
}
