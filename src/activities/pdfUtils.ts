/**
 * Converts a color hex code into RGBA values.
 * @param hex The color hex code.
 * @returns RGBA values between 0 and 1.
 */
export function hexToRgba(hex = "000000FF") {
    hex = hex.replace("#", "");
    const red = parseInt(hex.substring(0, 2), 16) / 255;
    const green = parseInt(hex.substring(2, 4), 16) / 255;
    const blue = parseInt(hex.substring(4, 6), 16) / 255;
    const alpha = hex.length > 6 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
    return {
        red,
        green,
        blue,
        alpha,
    };
}
