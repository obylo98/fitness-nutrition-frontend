import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: '/',
  server: {
    port: 5173,
    cors: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com",
        changeOrigin: true,
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Proxying request to:", req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received response for:", req.url);
          });
        },
      },
    },
    hmr: {
      overlay: true,
      port: 24678,
      host: "localhost",
      protocol: "ws",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com"),
  },
});
