/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_AZURE_TRANSLATOR_TRANSLATE_ENDPOINT?: string;
  readonly VITE_AZURE_TRANSLATOR_KEY?: string;
  readonly VITE_AZURE_TRANSLATOR_REGION?: string;
  readonly VITE_AZURE_TRANSLATOR_DEPLOYMENT_NAME?: string;
  readonly VITE_AZURE_TRANSLATOR_LANGUAGES_ENDPOINT?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
