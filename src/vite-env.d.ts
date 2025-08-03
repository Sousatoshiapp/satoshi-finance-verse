/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_PERSONA_TEMPLATE_ID?: string
  readonly VITE_PERSONA_ENVIRONMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
