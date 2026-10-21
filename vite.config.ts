import react from "@vitejs/plugin-react";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {defineConfig} from "vite";
import mkcert from 'vite-plugin-mkcert'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [mkcert(
        {
            savePath: "./certs",
            keyFileName: "localhost-key.pem",
            certFileName: "localhost.pem",
        }
    ), react()],
    server: {
        ws: {
            protocol: "wss"
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src/client"),
            "#": path.resolve(__dirname, "./src/server"),
            "~": path.resolve(__dirname, "./src/shared"),
        },
    },
});
