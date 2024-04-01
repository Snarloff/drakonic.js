import { DataSource } from 'typeorm'
import { Queue } from '../entities/queue.entity'
import { DatabaseConnectionRepository } from '../repositories/database-connection.repository'
import { Connectors, DatabaseConfig } from '../types/database.type'

export class MySQLDatabaseConnectionImplementation implements DatabaseConnectionRepository<Connectors.MYSQL> {
  public connectDatabaseWithConnector(connector: DatabaseConfig<Connectors.MYSQL>): DataSource {
    const mySQLDataSource = new DataSource({
      type: 'mysql',
      logging: connector.debug || false,
      host: connector.host || 'localhost',
      port: connector.port || 3306,
      database: connector.host || 'drakonic-queue',
      username: connector.user,
      password: connector.password || undefined,
      entities: [Queue],
      synchronize: true,
    })

    return mySQLDataSource
  }
}
