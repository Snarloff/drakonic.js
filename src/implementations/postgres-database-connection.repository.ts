import { DataSource } from 'typeorm'
import { DatabaseConnectionRepository } from '../repositories/database-connection.repository'
import { Connectors, DatabaseConfig } from '../types/database.type'
import { Queue } from '../entities/queue.entity'

export class PostgresDatabaseConnectionImplementation implements DatabaseConnectionRepository<Connectors.POSTGRES> {
  public connectDatabaseWithConnector(connector: DatabaseConfig<Connectors.POSTGRES>): DataSource {
    const postgresDataSource = new DataSource({
      type: 'postgres',
      logging: connector.debug || false,
      host: connector.host || 'localhost',
      port: connector.port || 5432,
      database: connector.host || 'drakonic-queue',
      username: connector.user,
      password: connector.password || undefined,
      entities: [Queue],
      synchronize: true,
    })

    return postgresDataSource
  }
}
