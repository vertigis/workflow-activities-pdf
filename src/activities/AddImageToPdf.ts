import type { IActivityHandler } from "@vertigis/workflow";
import { ColorTypes, PDFDocument, PDFImage } from "pdf-lib";
import { hexToRgba } from "./pdfUtils";

interface AddImageToPdfInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @description The source PDF document to modify.
     * @required
     */
    source: Blob;

    /**
     * @description The image to add. Only JPEG and PNG images are supported.
     * @required
     */
    image: Blob | ArrayBuffer;

    /**
     * @description The X coordinate (in points) to add the image at. The coordinate [0, 0] represents the bottom left corner of the page.
     * @required
     */
    x: number;

    /**
     * @description The Y coordinate (in points) to add the image at. The coordinate [0, 0] represents the bottom left corner of the page.
     * @required
     */
    y: number;

    /**
     * @description The height of the image.
     */
    height: number;

    /**
     * @description The width of the image.
     */
    width: number;

    /**
     * @description The width (in points) of the image border. The default is 0 (no border).
     */
    borderWidth?: number;

    /**
     * @description The RGBA hex color of the image border. The default is 000000FF (black). The alpha value is optional.
     */
    borderColor?: "000000FF" | "FF0000FF" | "0000FFFF" | string;

    /**
     * @description The zero-based index of the page to add the image to. The default is 0.
     */
    pageIndex?: number;

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

interface AddImageToPdfOutputs {
    /**
     * @description The modified PDF document.
     */
    result: Blob;
}

/**
 * @displayName Add Image To PDF
 * @category PDF
 * @description Adds an image to a PDF document.
 * @clientOnly
 * @supportedApps EXB, GWV, GVH, WAB
 */
export default class AddImageToPdf implements IActivityHandler {
    async execute(inputs: AddImageToPdfInputs): Promise<AddImageToPdfOutputs> {
        const {
            borderColor = "000000FF",
            borderWidth = 0,
            height,
            image,
            pageIndex = 0,
            source,
            width,
            x = 0,
            y = 0,
        } = inputs;
        if (!image) {
            throw new Error("image is required");
        }
        if (!source) {
            throw new Error("source is required");
        }

        const doc = await PDFDocument.load(await source.arrayBuffer());

        let pdfImage: PDFImage;
        const imageBytes =
            image instanceof ArrayBuffer ? image : await image.arrayBuffer();

        // Detect the image type
        const markerBytes = new Uint8Array(imageBytes.slice(0, 8));
        if (
            markerBytes[0] === 255 &&
            markerBytes[1] === 216 &&
            markerBytes[2] === 255
        ) {
            // JPG
            pdfImage = await doc.embedJpg(imageBytes);
        } else if (
            markerBytes[0] === 137 &&
            markerBytes[1] === 80 &&
            markerBytes[2] === 78 &&
            markerBytes[3] === 71 &&
            markerBytes[4] === 13 &&
            markerBytes[5] === 10 &&
            markerBytes[6] === 26 &&
            markerBytes[7] === 10
        ) {
            // PNG
            pdfImage = await doc.embedPng(imageBytes);
        } else {
            throw new Error("image format not supported. Must be PNG or JPG.");
        }

        const page = doc.getPage(pageIndex);
        page.drawImage(pdfImage, {
            x,
            y,
            width,
            height,
        });

        if (borderWidth > 0) {
            const borderRgba = hexToRgba(borderColor);
            page.drawRectangle({
                x,
                y,
                width: width || pdfImage.width,
                height: height || pdfImage.height,
                borderColor: {
                    type: ColorTypes.RGB,
                    red: borderRgba.red,
                    green: borderRgba.green,
                    blue: borderRgba.blue,
                },
                borderOpacity: borderRgba.alpha,
                borderWidth,
            });
        }

        const pdfBytes = await doc.save();
        const result = new Blob([pdfBytes], { type: "application/pdf" });

        return {
            result,
        };
    }
}
