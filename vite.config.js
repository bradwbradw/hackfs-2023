import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
//import { nodePolyfills } from 'vite-plugin-node-polyfills'
//import GlobalsPolyfills from "@esbuild-plugins/node-globals-polyfill";
/*
var polyfills = nodePolyfills({
  // To exclude specific polyfills, add them to this list.
  exclude: [
    //   'fs', // Excludes the polyfill for `fs` and `node:fs`.
  ],
  // Whether to polyfill specific globals.
  globals: {
    Buffer: true, // can also be 'build', 'dev', or false
    //   global: true,
    //   process: true,
  },
  // Whether to polyfill `node:` protocol imports.
  //  protocolImports: true,
});
*/

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  //forward urls to /api to the server
  server: {
    https: true,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },

})
