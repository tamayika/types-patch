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