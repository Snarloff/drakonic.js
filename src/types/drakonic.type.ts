import { Queue } from '../entities/queue.entity'

export type DrakonicAdd = Pick<Queue, 'attempts' | 'data' | 'retryAt'>

type DrakonicOnListenerMethods = {
  done(): void
  error(): void
}

export type DrakonicOnListener<T> = (
  ...args: Array<
    {
      topic: string
      id: string
      job: T
    } & DrakonicOnListenerMethods
  >
) => void

export type DrakonicSettingsConstructor = {
  errorRetryIn?: number
}
