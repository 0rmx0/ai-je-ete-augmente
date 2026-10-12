import type * as PdfjsModule from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { unzipSync } from 'fflate'
import { parsePayslipText } from './PayslipParser'
import type { PayslipData, PayslipParseOptions } from './PayslipParser'

export interface PayslipFileResult extends PayslipData {
  readonly fileName: string
}

let pdfjsPromise: Promise<typeof PdfjsModule> | null = null

async function loadPdfjs(): Promise<typeof PdfjsModule> {
  if (pdfjsPromise === null) {
    pdfjsPromise = import('pdfjs-dist').then((pdfjs): typeof PdfjsModule => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()
      return pdfjs
    })
  }
  return pdfjsPromise
}

export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await loadPdfjs()
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise
  let text = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    for (const item of content.items) {
      if ('str' in item) {
        const textItem = item as TextItem
        if (textItem.str.length > 0) {
          if (textItem.hasEOL) {
            text += textItem.str + '\n'
          } else {
            text += textItem.str
            if (textItem.str.endsWith(' ')) {
              text += '\n'
            }
          }
        }
      }
    }
  }
  doc.cleanup()
  return text
}

export async function extractFilesFromZip(data: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const files = unzipSync(new Uint8Array(data))
  const pdfs = new Map<string, Uint8Array>()
  for (const [name, content] of Object.entries(files)) {
    if (name.toLowerCase().endsWith('.pdf')) {
      pdfs.set(name, content)
    }
  }
  return pdfs
}

export async function parsePayslipFiles(
  files: File[],
  options: PayslipParseOptions
): Promise<PayslipFileResult[]> {
  const results: PayslipFileResult[] = []
  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.zip')) {
      const zipEntries = await extractFilesFromZip(await file.arrayBuffer())
      for (const [name, content] of zipEntries) {
        results.push(
          await parseSinglePdf(
            name,
            content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength),
            options
          )
        )
      }
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      results.push(await parseSinglePdf(file.name, await file.arrayBuffer(), options))
    }
  }
  return results
}

async function parseSinglePdf(
  fileName: string,
  data: ArrayBuffer,
  options: PayslipParseOptions
): Promise<PayslipFileResult> {
  const text = await extractPdfText(data)
  const parsed = parsePayslipText(text, options)
  return { fileName, ...parsed }
}
