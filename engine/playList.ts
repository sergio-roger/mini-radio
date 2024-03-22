export class PlayList {
  
  private songsGet: string[];
  private static instanceGet: PlayList;

  private constructor() {
    this.songsGet = [];
  }

  static get instance() {
    return this.instanceGet || (this.instanceGet = new PlayList());
  }

  get songs() {
    return this.songsGet;
  }

  fill(songs: string[]): void {
    this.songsGet.push(...songs);
  }
}