
import express from 'express';
import { createServer } from "http";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux";
import { join } from "path";
import bodyParser from "body-parser";
import wisp from "wisp-server-node";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicPath = join(__dirname, "public");

const app = express();
const server = createServer();

app.use(express.static(publicPath));

app.use("/backendsystem/", express.static(uvPath)); // this is uv
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

app.get("/", (_req, res) => {
    res.sendFile(join(publicPath, "index.html"));
});

app.use((_req, res) => {
    res.status(404).sendFile(join(publicPath, "404.html"));
});
server.on("request", (req, res) => {
    if (!req.url.endsWith("/wisp/")) {
        app(req, res);
    }
});

server.on("upgrade", (req, socket2, head) => {
    if (req.url.endsWith("/wisp/")) {
        wisp.routeRequest(req, socket2, head);
    } else {
        socket2.end();
    }
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

server.listen(port, () => {
    console.log("Server is listening on port", port);
});



process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close();
    process.exit(0);
}
