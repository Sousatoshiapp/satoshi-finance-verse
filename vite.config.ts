// FASE 1: Ultra Vite Config - Configuração extrema de performance
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';
// import { getViteBundleConfig } from './src/utils/bundle-splitter';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envConfig = {
    development: {
      VITE_SUPABASE_URL: "https://uabdmohhzsertxfishoh.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmRtb2hoenNlcnR4ZmlzaG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDEyNTIsImV4cCI6MjA2NzA3NzI1Mn0.Dbmi7MvETErWGrvC-lJ_5gIf2lGRxWTKIoAm9N9U9KE",
      VITE_APP_URL: "http://localhost:8080",
      VITE_API_URL: "https://uabdmohhzsertxfishoh.supabase.co",
      VITE_PERSONA_ENVIRONMENT_ID: "env_wi6mxC93nGVwXz8AtNkt4oCwegMj",
      VITE_PERSONA_TEMPLATE_ID: "vtmpl_48WRTb1itWfoT1jmXSHLtpuLoUC5"
    },
    staging: {
      VITE_SUPABASE_URL: "https://uabdmohhzsertxfishoh.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmRtb2hoenNlcnR4ZmlzaG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDEyNTIsImV4cCI6MjA2NzA3NzI1Mn0.Dbmi7MvETErWGrvC-lJ_5gIf2lGRxWTKIoAm9N9U9KE",
      VITE_APP_URL: "https://https://app.sousatoshi.com.br",
      VITE_API_URL: "https://uabdmohhzsertxfishoh.supabase.co",
      VITE_PERSONA_ENVIRONMENT_ID: "env_wi6mxC93nGVwXz8AtNkt4oCwegMj",
      VITE_PERSONA_TEMPLATE_ID: "vtmpl_48WRTb1itWfoT1jmXSHLtpuLoUC5"
    },
    production: {
      VITE_SUPABASE_URL: "https://uabdmohhzsertxfishoh.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmRtb2hoenNlcnR4ZmlzaG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDEyNTIsImV4cCI6MjA2NzA3NzI1Mn0.Dbmi7MvETErWGrvC-lJ_5gIf2lGRxWTKIoAm9N9U9KE",
      VITE_APP_URL: "https://app.sousatoshi.com.br",
      VITE_API_URL: "https://uabdmohhzsertxfishoh.supabase.co",
      VITE_PERSONA_ENVIRONMENT_ID: "env_wi6mxC93nGVwXz8AtNkt4oCwegMj",
      VITE_PERSONA_TEMPLATE_ID: "vtmpl_48WRTb1itWfoT1jmXSHLtpuLoUC5"
    }
  };

  return {
    define: {
      ...Object.entries(envConfig[mode as keyof typeof envConfig] || envConfig.development).reduce((acc, [key, value]) => {
        acc[`import.meta.env.${key}`] = JSON.stringify(value);
        return acc;
      }, {} as Record<string, string>)
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false // Disable error overlay for better performance
      },
      preTransformRequests: false // Improve startup time
    },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && viteCompression({ algorithm: 'brotliCompress' }),
    mode === 'production' && viteCompression({ algorithm: 'gzip' })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // ULTRA Performance Build Configuration
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    
    // Ultra-optimized bundle config inline
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    },
    
    // Extreme optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // Inline smaller assets
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500, // Smaller chunks
    
    // Aggressive minification
    cssMinify: 'esbuild',
    modulePreload: {
      polyfill: false // Remove for better performance
    }
  },
  
  // ULTRA Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'framer-motion'
    ],
    exclude: [
      'src/components/admin',
      'src/pages/Admin*',
      'src/utils/web-workers'
    ],
    // Aggressive pre-bundling
    force: true
  },
  
  // ULTRA CSS optimizations
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        charset: false
      }
    }
  }
  };
});
