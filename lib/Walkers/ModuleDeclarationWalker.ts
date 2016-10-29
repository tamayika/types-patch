import * as ts from "typescript";
import { StatementWalker } from "./StatementWalker";

export class ModuleDeclarationWalker extends StatementWalker {
    public getSyntaxKind() {
        return ts.SyntaxKind.ModuleDeclaration;
    }

    public walk(statements: ts.NodeArray<ts.Statement>, patchStatement: ts.Statement, shouldRemove: boolean) {
        const patchModuleDeclaration = <ts.ModuleDeclaration>patchStatement;
        if (shouldRemove) {
            const index = statements.findIndex(statement => {
                if (statement.kind !== ts.SyntaxKind.ModuleDeclaration) {
                    return false;
                }
                const tempModuleDeclaration = <ts.ModuleDeclaration>statement;
                return tempModuleDeclaration.name.text === patchModuleDeclaration.name.text;
            });
            if (index < 0) {
                return;
            }
            statements.splice(index, 1);
        } else {
            const sourceModuleDeclaration = <ts.ModuleDeclaration>statements.find(statement => {
                if (statement.kind !== ts.SyntaxKind.ModuleDeclaration) {
                    return false;
                }
                const tempModuleDeclaration = <ts.ModuleDeclaration>statement;
                return tempModuleDeclaration.name === patchModuleDeclaration.name;
            });
            if (sourceModuleDeclaration != null) {
                this.moduleDeclarationWalker(sourceModuleDeclaration, patchModuleDeclaration);
            } else {
                this.addStatement(statements, patchStatement);
            }
        }
    }

    private moduleDeclarationWalker(
        sourceModuleDeclaration: ts.ModuleDeclaration,
        patchModuleDeclaration: ts.ModuleDeclaration) {
        if (!patchModuleDeclaration.body) {
            return;
        }
        switch (patchModuleDeclaration.body.kind) {
            case ts.SyntaxKind.ModuleBlock:
                this.moduleBlockWalker(
                    <ts.ModuleBlock>sourceModuleDeclaration.body,
                    <ts.ModuleBlock>patchModuleDeclaration.body);
                break;
            default:
                break;
        }
    }

    private moduleBlockWalker(sourceModuleBlock: ts.ModuleBlock, patchModuleBlock: ts.ModuleBlock) {
        for (const statement of patchModuleBlock.statements) {
            this.parentWalker.statementWalker(sourceModuleBlock.statements, statement);
        }
    }
}
