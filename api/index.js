import Server from "./configs/server.js";

const server = new Server();

// Exporta la app como handler para Vercel
export default function handler(req, res) {
    server.app(req, res);
}