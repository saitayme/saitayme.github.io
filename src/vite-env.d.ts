/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string;
}
 
declare interface ImportMeta {
  readonly env: ImportMetaEnv;
} 