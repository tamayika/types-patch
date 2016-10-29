import "mocha";
import "chai";
import { expect } from "chai";
import { Scanner } from "../lib/scanner";
import { Walker } from "../lib/Walkers/Walker";
import { createSourceFileByDts, createScannerByDts, sourceStatementsToString } from "../lib/util";

describe("Walker", () => {
    let walker: Walker;

    function countHeadWhitespaceCount(line: string) {
        const match = line.match(/^([\s]+)/);
        if (!match) {
            return 0;
        }
        return match[1].length;
    }

    function removeHeadWhiteSpaces(str: string) {
        str = str.replace(/^\n/, "");
        const minWhitespaceCount = Math.min(...str.split("\n").map((line) => {
            return countHeadWhitespaceCount(line);
        }));
        return str.split("\n").map((line) => {
            return line.substring(minWhitespaceCount);
        }).join("\n");
    }

    function createWalker(dts: string, patch: string) {
        dts = removeHeadWhiteSpaces(dts);
        patch = removeHeadWhiteSpaces(patch);
        const scanner = new Scanner(createScannerByDts(patch));
        scanner.scan();
        walker = new Walker(
            createSourceFileByDts(dts),
            createSourceFileByDts(patch),
            scanner,
        );
    }

    describe(".apply", () => {
        it("empty", () => {
            createWalker("", "");
            walker.apply();
            expect(sourceStatementsToString(walker.source)).to.eql("");
        });

        context("export assignment", () => {
            it("remove", () => {
                const dts = `
                export = () => string;
                `;
                const patch = `
                /* types-patch:remove */
                export = () => string;
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql("");
            });

            it("add", () => {
                const dts = ``;
                const patch = `
                export = () => string;
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql("export = () => string;");
            });
        });

        context("declare var ", () => {
            it("remove", () => {
                const dts = `
                declare var hoge = "hoge";
                `;
                const patch = `
                /* types-patch:remove */
                declare var hoge = "hoge";
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql("");
            });

            it("remove2", () => {
                const dts = `
                declare var hoge: string;
                `;
                const patch = `
                /* types-patch:remove */
                declare var hoge: string;
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql("");
            });

            it("add", () => {
                const dts = ``;
                const patch = `
                declare var hoge = "hoge";
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql("declare var hoge = \"hoge\";");
            });
        });

        context("module declaration", () => {
            it("remove", () => {
                const dts = `
                module hoge {
                    
                }
                `;
                const patch = `
                /* types-patch:remove */
                module hoge {
                    
                }
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql("");
            });

            it("add", () => {
                const dts = ``;
                const patch = `
                module hoge {
                    
                }
                `;
                createWalker(dts, patch);
                walker.apply();
                expect(sourceStatementsToString(walker.source)).to.eql(removeHeadWhiteSpaces(`
                module hoge {
                    
                }`));
            });
        });
    });
});
