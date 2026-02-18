interface PieSocketChannel {
  listen(event: string, callback: (data: unknown) => void): void
  publish(event: string, data: unknown): void
}

interface PieSocketOptions {
  clusterId: string
  apiKey: string
  notifySelf?: number
}

declare class PieSocketClass {
  constructor(options: PieSocketOptions)
  subscribe(channel: string): Promise<PieSocketChannel>
  unsubscribe(channel: string): void
}

interface PieSocketModule {
  default: new (options: PieSocketOptions) => PieSocketClass
}

interface Window {
  PieSocket: PieSocketModule
}
