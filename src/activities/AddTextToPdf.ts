import type { IActivityHandler } from "@vertigis/workflow";
import { ColorTypes, PDFDocument, StandardFonts } from "pdf-lib";
import { hexToRgba } from "./pdfUtils";

interface AddTextToPdfInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @description The source PDF document to modify.
     * @required
     */
    source: Blob;

    /**
     * @description The text to add.
     * @required
     */
    text: string;

    /**
     * @description The X coordinate (in points) to add the text at. The coordinate [0, 0] represents the bottom left corner of the page.
     * @required
     */
    x: number;

    /**
     * @description The Y coordinate (in points) to add the text at. The coordinate [0, 0] represents the bottom left corner of the page.
     * @required
     */
    y: number;

    /**
     * @description The name of font of the text. The default is Helvetica.
     */
    fontName: "Helvetica" | "Symbol" | string;

    /**
     * @description The font size (in points) of the text. The default is 12.
     */
    fontSize: number;

    /**
     * @description The RGBA hex color of the text. The default is 000000FF (black). The alpha value is optional.
     */
    color: "000000FF" | "FF0000FF" | "0000FFFF" | string;

    /**
     * @description The zero-based index of the page to add the text to. The default is 0.
     */
    pageIndex?: number;

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

interface AddTextToPdfOutputs {
    /**
     * @description The modified PDF document.
     */
    result: Blob;
}

/**
 * @displayName Add Text To PDF
 * @category PDF
 * @description Adds text to a PDF document.
 * @clientOnly
 * @supportedApps EXB, GWV, GVH, WAB
 */
export default class AddTextToPdf implements IActivityHandler {
    async execute(inputs: AddTextToPdfInputs): Promise<AddTextToPdfOutputs> {
        const {
            color = "000000FF",
            fontName = "Helvetica",
            fontSize = 12,
            pageIndex = 0,
            source,
            text,
            x = 0,
            y = 0,
        } = inputs;
        if (!source) {
            throw new Error("source is required");
        }

        const doc = await PDFDocument.load(await source.arrayBuffer());

        const page = doc.getPage(pageIndex);
        const stdFont: string | undefined = StandardFonts[fontName];
        const font = stdFont ? await doc.embedFont(stdFont) : undefined;
        const rgba = hexToRgba(color);

        page.drawText(text, {
            x,
            y,
            font,
            size: fontSize,
            color: {
                type: ColorTypes.RGB,
                red: rgba.red,
                green: rgba.green,
                blue: rgba.blue,
            },
            opacity: rgba.alpha,
        });

        const pdfBytes = await doc.save();
        const result = new Blob([pdfBytes], { type: "application/pdf" });

        return {
            result,
        };
    }
}
