"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayer = void 0;
const utils_1 = require("../utils/utils");
const playList_1 = require("./playList");
const tail_1 = require("./tail");
class MusicPlayer {
    constructor() {
        this.playList = playList_1.PlayList.instance;
        this.tail = tail_1.Tail.instance;
    }
    start() {
        this.playList.fill(utils_1.FileUtils.readSongs());
        this.playList.songs.forEach(song => {
            this.tail.addSongs(song);
        });
        this.tail.init();
    }
}
exports.MusicPlayer = MusicPlayer;
