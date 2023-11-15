/**
 * Converts a color hex code into RGBA values.
 * @param hexColor The color hex code.
 * @returns RGBA values between 0 and 1.
 */
export function hexToRgba(hexColor: string) {
    hexColor = (hexColor || "000000FF").replace(/^#/, "");
    if (hexColor.length === 6 || hexColor.length === 8) {
        const red = parseInt(hexColor.substring(0, 2), 16) / 255;
        const green = parseInt(hexColor.substring(2, 4), 16) / 255;
        const blue = parseInt(hexColor.substring(4, 6), 16) / 255;
        const alpha =
            hexColor.length === 8
                ? parseInt(hexColor.substring(6, 8), 16) / 255
                : 1;
        if (
            !Number.isNaN(red) &&
            !Number.isNaN(green) &&
            !Number.isNaN(blue) &&
            !Number.isNaN(alpha)
        ) {
            return {
                red,
                green,
                blue,
                alpha,
            };
        }
    }

    throw new Error(`Invalid hex color '${hexColor}'.`);
}
