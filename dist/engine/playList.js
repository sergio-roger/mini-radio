"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayList = void 0;
class PlayList {
    constructor() {
        this.songsGet = [];
    }
    static get instance() {
        return this.instanceGet || (this.instanceGet = new PlayList());
    }
    get songs() {
        return this.songsGet;
    }
    fill(songs) {
        this.songsGet.push(...songs);
    }
    clear() {
        this.songsGet = [];
    }
}
exports.PlayList = PlayList;
