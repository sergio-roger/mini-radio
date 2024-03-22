"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const environment_1 = require("../environment");
class FileUtils {
    static readDir(folder) {
        const directory = folder ? folder : environment_1.environment.folder;
        const dir = `${environment_1.environment.DIRECTORY}\\${directory}`;
        return fs_1.default.readdirSync(dir, { withFileTypes: true });
    }
    static isMp3(item) {
        return item.isFile() && (0, path_1.extname)(item.name) === '.mp3';
    }
    static readSong(folder) {
        const directory = folder ? folder : environment_1.environment.folder;
        const song = FileUtils.readDir(directory)
            .filter(FileUtils.isMp3)[0].name;
        return song;
    }
    static readSongs(folder) {
        const directory = folder ? folder : environment_1.environment.folder;
        const songs = FileUtils.readDir(directory)
            .filter(FileUtils.isMp3)
            .map((songItem) => songItem.name);
        return songs;
    }
    static discardFirstWord(str) {
        return str.substring(str.indexOf(' ') + 1);
    }
    static getFirstWord(str) {
        return str.split(' ')[0];
    }
    static generateRandomId() {
        const id = Math.random()
            .toString(36)
            .slice(2);
        return id;
    }
}
exports.FileUtils = FileUtils;
