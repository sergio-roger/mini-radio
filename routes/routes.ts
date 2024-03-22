import { Server } from "@hapi/hapi";
import { Tail } from "../engine/tail";
import { PlayList } from "../engine/playList";
import { FileUtils } from "../utils/utils";

export interface AppHapi {
  sinkId: string;
}

export const routes = {
  name: "streamServer",
  register: async (server: Server) => {
    server.route({
      method: "GET",
      path: "/",
      handler: (_, h) => h.file("index.html"),
    });

    server.route({
      method: "GET",
      path: "/start",
      handler: (request, h) => {
        const tail = Tail.instance;
        tail.startStreaming();

        return  {
          success: true,
          message: "Stream iniciado"
        }
      },
    });

    // server.route({
    //   method: "GET",
    //   path: "/start{filename}",
    //   handler: {
    //     file: (req) => req.params.filename,
    //   },
    // });

    server.route({
      method: "GET",
      path: "/stream",
      handler: (request, h) => {
        const tail = Tail.instance;
        const { id, responseSink } = tail.makeResponseSink();
        (request.app as AppHapi).sinkId = id;
        return h.response(responseSink).type("audio/mpeg");
      },
      options: {
        ext: {
          onPreResponse: {
            method: (request, h) => {
              request.events.once("disconnect", () => {
                const tail = Tail.instance;
                const id = (request.app as AppHapi).sinkId;
                tail.removeResponseSink(id);
              });
              return h.continue;
            },
          },
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/stream/{folder}',
      handler: (request, h) => {
        const folder = (request.params.folder as string).trim();
        const playList = PlayList.instance;
        const tail = Tail.instance;

        playList.clear();
        playList.fill(FileUtils.readSongs(folder));

        tail.clearSongs();
        tail.folder = folder;

        playList.songs.forEach(song => {
          tail.addSongs(song);
        });

        console.table(tail.songs);

        return {
          success: true,
          folder: folder
        }
      }
    })
  },
};