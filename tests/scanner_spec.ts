import "mocha";
import "chai";
import { expect } from "chai";
import { Scanner } from "../lib/scanner";
import { createScannerByDts } from "../lib/util";

describe("Scanner", () => {
    let scanner: Scanner;

    function countHeadWhitespaceCount(line: string) {
        const match = line.match(/^([\s]+)/);
        if (!match) {
            return 0;
        }
        return match[1].length;
    }

    function removeHeadWhiteSpaces(str: string) {
        const minWhitespaceCount = Math.min(...str.split("\n").map((line) => {
            return countHeadWhitespaceCount(line);
        }));
        return str.split("\n").map((line) => {
            return line.substring(minWhitespaceCount);
        }).join("\n");
    }

    function createScanner(dts: string) {
        dts = dts.replace(/^\n/, "");
        dts = removeHeadWhiteSpaces(dts);
        const tsScanner = createScannerByDts(dts);
        scanner = new Scanner(tsScanner);
    }

    describe(".scan", () => {
        it("empty content success", () => {
            createScanner("");
            scanner.scan();
            expect(scanner.removePositions).to.eql([]);
            expect(scanner.removeRanges).to.eql([]);
        });

        it("one remove position", () => {
            createScanner("/* types-patch:remove */");
            scanner.scan();
            expect(scanner.removePositions).to.eql([0]);
            expect(scanner.removeRanges).to.eql([]);
        });

        it("multiple remove positions", () => {
            createScanner(`
            /* types-patch:remove */
            /* types-patch:remove */
            /* types-patch:remove */
            `);
            scanner.scan();
            expect(scanner.removePositions).to.eql([0, 25, 50]);
            expect(scanner.removeRanges).to.eql([]);
        });

        it("one remove range", () => {
            createScanner(`
            /* types-patch:remove:start */
            /* types-patch:remove:end */
            `);
            scanner.scan();
            expect(scanner.removePositions).to.eql([]);
            expect(scanner.removeRanges).to.eql([[0, 31]]);
        });

        it("multiple remove ranges", () => {
            createScanner(`
            /* types-patch:remove:start */
            /* types-patch:remove:end */
            /* types-patch:remove:start */
            /* types-patch:remove:end */
            `);
            scanner.scan();
            expect(scanner.removePositions).to.eql([]);
            expect(scanner.removeRanges).to.eql([[0, 31], [60, 91]]);
        });

        it("unclosed remove ranges", () => {
            createScanner(`
            /* types-patch:remove:start */
            `);
            scanner.scan();
            expect(scanner.removePositions).to.eql([]);
            expect(scanner.removeRanges).to.eql([[0]]);
        });

        it("twice opened remove ranges", () => {
            createScanner(`
            /* types-patch:remove:start */
            /* types-patch:remove:start */
            /* types-patch:remove:end */
            `);
            scanner.scan();
            expect(scanner.removePositions).to.eql([]);
            expect(scanner.removeRanges).to.eql([[0], [31, 62]]);
        });

        it("twice closed remove ranges", () => {
            createScanner(`
            /* types-patch:remove:start */
            /* types-patch:remove:end */
            /* types-patch:remove:end */
            `);
            scanner.scan();
            expect(scanner.removePositions).to.eql([]);
            expect(scanner.removeRanges).to.eql([[0, 31]]);
        });
    });
});
