const ts = require('typescript')
const glob = require('glob')
const debug = require('debug')('tsc-checkjs')

const IGNORED_DIRECTORIES = [
  'node_modules'
]

const IGNORED_DIRECTORIES_GLOB = IGNORED_DIRECTORIES.map((x) => x + '/**')

/**
 * @param {readonly string[]} fileNames
 * @param {ts.CompilerOptions} options
 */
function compile (fileNames, options) {
  const program = ts.createProgram(fileNames, options)
  const emitResult = program.emit()

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)

  const sys = {
    getCurrentDirectory: function () { return ts.sys.getCurrentDirectory() },
    getNewLine: function () { return ts.sys.newLine },
    // @ts-ignore
    getCanonicalFileName: ts.createGetCanonicalFileName(ts.sys.useCaseSensitiveFileNames)
  }

  // content must be filtered or function rewrite
  const filtered = allDiagnostics.filter((diag) => {
    if (diag.file) {
      // TODO: more ignores from command line
      return !diag.file.fileName.match(/node_modules/)
    } else {
      return true
    }
  })

  /* istanbul ignore next */
  const pretty = options.pretty ? true : (process.stdout.isTTY ? true : false)
  const output = pretty ? ts.formatDiagnosticsWithColorAndContext(filtered, sys) : ts.formatDiagnostics(filtered, sys)
  console.log(output)

  const exitCode = filtered.length > 0 ? 1 : 0
  console.log(`Found ${filtered.length} errors.`)
  console.log(`Filtered out ${allDiagnostics.length - filtered.length} error entries.`)
  console.log(`Process exiting with code '${exitCode}'.`)
  process.exit(exitCode)
}

/**
 * @param {string[]} files
 */
function globFiles (files) {
  debug('files', files)
  const globbedfiles =  files.reduce((acc, f) => {
    return acc.concat(glob.sync(f, { nonull: true, ignore: IGNORED_DIRECTORIES_GLOB }))
  }, [])
  debug('globbedfiles', globbedfiles)

  return Array.from(new Set(globbedfiles))
}

ts.optionDeclarations.push(
  {
    name: "skipGlob",
    //shortName: "v",
    type: "boolean",
  }
)

const commandLine = ts.parseCommandLine(process.argv.slice(2))
debug('commandLine', commandLine)

if (commandLine.errors.length > 0) {
  commandLine.errors.forEach(x => console.log(x.messageText))
  process.exit(1)
}

if (commandLine.options.help) {
  console.log('Usage: TBD')
  process.exit(0)
}

const options = {
  maxNodeModuleJsDepth: 2, // (1) and overrideable by user
 
  // Using <ES6 or ES5 makes tsc to emit e.g. TS2569 and TS1056
  target: ts.ScriptTarget.ES2018,  // sane overrideable default

  // include command line settings
  ...(commandLine.options),

  // (1) replicate tsc hardcoded values when using `-p jsconfig.json`
  allowJs: true,
  allowSyntheticDefaultImports: true,
  skipLibCheck: true,
  noEmit: true,

  // modes we want
  checkJs: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs
}

compile(options.skipGlob ? commandLine.fileNames : globFiles(commandLine.fileNames), options)
