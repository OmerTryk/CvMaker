/**
 * docx-extract.ts — Client-side DOCX text extraction via mammoth.
 *
 * Returns the raw text content of a .docx file as a single string.
 * Throws if the file yields too little text (corrupt / empty / not a real docx).
 */

const MIN_TEXT_CHARS = 80

export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()

  // Lazy-load mammoth (~large) only when a DOCX is actually imported, so it
  // stays out of the editor's initial bundle. Browser build avoids Node deps.
  const { default: mammoth } = await import('mammoth/mammoth.browser')

  let result: { value: string }
  try {
    result = await mammoth.extractRawText({ arrayBuffer })
  } catch {
    throw new Error(
      'Word dosyası okunamadı. Dosyanın bozuk olmadığından ve gerçek bir .docx ' +
      'olduğundan emin ol (eski .doc formatı desteklenmez).',
    )
  }

  const fullText = result.value.replace(/[ \t]{3,}/g, '  ').trim()

  if (fullText.length < MIN_TEXT_CHARS) {
    throw new Error(
      'Bu Word dosyasından metin çıkarılamadı — boş veya görüntü tabanlı görünüyor. ' +
      'Metin içeren bir .docx kullan.',
    )
  }

  return fullText
}
