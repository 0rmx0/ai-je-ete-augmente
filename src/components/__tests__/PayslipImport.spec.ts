import { describe, expect, it, vi } from 'vitest'

const items = [
  { str: 'Bulletin de paie', transform: [1, 0, 0, 1, 50, 791.8898], width: 60 },
  { str: "Date d'entree: 04/1992", transform: [1, 0, 0, 1, 50, 771.8898], width: 60 },
  { str: 'Periode du 01/05/2024 au 31/05/2024', transform: [1, 0, 0, 1, 50, 751.8898], width: 60 },
  { str: 'Salaire brut', transform: [1, 0, 0, 1, 50, 731.8898], width: 51.13 },
  { str: ' ', transform: [1, 0, 0, 1, 101.13, 731.8898], width: 2.78 },
  { str: '3 200,00', transform: [1, 0, 0, 1, 506.3556, 731.8898], width: 40 },
  { str: 'Net a payer avant impot', transform: [1, 0, 0, 1, 50, 711.8898], width: 106.16 },
  { str: ' ', transform: [1, 0, 0, 1, 156.16, 711.8898], width: 2.78 },
  { str: '2 435,50', transform: [1, 0, 0, 1, 406.3556, 711.8898], width: 40 },
  { str: ' ', transform: [1, 0, 0, 1, 445.2756, 711.8898], width: 2.78 },
  { str: '29 226,00', transform: [1, 0, 0, 1, 500.7956, 711.8898], width: 45 },
  { str: 'Cumul net a payer', transform: [1, 0, 0, 1, 50, 691.8898], width: 81.7 },
  { str: '14 613,00', transform: [1, 0, 0, 1, 500.7956, 691.8898], width: 45 },
  { str: 'Net a payer (ttc)', transform: [1, 0, 0, 1, 50, 641.8898], width: 71.69 },
  { str: '1 948,40', transform: [1, 0, 0, 1, 506.3556, 641.8898], width: 40 }
].map((item) => ({ ...item, hasEOL: false }))

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () => Promise.resolve({ getTextContent: () => Promise.resolve({ items }) }),
      cleanup: () => undefined
    })
  })
}))

const { extractPdfText } = await import('..//PayslipImport')
const { parsePayslipText } = await import('..//PayslipParser')

describe('real pdf end-to-end with actual extracted items', () => {
  it('reconstructs lines and parses the payslip', async () => {
    const text = await extractPdfText(new ArrayBuffer(0))
    console.log(JSON.stringify(text))
    const parsed = parsePayslipText(text, {
      incomeMode: 'net-monthly',
      today: new Date('2025-05-15T12:00:00Z')
    })
    expect(parsed).toEqual({ date: '2024-05', income: 2435.5 })
  })
})
