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
  }),
)

type GetConfig = Omit<Options, 'bundle' | 'clean' | 'dts' | 'format'> & {
  noExport?: string[]
}

export function getConfig({ noExport, ...options }: GetConfig): Options {
  return {
    bundle: true,
    clean: true,
    dts: true,
    format: ['esm'],
    splitting: true,
    target: 'es2021',
    async onSuccess() {
      if (typeof options.onSuccess === 'function') await options.onSuccess()
      else if (typeof options.onSuccess === 'string') execa(options.onSuccess)

      await generateExports(options.entry!, noExport)
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
