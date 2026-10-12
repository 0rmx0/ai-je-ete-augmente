const pageWidth = 595.28
const pageHeight = 841.89
const margin = 40

const winAnsiSpecials: Record<string, string> = {
  '\u20AC': '\u0080',
  '\u201A': '\u201A',
  '\u0192': '\u0192',
  '\u201E': '\u201E',
  '\u2026': '\u2026',
  '\u2020': '\u2020',
  '\u2021': '\u2021',
  '\u02C6': '\u02C6',
  '\u2030': '\u2030',
  '\u0160': '\u0160',
  '\u2039': '\u2039',
  '\u0152': '\u0152',
  '\u017D': '\u017D',
  '\u2018': '\u2018',
  '\u2019': '\u2019',
  '\u201C': '\u201C',
  '\u201D': '\u201D',
  '\u2022': '\u2022',
  '\u2013': '\u2013',
  '\u2014': '\u2014',
  '\u02DC': '\u02DC',
  '\u2122': '\u2122',
  '\u0161': '\u0161',
  '\u203A': '\u203A',
  '\u0153': '\u0153',
  '\u017E': '\u017E',
  '\u0178': '\u0178',
  '\u2212': '-',
  '\u202F': ' ',
  '\u00A0': ' ',
  '\u2011': '-',
  '\u2212\u00a0': '- '
}

export function toWinAnsi(text: string): string {
  let result = ''
  for (const char of text) {
    if (char in winAnsiSpecials) {
      result += winAnsiSpecials[char]
    } else if (char.charCodeAt(0) <= 255) {
      result += char
    } else {
      result += '?'
    }
  }
  return result
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export type PdfFontStyle = 'normal' | 'bold' | 'mono'

export interface PdfLine {
  text: string
  style: PdfFontStyle
  size: number
}

const styleFont: Record<PdfFontStyle, string> = {
  normal: 'F1',
  bold: 'F2',
  mono: 'F3'
}

function maxCharsFor(size: number, style: PdfFontStyle): number {
  const charWidth = style === 'mono' ? size * 0.6 : size * 0.5
  return Math.max(20, Math.floor((pageWidth - 2 * margin) / charWidth))
}

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) {
    return [text]
  }
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > maxChars) {
    const chunk = remaining.substring(0, maxChars)
    const lastSpace = chunk.lastIndexOf(' ')
    const cut = lastSpace > maxChars * 0.6 ? lastSpace : maxChars
    chunks.push(remaining.substring(0, cut))
    remaining = remaining.substring(cut).replace(/^ /, '')
  }
  if (remaining.length > 0) {
    chunks.push(remaining)
  }
  return chunks
}

export class PdfDocument {
  private readonly lines: PdfLine[] = []

  addLine(text: string, style: PdfFontStyle = 'normal', size: number = 10): void {
    this.lines.push({ text: toWinAnsi(text), style, size })
  }

  addLines(lines: PdfLine[]): void {
    lines.forEach((line: PdfLine): void => this.addLine(line.text, line.style, line.size))
  }

  private buildPages(): string[][] {
    const pages: string[][] = []
    let currentPage: string[] = []
    let y = pageHeight - margin
    for (const line of this.lines) {
      const lineHeight = line.size * 1.4
      if (y - lineHeight < margin) {
        pages.push(currentPage)
        currentPage = []
        y = pageHeight - margin
      }
      const font = styleFont[line.style]
      currentPage.push(
        'BT /' +
          font +
          ' ' +
          line.size +
          ' Tf 1 0 0 1 ' +
          margin +
          ' ' +
          (y - lineHeight).toFixed(2) +
          ' Tm (' +
          escapePdfText(line.text) +
          ') Tj ET'
      )
      y -= lineHeight
    }
    if (currentPage.length > 0 || pages.length === 0) {
      pages.push(currentPage)
    }
    return pages
  }

  finish(): Uint8Array {
    const pages = this.buildPages()
    const objects: string[] = []
    const firstPageObject = 6
    objects.push('<< /Type /Catalog /Pages 2 0 R >>')
    objects.push(
      '<< /Type /Pages /Kids [' +
        Array.from(
          { length: pages.length },
          (_, index: number): string => `${firstPageObject + index * 2} 0 R`
        ).join(' ') +
        `] /Count ${pages.length} >>`
    )
    objects.push(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
    )
    objects.push(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
    )
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>')
    pages.forEach((pageLines: string[], index: number) => {
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${
          firstPageObject + index * 2 + 1
        } 0 R >>`
      )
      const streamContent = pageLines.join('\n')
      objects.push(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`)
    })

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = []
    objects.forEach((content: string, index: number) => {
      offsets.push(pdf.length)
      pdf += `${index + 1} 0 obj\n${content}\nendobj\n`
    })
    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    offsets.forEach((offset: number) => {
      pdf += offset.toString().padStart(10, '0') + ' 00000 n \n'
    })
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

    const bytes = new Uint8Array(pdf.length)
    for (let i = 0; i < pdf.length; i++) {
      bytes[i] = pdf.charCodeAt(i) & 0xff
    }
    return bytes
  }
}

export function markdownToPdfLines(content: string): PdfLine[] {
  const result: PdfLine[] = []
  let inJsonBlock = false
  for (const rawLine of content.split('\n')) {
    if (rawLine.startsWith('```')) {
      inJsonBlock = !inJsonBlock
      result.push({ text: '', style: 'normal', size: 6 })
      continue
    }
    if (inJsonBlock) {
      result.push({ text: rawLine, style: 'mono', size: 7 })
      continue
    }
    if (rawLine.startsWith('### ')) {
      result.push({ text: rawLine.substring(4), style: 'bold', size: 12 })
    } else if (rawLine.startsWith('## ')) {
      result.push({ text: rawLine.substring(3), style: 'bold', size: 14 })
    } else if (rawLine.startsWith('# ')) {
      result.push({ text: rawLine.substring(2), style: 'bold', size: 18 })
    } else {
      result.push({ text: rawLine, style: 'normal', size: 10 })
    }
  }
  return result
}

export function wrapPdfLines(lines: PdfLine[]): PdfLine[] {
  const result: PdfLine[] = []
  for (const line of lines) {
    for (const chunk of wrapText(line.text, maxCharsFor(line.size, line.style))) {
      result.push({ text: chunk, style: line.style, size: line.size })
    }
  }
  return result
}
