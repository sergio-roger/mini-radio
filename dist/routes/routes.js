"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const tail_1 = require("../engine/tail");
const playList_1 = require("../engine/playList");
const utils_1 = require("../utils/utils");
exports.routes = {
    name: "streamServer",
    register: async (server) => {
        server.route({
            method: "GET",
            path: "/",
            handler: (_, h) => h.file("index.html"),
        });
        server.route({
            method: "GET",
            path: "/start",
            handler: (request, h) => {
                const tail = tail_1.Tail.instance;
                tail.startStreaming();
                return {
                    success: true,
                    message: "Stream iniciado"
                };
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
        server.route({
            method: 'GET',
            path: '/stream/{folder}',
            handler: (request, h) => {
                const folder = request.params.folder.trim();
                const playList = playList_1.PlayList.instance;
                const tail = tail_1.Tail.instance;
                playList.clear();
                playList.fill(utils_1.FileUtils.readSongs(folder));
                tail.clearSongs();
                tail.folder = folder;
                playList.songs.forEach(song => {
                    tail.addSongs(song);
                });
                console.table(tail.songs);
                return {
                    success: true,
                    folder: folder
                };
            }
        });
    },
};
