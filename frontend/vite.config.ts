import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({command, mode}) => {
    const env = loadEnv(mode, process.cwd());
    // depending on your application, base can also be "/"
    return {base: '',
    plugins: [react(), viteTsconfigPaths()],
    server: {    
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000  
        port: 3000, 
    },
    define: {
        'import.meta.env.VITE_BACKEND_DOMAIN': JSON.stringify(env.VITE_BACKEND_DOMAIN),
    },
}
})
