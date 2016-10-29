import * as ts from "typescript";
import { StatementWalker } from "./StatementWalker";

export class VariableStatementWalker extends StatementWalker {
    public getSyntaxKind() {
        return ts.SyntaxKind.VariableStatement;
    }

    public walk(statements: ts.NodeArray<ts.Statement>, patchStatement: ts.Statement, shouldRemove: boolean) {
        const patchVariableStatement = <ts.VariableStatement>patchStatement;
        if (shouldRemove) {
            const index = statements.findIndex(statement => {
                if (statement.kind !== ts.SyntaxKind.VariableStatement) {
                    return false;
                }
                const tempVariableStatement = <ts.VariableStatement>statement;
                if (!!tempVariableStatement.decorators !== !!patchVariableStatement.decorators) {
                    return false;
                }
                if (tempVariableStatement.decorators && patchVariableStatement.decorators &&
                    tempVariableStatement.decorators.length !== patchVariableStatement.decorators.length) {
                    return false;
                }
                if (tempVariableStatement.declarationList.declarations.length !==
                    patchVariableStatement.declarationList.declarations.length) {
                    return false;
                }
                for (let i = 0; i < tempVariableStatement.declarationList.declarations.length; i++) {
                    const tempDeclaration = tempVariableStatement.declarationList.declarations[i];
                    const patchDeclaration = patchVariableStatement.declarationList.declarations[i];
                    if (tempDeclaration.name.kind !== patchDeclaration.name.kind) {
                        return false;
                    }
                    switch (tempDeclaration.name.kind) {
                        case ts.SyntaxKind.Identifier:
                            if ((<ts.Identifier>tempDeclaration.name).text !==
                                (<ts.Identifier>patchDeclaration.name).text) {
                                return false;
                            }
                            break;
                        case ts.SyntaxKind.BindingElement:
                            // TODO
                            break;
                        default:
                            break;
                    }
                }
                return true;
            });
            if (index < 0) {
                return;
            }
            statements.splice(index, 1);
        } else {
            this.addStatement(statements, patchStatement);
        }
    }
}
