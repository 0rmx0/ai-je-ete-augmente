import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function flattenKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? flattenKeys(child, prefix + key + '.')
      : [prefix + key]
  )
}

function load(locale) {
  return JSON.parse(readFileSync(join(root, 'src/assets/translations', locale + '.json'), 'utf8'))
}

// Keys intentionally present only in French (AboutView renders locale-specific link lists).
const FR_ONLY_ALLOWLIST = new Set(['about.goal.p3.4', 'about.goal.p3.5'])

const frKeys = new Set(flattenKeys(load('fr')))
const enKeys = new Set(flattenKeys(load('en')))

const enOnly = [...enKeys].filter((key) => !frKeys.has(key)).sort()
const frOnly = [...frKeys].filter((key) => !enKeys.has(key) && !FR_ONLY_ALLOWLIST.has(key)).sort()

let failed = false
if (enOnly.length > 0) {
  console.error('Keys missing in fr.json:', enOnly.join(', '))
  failed = true
}
if (frOnly.length > 0) {
  console.error('Keys missing in en.json (and not allowlisted):', frOnly.join(', '))
  failed = true
}
if (failed) {
  process.exit(1)
}
console.log('Translation keys are in sync (fr: ' + frKeys.size + ', en: ' + enKeys.size + ').')
