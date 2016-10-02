import * as ts from "typescript";

export class Walker {
    public source: ts.SourceFile;
    public patch: ts.SourceFile;

    public constructor(source: ts.SourceFile, patch: ts.SourceFile) {
        this.source = source;
        this.patch = patch;
    }

    public applyPatch() {
        this.sourceFileWalker(this.source, this.patch);
    }

    private sourceFileWalker(source: ts.SourceFile, patch: ts.SourceFile) {
        for (const statement of source.statements) {
            this.statementWalker(statement);
        }
    }

    private statementWalker(statement: ts.Statement) {
        switch (statement.kind) {
            case ts.SyntaxKind.ModuleDeclaration:
                break;
            default:
                break;
        }
    }

    private moduleDeclarationWalker(moduleDeclaration: ts.ModuleDeclaration) {
        if (!moduleDeclaration.body) {
            return;
        }
        switch (moduleDeclaration.body.kind) {
            case ts.SyntaxKind.ModuleBlock:
                this.moduleBlockWalker(<ts.ModuleBlock> moduleDeclaration.body);
                break;
            case ts.SyntaxKind.ModuleDeclaration:
                this.moduleDeclarationWalker(<ts.ModuleDeclaration> moduleDeclaration.body);
                break;
            default:
                break;
        }
    }

    private moduleBlockWalker(moduleBlock: ts.ModuleBlock) {
        for (const statement of moduleBlock.statements) {
            this.statementWalker(statement);
        }
    }
}
