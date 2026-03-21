declare module 'soundtouchjs' {
  export class PitchShifter {
    constructor(context: AudioContext, buffer: AudioBuffer, bufferSize: number, onEnd?: () => void)
    get timePlayed(): number
    get percentagePlayed(): number
    set percentagePlayed(perc: number)
    get duration(): number
    set pitch(value: number)
    set pitchSemitones(semitones: number)
    set rate(value: number)
    set tempo(value: number)
    connect(destination: AudioNode): void
    disconnect(): void
    on(eventName: string, cb: (detail: unknown) => void): void
    off(eventName?: string): void
  }
}
