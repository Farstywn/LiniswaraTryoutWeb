const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");
const next = require("next");

// Muat file .env secara otomatis saat berjalan lewat custom server (mis. cPanel Phusion Passenger)
try {
  const { loadEnvConfig } = require("@next/env");
  loadEnvConfig(__dirname);
} catch {
  // Abaikan jika @next/env tidak tersedia; gunakan environment dari cPanel/sistem
}

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, dir: path.resolve(__dirname), hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Liniswara Tryout Web siap pada http://${hostname}:${port}`);
    });
});
