import fs from 'fs';
import { extname } from 'path';
import { environment } from '../environment';

export class FileUtils {

  static readDir(folder: string): fs.Dirent[] {
    const directory = folder ? folder : environment.folder;
    const dir = `${environment.DIRECTORY}\\${directory}`;
    return fs.readdirSync(dir, { withFileTypes: true });
  }

  static isMp3(item: fs.Dirent): boolean {
    return item.isFile() && extname(item.name) === '.mp3';
  }

  static readSong(folder: string): string {
    const directory = folder ? folder : environment.folder;
    const song = FileUtils.readDir(directory)
      .filter(FileUtils.isMp3)[0].name;

    return song;
  }

  static readSongs(folder?: string): string[] {
    const directory = folder ? folder : environment.folder;
    const songs = FileUtils.readDir(directory)
      .filter(FileUtils.isMp3)
      .map((songItem) => songItem.name);

    return songs;
  }

  static discardFirstWord(str: string): string {
    return str.substring(str.indexOf(' ') + 1);
  }

  static getFirstWord(str: string): string {
    return str.split(' ')[0];
  }

  static generateRandomId(): string {
    const id = Math.random()
      .toString(36)
      .slice(2);

    return id;
  }
}