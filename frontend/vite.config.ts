import { defineConfig, loadEnv, } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({command, mode}) => {
    const env = loadEnv(mode, process.cwd(), "VITE_APP");
    const envWithProcessPrefix = {
      "process.env": `${JSON.stringify(env)}`,
    };
    // depending on your application, base can also be "/"
    return {base: '',
    plugins: [react(), viteTsconfigPaths(),
      viteStaticCopy({
        targets: [
          {
            src: './src/mocks/browser.js', 
            dest: './', 
          },
          {
            src: './src/mocks/handlers.js',
            dest: './',
          },
        ],
      }),
    ],
    server: {    
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000  
        port: 3000, 
    },
    define: envWithProcessPrefix,
}
})
