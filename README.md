# ai-je-ete-augmente

A small single page app to show the difference between your usual salary raises, and the reality with your income adjusted with the inflation rates.

## Planned feature

* [x] Use data from eurostats to enable other country than france
* [x] Add new Raise calculation mode with % increae instead of flat value
* [x] Add indice point calculation mode
* [x] Add custom inflation import
* [x] Export / import salaries as JSON or CSV
* [x] Simulate a future raise (what-if projection with extrapolated inflation)

## How to contribute?

If you can, feel free to open a pull request. Else, you can open an issue.

## Development

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Continuous Integration checks

```sh
npm run format && npm run lint && npm run type-check && npm run check:i18n && npm run test:unit -- --run
```
