import axios from 'axios'
import * as fs from 'fs'
import * as zlib from 'zlib'
import { convertCaCsvToJson } from './importer/CaParser'
import { convertEurostatTsvToJson } from './importer/EurostatParser'
import { convertUkCsvToJson } from './importer/UkParser'

async function download(url: string, outputFilePath: string, compressed: boolean): Promise<void> {
  console.log('Downloading ' + url, 'Saving to ' + outputFilePath)
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  })

  let pipeline = response.data
  if (compressed) {
    pipeline = pipeline.pipe(zlib.createGunzip())
  }

  const writeStream = fs.createWriteStream(outputFilePath)
  pipeline = pipeline.pipe(writeStream)

  return new Promise((resolve, reject) => {
    pipeline.on('error', (error: Error) => {
      writeStream.close()
      reject(error)
    })

    pipeline.on('finish', () => {
      resolve()
    })
  })
}

async function main() {
  const outputDirectory = './src/assets/inflations/'

  // Download EU data
  const eurostatTsvFilePath = './eurostat-prc_hicp_minr.tsv'
  try {
    if (!fs.existsSync(eurostatTsvFilePath)) {
      await download(
        'https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/prc_hicp_minr?format=TSV&compressed=true',
        eurostatTsvFilePath,
        true
      )
    }
    await convertEurostatTsvToJson(eurostatTsvFilePath, outputDirectory)
    console.log('Eurostat data saved')
  } catch (error) {
    console.error('An error happened while downloading eurostat data:', error)
  } finally {
    if (fs.existsSync(eurostatTsvFilePath)) {
      fs.unlinkSync(eurostatTsvFilePath)
    }
  }

  // Download UK data
  const ukCsvFilePath = './uk-series-110723.csv'
  try {
    if (!fs.existsSync(ukCsvFilePath)) {
      await download(
        'https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/d7oe/mm23',
        ukCsvFilePath,
        false
      )
    }
    await convertUkCsvToJson(ukCsvFilePath, outputDirectory)
    console.log('UK data saved')
  } catch (error) {
    console.error('An error happened while downloading uk data:', error)
  } finally {
    if (fs.existsSync(ukCsvFilePath)) {
      fs.unlinkSync(ukCsvFilePath)
    }
  }

  // Download CA data
  const caCsvFilePath = './ca-18100006-fra.csv.zip'
  try {
    if (!fs.existsSync(caCsvFilePath)) {
      await download(
        'https://www150.statcan.gc.ca/n1/tbl/csv/18100006-fra.zip',
        caCsvFilePath,
        false
      )
    }
    convertCaCsvToJson(caCsvFilePath, outputDirectory)
    console.log('CA data saved')
  } catch (error) {
    console.error('An error happened while downloading ca data:', error)
  } finally {
    if (fs.existsSync(caCsvFilePath)) {
      fs.unlinkSync(caCsvFilePath)
    }
  }
}

main()
