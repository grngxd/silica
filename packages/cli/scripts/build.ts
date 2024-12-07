import { prebuild } from '+scripts/prebuild';
import path from 'path';
import ts from 'typescript';

prebuild();

const tsConfigPath = path.resolve(__dirname, '../tsconfig.json');
const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

if (configFile.error) {
  throw new Error(ts.formatDiagnosticsWithColorAndContext([configFile.error], {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? 
      (fileName: string) => fileName : 
      (fileName: string) => fileName.toLowerCase(),
    getNewLine: () => ts.sys.newLine,
  }));
}

const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(tsConfigPath)
);

const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
const emitResult = program.emit();

const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

if (allDiagnostics.length > 0) {
  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });
  process.exit(1);
} else {
  console.log('Build Complete.');
}