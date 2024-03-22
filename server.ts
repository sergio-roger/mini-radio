import { server as HapiServer } from "@hapi/hapi";
import StaticFilePlugin from "@hapi/inert";
import path from 'path';
import { MusicPlayer } from './engine/musicPlayer';
import { environment } from './environment';
import { routes } from "./routes/routes";

export class Server {
  
  private serverHapi; 

  constructor() {
    this.serverHapi = HapiServer({
      port: environment.PORT,
      host: environment.HOST,
      compression: false,
      routes: { files: { relativeTo: path.join(__dirname, "public") }},
    });
  }

  get server() {
    return this.serverHapi;
  }

  async start(): Promise<void> {
    try {
      await this.server.register(StaticFilePlugin);
      await this.server.register(routes);

      const  musicPlayer = new MusicPlayer();
      musicPlayer.start();
      
      await this.server.start();
      console.log(`Server running at: ${this.server.info.uri}`);
    } catch (err: any) {
      console.error(`Server errored with: ${err}`);
      console.error(err.stack);
      process.abort()
    }
  }
}