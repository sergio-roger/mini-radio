import { Server } from "@hapi/hapi";
import { Tail } from "../engine/tail";

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

    // server.route({
    //   method: "GET",
    //   path: "/{filename}",
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
  },
};