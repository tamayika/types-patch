import * as ts from "typescript";

export class Scanner {
    public removePositions: number[];
    public removeRanges: number[][];
    private scanner: ts.Scanner;

    public constructor(scanner: ts.Scanner) {
        this.scanner = scanner;
        this.removePositions = [];
        this.removeRanges = [];
    }

    public scan() {
        while (this.scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            this.scanComment();
        }
    }

    private scanComment() {
        const token = this.scanner.getToken();
        if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
            const commentText = this.scanner.getTokenText();
            const startPosition = this.scanner.getTokenPos();
            this.handleRemoveSwitch(commentText, startPosition);
        }
    }

    private handleRemoveSwitch(commentText: string, startPosition: number) {
        if (!commentText.match(/^(\/\*|\/\/)\s*types-patch:/)) {
            return;
        }
        const commentParts = commentText.split(":");
        if (!commentParts[1].match(/^remove/)) {
            return;
        }
        if (commentParts.length === 2) {
            this.removePositions.push(startPosition);
            return;
        }
        const startEndMatch = commentParts[2].match(/^(start|end)/);
        if (!startEndMatch) {
            return;
        }
        switch (startEndMatch[1]) {
            case "start":
                this.removeRanges.push([startPosition]);
                break;
            case "end":
                if (this.removeRanges.length > 0) {
                    const lastRange = this.removeRanges[this.removeRanges.length - 1];
                    if (lastRange.length === 1) {
                        lastRange.push(startPosition);
                    }
                }
                break;
            default:
                break;
        }
    }
}
