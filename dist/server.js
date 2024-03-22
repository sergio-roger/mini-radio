"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const hapi_1 = require("@hapi/hapi");
const inert_1 = __importDefault(require("@hapi/inert"));
const path_1 = __importDefault(require("path"));
const musicPlayer_1 = require("./engine/musicPlayer");
const environment_1 = require("./environment");
const routes_1 = require("./routes/routes");
class Server {
    constructor() {
        this.serverHapi = (0, hapi_1.server)({
            port: environment_1.environment.PORT,
            host: environment_1.environment.HOST,
            compression: false,
            routes: { files: { relativeTo: path_1.default.join(__dirname, "public") } },
        });
    }
    get server() {
        return this.serverHapi;
    }
    async start() {
        try {
            await this.server.register(inert_1.default);
            await this.server.register(routes_1.routes);
            const musicPlayer = new musicPlayer_1.MusicPlayer();
            musicPlayer.start();
            await this.server.start();
            console.log(`Server running at: ${this.server.info.uri}`);
        }
        catch (err) {
            console.error(`Server errored with: ${err}`);
            console.error(err.stack);
            process.abort();
        }
    }
}
exports.Server = Server;
