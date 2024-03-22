"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const tail_1 = require("../engine/tail");
exports.routes = {
    name: "streamServer",
    register: async (server) => {
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
                const tail = tail_1.Tail.instance;
                const { id, responseSink } = tail.makeResponseSink();
                request.app.sinkId = id;
                return h.response(responseSink).type("audio/mpeg");
            },
            options: {
                ext: {
                    onPreResponse: {
                        method: (request, h) => {
                            request.events.once("disconnect", () => {
                                const tail = tail_1.Tail.instance;
                                const id = request.app.sinkId;
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
