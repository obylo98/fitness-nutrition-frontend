import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://fitness-nutrition-backend.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log('Proxying request to:', req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log('Received response for:', req.url);
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
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
