import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Extreme Performance Optimizations
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Critical vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // UI vendor chunks
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-avatar',
            '@radix-ui/react-progress'
          ],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-icons': ['lucide-react'],
          
          // Feature-based chunks
          'chunk-auth': [
            'src/pages/Auth.tsx',
            'src/contexts/AuthContext.tsx'
          ],
          'chunk-quiz': [
            'src/pages/Quiz.tsx',
            'src/pages/SoloQuiz.tsx',
            'src/pages/EnhancedQuiz.tsx'
          ],
          'chunk-social': [
            'src/pages/Social.tsx',
            'src/pages/SocialChallenges.tsx'
          ],
          'chunk-trading': [
            'src/pages/SocialTrading.tsx'
          ],
          'chunk-admin': [
            'src/pages/AdminDashboard.tsx',
            'src/pages/AdminUsers.tsx'
          ],
          'chunk-leaderboard': [
            'src/pages/Leaderboard.tsx',
            'src/components/leaderboards.tsx',
            'src/components/compact-leaderboard.tsx'
          ]
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Additional optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets < 4kb
    reportCompressedSize: false, // Faster builds
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [
      'src/components/admin',
      'src/pages/AdminDashboard.tsx'
    ]
  },
  
  // CSS optimizations
  css: {
    devSourcemap: false
  }
}));
