declare module 'soundtouchjs' {
  export class PitchShifter {
    constructor(context: AudioContext, source: AudioNode, bufferSize: number)
    get pitch(): number
    set pitch(value: number)
    get tempo(): number
    set tempo(value: number)
    connect(destination: AudioNode): void
    disconnect(): void
  }
}
