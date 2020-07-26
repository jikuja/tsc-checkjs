const ts = require('typescript')

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
      return !diag.file.fileName.match(/node_modules/)
    } else {
      return true
    }
  })
  const output = process.stdout.isTTY ? ts.formatDiagnosticsWithColorAndContext(filtered, sys) : ts.formatDiagnostics(filtered, sys)
  console.log(output)

  const exitCode = filtered.length > 0 ? 1 : 0
  console.log(`Found ${filtered.length} errors.`)
  console.log(`Filtered out ${allDiagnostics.length - filtered.length} error entries.`)
  console.log(`Process exiting with code '${exitCode}'.`)
  process.exit(exitCode)
}

const commandLine = ts.parseCommandLine(process.argv.slice(2))

if (commandLine.errors.length > 0) {
  commandLine.errors.forEach(x => console.log(x.messageText));
  process.exit(1);
}

if (commandLine.options.help) {
  console.log('Usage: TBD')
  process.exit(0)
}

const options = {
  ...(commandLine.options),

  // replicate tsc hardcoded values when using jsconfig.json file
  allowJs: true,
  maxNodeModuleJsDepth: 2,
  allowSyntheticDefaultImports: true,
  skipLibCheck: true,
  noEmit: true,

  // modes we want
  checkJs: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
}

compile(commandLine.fileNames, options)