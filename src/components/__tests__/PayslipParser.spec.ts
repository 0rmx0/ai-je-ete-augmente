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

  it('extracts the base hourly rate in hourly-rate mode', () => {
    const text = [
      'Paie 03/2024',
      'Taux horaire 12,50 \u20ac',
      'Net \u00e0 payer 1 898,40 \u20ac',
      'Prime exceptionnelle 150,00 \u20ac'
    ].join('\n')
    const result = parsePayslipText(text, { incomeMode: 'hourly-rate', today })
    expect(result.date).toBe('2024-03')
    expect(result.income).toBe(12.5)
  })

  it('extracts the base hourly rate from a column-layout payslip', () => {
    const text = [
      'El\u00e9ments de paie Base Taux A d\u00e9duire A payer Charges patronales',
      'P\u00e9riode : Septembre 2026',
      'Salaire de base 151.67 16.3891 2 485.74',
      'Heures mensuelles major\u00e9es 25% 11.57 20.4864 237.03',
      'Prime de vacances 27.23',
      'Salaire brut 2 750.00',
      'Net \u00e0 payer avant imp\u00f4t sur le revenu 2 048.64'
    ].join('\n')
    const result = parsePayslipText(text, {
      incomeMode: 'hourly-rate',
      today: new Date('2026-10-12T12:00:00Z')
    })
    expect(result.date).toBe('2026-09')
    expect(result.income).toBe(16.3891)
  })

  it('returns nulls when nothing matches', () => {
    const result = parsePayslipText('facture sans montant', options)
    expect(result.date).toBeNull()
    expect(result.income).toBeNull()
  })

  it('prefers the payslip period over an earlier hire date', () => {
    const text = [
      'Bulletin de paie',
      'Date d\u2019entr\u00e9e 04/1992',
      'P\u00e9riode du 01/05/2024 au 31/05/2024',
      'Net \u00e0 payer avant imp\u00f4t 2 435,50 \u20ac'
    ].join('\n')
    const result = parsePayslipText(text, options)
    expect(result.date).toBe('2024-05')
    expect(result.income).toBe(2435.5)
  })

  it('ignores cumulated amounts on the net line', () => {
    const text = [
      'Paie 01/2024',
      'Net \u00e0 payer 2 500,00 \u20ac',
      'Cumul net \u00e0 payer 30 000,00 \u20ac'
    ].join('\n')
    const result = parsePayslipText(text, options)
    expect(result.income).toBe(2500)
  })

  it('takes the monthly amount, not the cumul column, on the same line', () => {
    const text = ['Paie 06/2024', 'Net \u00e0 payer 2 500,00 30 000,00'].join('\n')
    const result = parsePayslipText(text, options)
    expect(result.income).toBe(2500)
  })
})
