import * as ts from "typescript";
import { StatementWalker } from "./StatementWalker";

export class ExportAssignmentWalker extends StatementWalker {
    public getSyntaxKind() {
        return ts.SyntaxKind.ExportAssignment;
    }

    public walk(statements: ts.NodeArray<ts.Statement>, patchStatement: ts.Statement, shouldRemove: boolean) {
        if (shouldRemove) {
            const index = statements.findIndex(statement => {
                if (statement.kind !== ts.SyntaxKind.ExportAssignment) {
                    return false;
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
