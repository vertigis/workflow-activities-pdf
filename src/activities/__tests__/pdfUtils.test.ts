import { hexToRgba } from "../pdfUtils";

type Rgba = ReturnType<typeof hexToRgba>;

describe("pdfUtils", () => {
    describe("hexToRgba", () => {
        it("returns a default color", () => {
            const defaultColor: Rgba = { red: 0, green: 0, blue: 0, alpha: 1 };
            expect(hexToRgba("")).toStrictEqual(defaultColor);
            expect(hexToRgba(undefined as unknown as string)).toStrictEqual(
                defaultColor,
            );
            expect(hexToRgba(null as unknown as string)).toStrictEqual(
                defaultColor,
            );
        });

        it("parses valid hex color", () => {
            const color: Rgba = {
                red: 0.9333333333333333,
                green: 0.6,
                blue: 0.2,
                alpha: 1,
            };
            expect(hexToRgba("EE9933")).toStrictEqual(color);
            expect(hexToRgba("#EE9933")).toStrictEqual(color);
            expect(hexToRgba("#ee9933")).toStrictEqual(color);
        });

        it("parses valid hex color with alpha", () => {
            const color: Rgba = {
                red: 0.9333333333333333,
                green: 0.6,
                blue: 0.2,
                alpha: 0.8,
            };
            expect(hexToRgba("EE9933CC")).toStrictEqual(color);
            expect(hexToRgba("#EE9933CC")).toStrictEqual(color);
            expect(hexToRgba("#ee9933cc")).toStrictEqual(color);
        });

        it("throws with invalid hex color", () => {
            expect(() => {
                hexToRgba("ZZZZZZ");
            }).toThrow();
            expect(() => {
                hexToRgba("ZZZZZZZZ");
            }).toThrow();
        });

        it("throws with wrong number of characters", () => {
            const badColors = [
                "E",
                "EE",
                "EEE",
                "EEEE",
                "EEEEE",
                "EEEEEEE",
                "EEEEEEEEE",
            ];
            for (const color of [
                ...badColors,
                ...badColors.map((x) => "#" + x),
            ]) {
                expect(() => {
                    hexToRgba(color);
                }).toThrow();
            }
        });
    });
});
