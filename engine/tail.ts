import { ffprobe } from "@dropb/ffprobe";
import { createReadStream } from "fs";
import { cwd } from "process";
import { EventEmitter, PassThrough } from "stream";
import Throttle from "throttle";
import { environment } from "../environment";
import { FileUtils } from "../utils/utils";

export class Tail {
  private streamGet: EventEmitter;
  private currentSongGet: string = '';
  private songsGet: string[];
  private sinksGet: Map<string, any>;

  private static instanceGet: Tail;

  private constructor() {
    this.streamGet = new EventEmitter();
    this.sinksGet = new Map();
    this.songsGet = [];
  }

  static get instance() {
    return this.instanceGet || (this.instanceGet = new Tail());
  }

  get stream() {
    return this.streamGet;
  }

  get currentSong() {
    return this.currentSongGet;
  }

  get sinks() {
    return this.sinksGet;
  }

  get songs() {
    return this.songsGet;
  }

  init(): void {
    this.currentSongGet = FileUtils.readSong();
  }

  async startStreaming() {
    await this.playLoop();
  }

  private async playLoop() {
    this.currentSongGet = this.songsGet.length
    ? this.removeFromTail(true)
    : this.currentSongGet;

    const bitRate = await this.getBitRate(this.currentSongGet);
    const dir = `${cwd()}\\${environment.DIRECTORY}\\${this.currentSongGet}`;
    console.log("Reproducciendo", this.currentSongGet);

    const songReadable = createReadStream(dir);
    const throttleTransformable = new Throttle(bitRate / 8);
    throttleTransformable.on("data", (chunk) =>{
      this.broadcastToEverySink(chunk);
    });

    throttleTransformable.on("end", () => {
      this.playLoop();
    });

    this.stream.emit("play", this.currentSongGet);
    songReadable.pipe(throttleTransformable);
  }

  private removeFromTail(fromTop: boolean = false) {
    const index = fromTop ? 1 : this.songsGet.length - 1;
    const music = this.songs.shift();
    console.log("--------------------------------- Lista ---------------------------------");
    console.table(this.songs);
    return music ?? '';
  }

  private async getBitRate(song: string) {
    const dir = `${cwd()}\\${environment.DIRECTORY}\\${song}`;
    
    try {
      const { format } = await ffprobe(createReadStream(dir));
      return parseInt(format.bit_rate);
    } catch (err) {
      return 128000; // reasonable default
    }
  }

  private broadcastToEverySink(chunk: any) {
    for (const [, sink] of this.sinksGet) {
      sink.write(chunk);
    }
  }

  makeResponseSink() {
    const id = FileUtils.generateRandomId();
    const responseSink = new PassThrough();
    this.sinksGet.set(id, responseSink);
    return { id, responseSink };
  }

  removeResponseSink(id: string) {
    this.sinksGet.delete(id);
  }

  addSongs(song: string) {
    this.songsGet.push(song);
  }
}