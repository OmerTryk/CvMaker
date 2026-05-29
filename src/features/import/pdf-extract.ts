/**
 * pdf-extract.ts — Client-side PDF text extraction via pdfjs-dist.
 *
 * Returns the full text content of a PDF file as a single string.
 * Throws if the PDF is image-only (scanned) and yields too little text.
 */

import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const MIN_TEXT_CHARS = 80

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  const fullText = pages.join('\n\n').replace(/\s{3,}/g, '  ').trim()

  if (fullText.length < MIN_TEXT_CHARS) {
    throw new Error(
      'Bu PDF taranmış veya görüntü tabanlı görünüyor — metin çıkarılamadı. ' +
      'Lütfen metinden oluşturulan bir PDF kullanın.',
    )
  }

  return fullText
}
