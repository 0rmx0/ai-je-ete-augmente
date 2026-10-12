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

interface TextPart {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly text: string
}

function partsToText(parts: TextPart[]): string {
  if (parts.length === 0) {
    return ''
  }
  const sortedParts = [...parts].sort(
    (p1: TextPart, p2: TextPart): number => p2.y - p1.y || p1.x - p2.x
  )
  const lines: Array<Array<TextPart>> = []
  let currentLine: Array<TextPart> = [sortedParts[0]]
  let currentY = sortedParts[0].y
  for (const part of sortedParts.slice(1)) {
    if (Math.abs(part.y - currentY) <= 2) {
      currentLine.push(part)
    } else {
      lines.push(currentLine)
      currentLine = [part]
      currentY = part.y
    }
  }
  lines.push(currentLine)
  return lines
    .map((line: Array<TextPart>): string => {
      let text = ''
      let previousPart: TextPart | null = null
      for (const part of line) {
        if (
          previousPart !== null &&
          !previousPart.text.endsWith(' ') &&
          !part.text.startsWith(' ') &&
          part.x - (previousPart.x + previousPart.width) > 1
        ) {
          text += ' '
        }
        text += part.text
        previousPart = part
      }
      return text
    })
    .join('\n')
}

export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await loadPdfjs()
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise
  const pageTexts: Array<string> = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const parts: Array<TextPart> = []
    for (const item of content.items) {
      if ('str' in item) {
        const textItem = item as TextItem
        if (textItem.str.length > 0) {
          parts.push({
            x: textItem.transform[4],
            y: textItem.transform[5],
            width: textItem.width ?? 0,
            text: textItem.str
          })
        }
      }
    }
    pageTexts.push(partsToText(parts))
  }
  doc.cleanup()
  return pageTexts.join('\n')
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
