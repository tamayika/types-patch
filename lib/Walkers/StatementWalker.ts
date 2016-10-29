import * as ts from "typescript";
import { Walker } from "./Walker";
import { addStatement } from "../Util";

export abstract class StatementWalker {
    public parentWalker: Walker;

    public constructor(parentWalker: Walker) {
        this.parentWalker = parentWalker;
    }

    public abstract getSyntaxKind(): ts.SyntaxKind;
    public abstract walk(statements: ts.NodeArray<ts.Statement>, patchStatement: ts.Statement, shouldRemove: boolean);

    protected addStatement(statements: ts.NodeArray<ts.Statement>, statement: ts.Statement) {
        this.parentWalker.source =
            addStatement(this.parentWalker.source, this.parentWalker.patch, statements, statement);
    }
}
