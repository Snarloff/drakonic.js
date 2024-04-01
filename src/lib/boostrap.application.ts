import { DataSource } from 'typeorm'
import { DrakonicDatabaseError } from '../exceptions/database.exception'
import { DatabaseConnectionRepository } from '../repositories/database-connection.repository'
import { Connectors, DatabaseConfig } from '../types/database.type'

export class BoostrapApplication {
  protected datasource: DataSource

  constructor(
    private readonly databaseConnectionRepository: DatabaseConnectionRepository<Connectors>,
    private readonly databaseConfig: DatabaseConfig<Connectors>
  ) {
    this.datasource = this.databaseConnectionRepository.connectDatabaseWithConnector(this.databaseConfig)
  }

  protected async initializeDatasources() {
    return await this.datasource
      .initialize()
      .then(() => {
        this.databaseConfig.debug && console.log('Datasource initialized')
      })
      .catch((err: Error) => {
        throw new DrakonicDatabaseError('Error initializing datasource: ' + err)
      })
  }
}
