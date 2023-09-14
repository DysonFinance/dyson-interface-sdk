import dedent from 'dedent'
import { execa } from 'execa'
import { default as fs } from 'fs-extra'
import path from 'path'
import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

import { dependencies, peerDependencies } from './package.json'
type Entry = string[] | Record<string, string>
export default defineConfig(
  getConfig({
    entry: [
      'src/index.ts',
      'src/constants/index.ts',
      'src/actions/index.ts',
      'src/entities/index.ts',
      'src/reads/index.ts',
      'src/utils/index.ts',
    ],
    external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],

    splitting: true,
    target: 'es2021',

    dts: true
  }),
)

type GetConfig = Omit<Options, 'bundle' | 'clean' | 'format'> & {
  noExport?: string[]
}

export function getConfig({ noExport, ...options }: GetConfig): Options {
  return {
    bundle: true,
    clean: true,
    format: ['esm'],
    splitting: true,
    target: 'es2021',
    async onSuccess() {
      if (typeof options.onSuccess === 'function') await options.onSuccess()
      else if (typeof options.onSuccess === 'string') execa(options.onSuccess)

      const exports = await generateExports(options.entry!, noExport)
      await generateProxyPackages(exports)
    },
    ...options,
  }
}

type Exports = {
  [key: string]: string | { types?: string; default: string }
}

/**
 * Generate exports from entry files
 */
async function generateExports(entry: Entry, noExport?: string[]) {
  const exports: Exports = {}
  const _entry = Array.isArray(entry) ? entry : Object.values(entry)
  for (const file of _entry) {
    if (noExport?.includes(file)) continue
    const extension = path.extname(file)
    const fileWithoutExtension = file.replace(extension, '')
    const name = fileWithoutExtension.replace(/^src\//g, './').replace(/\/index$/, '')
    const distSourceFile = `${fileWithoutExtension.replace(/^src\//g, './dist/')}.js`
    const distTypesFile = `${fileWithoutExtension.replace(/^src\//g, './dist/')}.d.ts`
    exports[name] = {
      types: distTypesFile,
      default: distSourceFile,
    }
  }

  exports['./package.json'] = './package.json'

  const packageJson = await fs.readJSON('package.json')
  packageJson.exports = exports
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2) + '\n')

  return exports
}

/**
 * Generate proxy packages files for each export
 */
async function generateProxyPackages(exports: Exports) {
  const ignorePaths: string[] = []
  const files = new Set<string>()
  for (const [key, value] of Object.entries(exports)) {
    if (typeof value === 'string') continue
    if (key === '.') continue
    if (!value.default) continue
    await fs.ensureDir(key)
    const entrypoint = path.posix.relative(key, value.default)
    const fileExists = await fs.pathExists(value.default)
    if (!fileExists)
      throw new Error(`Proxy package "${key}" entrypoint "${entrypoint}" does not exist.`)

    await fs.outputFile(
      `${key}/package.json`,
      dedent`{
        "type": "module",
        "main": "${entrypoint}"
      }`,
    )
    ignorePaths.push(key.replace(/^\.\//g, ''))

    const file = key.replace(/^\.\//g, '').split('/')[0]
    if (!file || files.has(file)) continue
    files.add(`/${file}`)
  }

  files.add('/dist')
  const packageJson = await fs.readJSON('package.json')
  packageJson.files = [...files.values()]
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2) + '\n')

  if (ignorePaths.length === 0) return
  const gitignore = fs.readFileSync('.gitignore', { encoding: 'utf-8' })
  if (ignorePaths.every((name) => gitignore.includes(name))) return
  const neetToUpdates = ignorePaths.filter((name) => !gitignore.includes(name))
  fs.appendFileSync(
    '.gitignore',
    dedent`
  # Generated file. Do not edit directly.
  ${neetToUpdates.join('/**\n')}/**
  `,
  )
}
