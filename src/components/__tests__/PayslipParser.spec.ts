import { describe, expect, it } from 'vitest'
import { parseAmount, parsePayslipText } from '../PayslipParser'

describe('parseAmount', () => {
  it.each([
    ['2 500,00 €', 2500],
    ['2,500.00', 2500],
    ['2500.00 €', 2500],
    ['1 234 567,89', 1234567.89],
    ['abc', null]
  ])('parses "%s"', (input, expected) => {
    expect(parseAmount(input)).toBe(expected)
  })
})

describe('parsePayslipText', () => {
  const today = new Date('2025-05-15T12:00:00Z')
  const options = { incomeMode: 'net-monthly' as const, today }

  it('extracts date and net income from a french payslip', () => {
    const text = [
      'Bulletin de paie',
      'Période du 01/03/2024 au 31/03/2024',
      'Salaire brut 3 200,00 €',
      'Net à payer avant impôt 2 435,50 €'
    ].join('\n')
    const result = parsePayslipText(text, options)
    expect(result.date).toBe('2024-03')
    expect(result.income).toBe(2435.5)
  })

  it('supports month names', () => {
    const text = ['Février 2023', 'Net à payer 2 100,00'].join('\n')
    const result = parsePayslipText(text, options)
    expect(result.date).toBe('2023-02')
    expect(result.income).toBe(2100)
  })

  it('supports mm/yyyy dates', () => {
    const result = parsePayslipText('Paie 01/2022\nNet à payer 1 900,00 €', options)
    expect(result.date).toBe('2022-01')
    expect(result.income).toBe(1900)
  })

  it('extracts gross income in gross-annual mode', () => {
    const text = ['Mars 2024', 'Salaire brut 3200,00 €', 'Net à payer 2500,00 €'].join('\n')
    const result = parsePayslipText(text, { incomeMode: 'gross-annual', today })
    expect(result.income).toBe(3200)
  })

  it('returns nulls when nothing matches', () => {
    const result = parsePayslipText('facture sans montant', options)
    expect(result.date).toBeNull()
    expect(result.income).toBeNull()
  })
})
