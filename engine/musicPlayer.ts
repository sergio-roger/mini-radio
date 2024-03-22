import { FileUtils } from "../utils/utils";
import { PlayList } from "./playList";
import { Tail } from "./tail";

export class MusicPlayer {

  private playList: PlayList;
  private tail: Tail; 

  constructor() {
    this.playList = PlayList.instance;
    this.tail = Tail.instance;
  }

  start(): void {
    this.playList.fill(FileUtils.readSongs());

    this.playList.songs.forEach(song => {
      this.tail.addSongs(song);
    });

    this.tail.init();
  }
}