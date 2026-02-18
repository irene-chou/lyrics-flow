/* eslint-disable @typescript-eslint/no-explicit-any */
interface PieSocketChannel {
  listen(event: string, callback: (data: any) => void): void
  publish(event: string, data: any): void
}

interface PieSocketOptions {
  clusterId: string
  apiKey: string
  notifySelf?: number
}

declare class PieSocketClass {
  constructor(options: PieSocketOptions)
  subscribe(channel: string): Promise<PieSocketChannel>
}

interface PieSocketModule {
  default: new (options: PieSocketOptions) => PieSocketClass
}

interface Window {
  PieSocket: PieSocketModule
}
