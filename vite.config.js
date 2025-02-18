import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
          });
        },
      },
    },
    cors: true,
    hmr: {
      overlay: true,
      port: 24678,
      host: 'localhost',
      protocol: 'ws',
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
