import { describe, expect, it } from 'vitest'
import { PdfDocument, markdownToPdfLines, toWinAnsi, wrapPdfLines } from '@/components/PdfDocument'

describe('toWinAnsi', () => {
  it('keeps latin-1 characters', () => {
    expect(toWinAnsi('éàç')).toBe('éàç')
  })

  it('maps non-latin characters', () => {
    expect(toWinAnsi('−')).toBe('-')
    expect(toWinAnsi('2 620')).not.toContain(' ')
  })

  it('replaces unsupported characters', () => {
    expect(toWinAnsi('😀')).toBe('?')
  })
})

describe('markdownToPdfLines', () => {
  it('converts headings to bold lines', () => {
    const lines = markdownToPdfLines('# Titre\n\n## Section\n\n### Sous-section\n\ntexte')
    expect(lines[0]).toEqual({ text: 'Titre', style: 'bold', size: 18 })
    expect(lines[2]).toEqual({ text: 'Section', style: 'bold', size: 14 })
    expect(lines[4]).toEqual({ text: 'Sous-section', style: 'bold', size: 12 })
    expect(lines[lines.length - 1]).toEqual({ text: 'texte', style: 'normal', size: 10 })
  })

  it('keeps json blocks in mono style', () => {
    const lines = markdownToPdfLines('before\n```json\n{"a":1}\n```\nafter')
    const mono = lines.filter((line) => line.style === 'mono')
    expect(mono.length).toBe(1)
    expect(mono[0].text).toBe('{"a":1}')
  })
})

describe('wrapPdfLines', () => {
  it('wraps long lines', () => {
    const wrapped = wrapPdfLines([{ text: 'a'.repeat(300), style: 'normal', size: 10 }])
    expect(wrapped.length).toBeGreaterThan(1)
    wrapped.forEach((line) => expect(line.text.length).toBeLessThanOrEqual(130))
  })
})

describe('PdfDocument', () => {
  it('produces a valid pdf header and eof', async () => {
    const pdf = new PdfDocument()
    pdf.addLine('Rapport', 'bold', 18)
    pdf.addLine('Contenu de test avec accents: éàü')
    const bytes = pdf.finish()
    const content = new TextDecoder('latin1').decode(bytes)
    expect(content.startsWith('%PDF-')).toBe(true)
    expect(content.trimEnd().endsWith('%%EOF')).toBe(true)
    expect(content).toContain('/Type /Catalog')
    expect(content).toContain('éàü')
  })

  it('paginates when there are many lines', () => {
    const pdf = new PdfDocument()
    for (let i = 0; i < 500; i++) {
      pdf.addLine('ligne ' + i)
    }
    const content = new TextDecoder('latin1').decode(pdf.finish())
    const pageCount = (content.match(/\/Type \/Page[^s]/g) ?? []).length
    expect(pageCount).toBeGreaterThan(5)
  })
})
