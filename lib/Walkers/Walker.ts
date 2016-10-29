import * as ts from "typescript";
import { Scanner } from "../Scanner";
import { StatementWalker } from "./StatementWalker";
import { ExportAssignmentWalker } from "./ExportAssignmentWalker";
import { VariableStatementWalker } from "./VariableStatementWalker";
import { ModuleDeclarationWalker } from "./ModuleDeclarationWalker";

export class Walker {
    public source: ts.SourceFile;
    public patch: ts.SourceFile;
    public scanner: Scanner;

    protected statementWalkers: Map<ts.SyntaxKind, StatementWalker>;

    public constructor(source: ts.SourceFile, patch: ts.SourceFile, scanner: Scanner) {
        this.source = source;
        this.patch = patch;
        this.scanner = scanner;

        this.statementWalkers = new Map<ts.SyntaxKind, StatementWalker>();
        this.addStatementWalker(new ExportAssignmentWalker(this));
        this.addStatementWalker(new VariableStatementWalker(this));
        this.addStatementWalker(new ModuleDeclarationWalker(this));
    }

    public apply() {
        this.sourceFileWalker(this.source, this.patch);
    }

    public statementWalker(statements: ts.NodeArray<ts.Statement>, patchStatement: ts.Statement) {
        const shouldRemove = this.shouldRemove(patchStatement.getStart(this.patch));
        const walker = this.statementWalkers.get(patchStatement.kind);
        if (!walker) {
            return;
        }
        walker.walk(statements, patchStatement, shouldRemove);
    }

    protected shouldRemove(pos: number) {
        const lineAndCharacter = this.patch.getLineAndCharacterOfPosition(pos);
        for (const position of this.scanner.removePositions) {
            const removeLineAndCharacter = this.patch.getLineAndCharacterOfPosition(position);
            if (lineAndCharacter.line - 1 === removeLineAndCharacter.line) {
                return true;
            }
        }
        for (const range of this.scanner.removeRanges) {
            if (range[0] <= pos && pos <= range[1]) {
                return true;
            }
        }
        return false;
    }

    private sourceFileWalker(source: ts.SourceFile, patch: ts.SourceFile) {
        for (const statement of patch.statements) {
            this.statementWalker(source.statements, statement);
        }
    }

    private addStatementWalker(statementWalker: StatementWalker) {
        this.statementWalkers.set(statementWalker.getSyntaxKind(), statementWalker);
    }
}
