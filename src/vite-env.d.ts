/// <reference types="vite/client" />

declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
  // pdfjs-dist web worker — imported via ?url for GlobalWorkerOptions.workerSrc
}

declare module 'mammoth/mammoth.browser' {
  // Browser build of mammoth (no Node deps). Only the subset we use is typed.
  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer },
  ): Promise<{ value: string; messages: unknown[] }>
  const _default: { extractRawText: typeof extractRawText }
  export default _default
}
