export enum Connectors {
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  SQLITE = 'sqlite',
}

export type DatabaseConfig<T extends Connectors> = T extends Connectors.MYSQL | Connectors.POSTGRES
  ? {
      host?: string
      port?: number
      password?: string
      path?: never
      user: string
      database: string
      debug?: boolean
    }
  : T extends Connectors.SQLITE
    ? {
        path: string
        debug?: boolean
      }
    : never
