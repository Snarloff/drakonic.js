import { DataSource } from 'typeorm'
import { Queue } from '../entities/queue.entity'
import { DatabaseConnectionRepository } from '../repositories/database-connection.repository'
import { Connectors, DatabaseConfig } from '../types/database.type'

export class SQliteDatabaseConnectionImplementation implements DatabaseConnectionRepository<Connectors.SQLITE> {
  public connectDatabaseWithConnector(connector: DatabaseConfig<Connectors.SQLITE>): DataSource {
    const sqliteDataSource = new DataSource({
      type: 'sqlite',
      logging: connector.debug || false,
      database: connector.path,
      entities: [Queue],
      synchronize: true,
    })

    return sqliteDataSource
  }
}
