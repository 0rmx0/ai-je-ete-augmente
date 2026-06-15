import * as fs from 'fs'
import * as readline from 'readline'
import type { CountryInflationRates } from '../components/InflationRates'
import type { countryCode } from '../components/CountryCodes'
import { countryCodes } from '../components/CountryCodes'

const eurostatIndicatorForInflationRate = 'M,RCH_M,TOTAL,'

export function convertEurostatTsvToJson(
  inputFilePath: string,
  outputDirectory: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let dates = [] as string[]

    const lineReader = readline.createInterface({
      input: fs.createReadStream(inputFilePath),
      crlfDelay: Infinity
    })
    lineReader.once('line', (line: string) => {
      const datePattern: RegExp = /(\d{4})-(\d{2})/
      dates = line.split('\t').flatMap((date: string) => {
        if (!datePattern.test(date)) {
          return []
        }

        return [date.trim()]
      })
    })
    lineReader.on('line', (line: string) => {
      const jsonData: CountryInflationRates = {}

      const columns = line.split('\t')
      if (!columns[0].startsWith(eurostatIndicatorForInflationRate)) {
        return
      }

      const countryCode = columns[0]
        .substring(eurostatIndicatorForInflationRate.length)
        .toLowerCase() as countryCode
      if (!countryCodes.includes(countryCode)) {
        return
      }

      jsonData[countryCode.toLowerCase()] = Object.fromEntries(
        columns.slice(1).flatMap((key, index) => {
          const inflationRate = parseFloat(key)
          if (isNaN(inflationRate)) {
            return []
          }
          return [[dates[index], inflationRate]]
        })
      )

      fs.writeFileSync(outputDirectory + countryCode + '.json', JSON.stringify(jsonData))
    })
    lineReader.on('close', () => {
      resolve()
    })
    lineReader.on('error', (error: Error) => {
      reject(error)
    })
  })
}
