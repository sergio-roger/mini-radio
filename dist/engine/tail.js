"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tail = void 0;
const ffprobe_1 = require("@dropb/ffprobe");
const fs_1 = require("fs");
const process_1 = require("process");
const stream_1 = require("stream");
const throttle_1 = __importDefault(require("throttle"));
const environment_1 = require("../environment");
const utils_1 = require("../utils/utils");
class Tail {
    constructor() {
        this.currentSongGet = '';
        this.streamGet = new stream_1.EventEmitter();
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
    init() {
        this.currentSongGet = utils_1.FileUtils.readSong();
    }
    async startStreaming() {
        await this.playLoop();
    }
    async playLoop() {
        this.currentSongGet = this.songsGet.length
            ? this.removeFromTail(true)
            : this.currentSongGet;
        const bitRate = await this.getBitRate(this.currentSongGet);
        const dir = `${(0, process_1.cwd)()}\\${environment_1.environment.DIRECTORY}\\${this.currentSongGet}`;
        console.log("Reproducciendo", this.currentSongGet);
        const songReadable = (0, fs_1.createReadStream)(dir);
        const throttleTransformable = new throttle_1.default(bitRate / 8);
        throttleTransformable.on("data", (chunk) => {
            this.broadcastToEverySink(chunk);
        });
        throttleTransformable.on("end", () => {
            this.playLoop();
        });
        this.stream.emit("play", this.currentSongGet);
        songReadable.pipe(throttleTransformable);
    }
    removeFromTail(fromTop = false) {
        const index = fromTop ? 1 : this.songsGet.length - 1;
        const music = this.songs.shift();
        console.log("--------------------------------- Lista ---------------------------------");
        console.table(this.songs);
        return music !== null && music !== void 0 ? music : '';
    }
    async getBitRate(song) {
        const dir = `${(0, process_1.cwd)()}\\${environment_1.environment.DIRECTORY}\\${song}`;
        try {
            const { format } = await (0, ffprobe_1.ffprobe)((0, fs_1.createReadStream)(dir));
            return parseInt(format.bit_rate);
        }
        catch (err) {
            return 128000; // reasonable default
        }
    }
    broadcastToEverySink(chunk) {
        for (const [, sink] of this.sinksGet) {
            sink.write(chunk);
        }
    }
    makeResponseSink() {
        const id = utils_1.FileUtils.generateRandomId();
        const responseSink = new stream_1.PassThrough();
        this.sinksGet.set(id, responseSink);
        return { id, responseSink };
    }
    removeResponseSink(id) {
        this.sinksGet.delete(id);
    }
    addSongs(song) {
        this.songsGet.push(song);
    }
}
exports.Tail = Tail;
