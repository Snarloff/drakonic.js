import 'reflect-metadata'

import EventEmitter from 'eventemitter3'
import ms from 'ms'

import { Repository } from 'typeorm'
import { Queue } from '../entities/queue.entity'
import { DrakonicDatabaseError } from '../exceptions/database.exception'
import { DrakonicQueueError } from '../exceptions/queue.exception'
import { MySQLDatabaseConnectionImplementation } from '../implementations/mysql-database-connection.repository'
import { PostgresDatabaseConnectionImplementation } from '../implementations/postgres-database-connection.repository'
import { SQliteDatabaseConnectionImplementation } from '../implementations/sqlite-database-connection.repository'
import { Connectors, DatabaseConfig } from '../types/database.type'
import { DrakonicAdd, DrakonicOnListener, DrakonicSettingsConstructor } from '../types/drakonic.type'
import { sleep } from '../utils/sleep'
import { BoostrapApplication } from './boostrap.application'

export class Drakonic<T extends Connectors = Connectors> extends BoostrapApplication {
  private readonly eventEmmiter: EventEmitter
  private queueRepository: Repository<Queue>
  private config: DrakonicSettingsConstructor
  private isStarted: boolean

  constructor(connector: T, databaseConfig: DatabaseConfig<T>, config?: DrakonicSettingsConstructor) {
    super(
      connector === Connectors.MYSQL
        ? new MySQLDatabaseConnectionImplementation()
        : connector === Connectors.POSTGRES
          ? new PostgresDatabaseConnectionImplementation()
          : new SQliteDatabaseConnectionImplementation(),
      databaseConfig
    )

    this.isStarted = false
    this.config = config

    this.eventEmmiter = new EventEmitter()
    this.queueRepository = this.datasource.getRepository(Queue)

    require.resolve('sqlite3')

    if (this.config && this.config.errorRetryIn) {
      setInterval(async () => {
        if (!this.isStarted) return

        const queue = await this.queueRepository.find({ where: { error: true } })

        if (queue.length === 0) return

        queue.forEach(async (job) => {
          console.log('Retrying job: ' + job.id)

          this.emit(job.topic, {
            id: job.id,
            topic: job.topic,
            job: JSON.parse(job.data),
            done: async () => {
              await this.queueRepository.delete(job.id).catch(() => {})
            },
            error: async () => await this.queueRepository.update(job.id, { error: true }).catch(() => {}),
          })

          await sleep(10)
        })
      }, this.config.errorRetryIn ?? 1000)
    }
  }

  private async initializeQueueProcess() {
    while (!this.isStarted) await sleep()

    console.log('Drakonic queue process started!')

    const queue = await this.queueRepository.find().catch((err) => {
      this.emit('error', err.message)
      throw new DrakonicQueueError(err)
    })

    if (queue.length === 0) {
      return
    }

    await Promise.all(
      queue.map(async (job) => {
        try {
          const parsedJob = JSON.parse(job.data)

          this.emit(job.topic, {
            id: job.id,
            topic: job.topic,
            job: parsedJob,
            done: async () => {
              await this.queueRepository.delete(job.id).catch(() => {})
            },
            error: async () => await this.queueRepository.update(job.id, { error: true }).catch(() => {}),
          })

          await sleep(10)
        } catch (error) {
          this.emit('error', error)
        }
      })
    )
  }

  public async add(topic: string, payload: DrakonicAdd) {
    /**
     * Wait for datasource to be initialized before proceeding
     * to prevent race conditions when adding jobs
     * to the queue
     * @param {string} topic - description of parameter
     * @param {DrakonicAdd} payload - description of parameter
     * @return {Promise<void>} a Promise representing the asynchronous operation
     */

    while (!this.isStarted) await sleep()

    if (!topic) {
      throw new DrakonicQueueError('Topic is required!')
    }

    const result = await this.queueRepository
      .save({
        data: JSON.stringify(payload.data),
        attempts: payload.attempts ? payload.attempts : null,
        retryAt: ms(payload.retryAt ? payload.retryAt : '0').toString(),
        topic,
      })
      .catch((err) => {
        this.emit('error', err.message)
        throw new DrakonicQueueError(err)
      })

    const emitPayload = {
      topic,
      id: result.id,
      job: payload.data,
      done: async () =>
        await this.queueRepository.delete(result.id).catch(() => {}) /* Ignore errors with the queue already being deleted */,
      error: async () =>
        await this.queueRepository.update(result.id, { error: true }).catch(() => {}) /* Ignore errors with the queue updated */,
    }

    this.emit(topic, emitPayload)
  }

  public on<T = unknown>(event: string, listener: DrakonicOnListener<T>): this {
    this.eventEmmiter.on(event, listener)
    return this
  }

  public emit<T = unknown>(event: string, ...args: T[]): boolean {
    return this.eventEmmiter.emit(event, ...args)
  }

  public async start() {
    if (this.isStarted) return

    await this.initializeDatasources().then(() => (this.isStarted = true))

    this.emit('start')
    this.initializeQueueProcess()
  }

  public async stop() {
    if (!this.isStarted) return

    this.emit('stop')
    await this.datasource.destroy().then(() => (this.isStarted = false))
  }

  public async restart() {
    await this.stop()
    await sleep(60)
    await this.start()
  }

  public async remove(jobId: string): Promise<void> {
    await this.queueRepository.delete(jobId).catch(() => {
      throw new DrakonicDatabaseError('Job not found')
    })
  }
}
