import { DataSource } from 'typeorm'
import { Connectors, DatabaseConfig } from '../types/database.type'

export abstract class DatabaseConnectionRepository<T extends Connectors> {
  abstract connectDatabaseWithConnector(connector: DatabaseConfig<T>): DataSource
}
