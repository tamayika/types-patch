import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

export function createSourceFile(fileName: string) {
    const filePath = path.join("dts", fileName);
    const dts = fs.readFileSync(filePath);
    return ts.createSourceFile(filePath, dts.toString(),
        ts.ScriptTarget.ES6, false, ts.ScriptKind.TS);
}

export function createSourceFileByDts(dts: string) {
    return ts.createSourceFile("", dts.toString(),
        ts.ScriptTarget.ES6, false, ts.ScriptKind.TS);
}

export function createScanner(fileName: string) {
    const filePath = path.join("dts", fileName);
    const dts = fs.readFileSync(filePath);
    return ts.createScanner(ts.ScriptTarget.ES6, false, ts.LanguageVariant.Standard, dts.toString());
}

export function createScannerByDts(dts: string) {
    return ts.createScanner(ts.ScriptTarget.ES6, false, ts.LanguageVariant.Standard, dts.toString());
}

export function sourceStatementsToString(source: ts.SourceFile) {
    let ret = "";
    for (const statement of source.statements) {
        ret += statement.getFullText(source);
    }
    return ret;
}

export function addStatement(
    source: ts.SourceFile, patch: ts.SourceFile,
    statements: ts.NodeArray<ts.Statement>, statement: ts.Statement) {
    const start = source.end;
    const length = statement.end - statement.pos;
    const text = statement.getFullText(patch);
    const span = ts.createTextSpan(start, 0);
    const range = ts.createTextChangeRange(span, source.getText().length + text.length);
    source = source.update(text, range);
    statements.push(<ts.Statement>ts.createNode(ts.SyntaxKind.ExportAssignment, start, length));
    return source;
}
