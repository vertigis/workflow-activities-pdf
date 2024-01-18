import type { IActivityHandler } from "@vertigis/workflow";
import { PDFDocument } from "pdf-lib";

interface CreatePdfInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @description The width of the page in points. The default is 595 (A4 paper size). Use 612 for Letter size.
     */
    pageWidth?: 595 | 612 | number;
    /**
     * @description The height of the page in points. The default is 842 (A4 paper size). Use 792 for Letter size.
     */
    pageHeight?: 792 | 842 | number;
    /**
     * @description The title of the document.
     */
    title?: string;
    /**
     * @description The author of the document.
     */
    author?: string;
    /**
     * @description The subject of the document.
     */
    subject?: string;
    /**
     * @description The language of the document.
     */
    language?: "en-us" | string;
    /**
     * @description The keywords to assign to the document.
     */
    keywords?: string[];

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

interface CreatePdfOutputs {
    /**
     * @description The PDF document.
     */
    result: Blob;
}

/**
 * @displayName Create PDF
 * @category PDF
 * @description Creates a blank PDF document.
 * @clientOnly
 * @supportedApps EXB, GWV, GVH, WAB
 */
export default class CreatePdf implements IActivityHandler {
    async execute(inputs: CreatePdfInputs): Promise<CreatePdfOutputs> {
        const {
            author,
            keywords,
            language,
            pageHeight,
            pageWidth,
            subject,
            title,
        } = inputs;

        const doc = await PDFDocument.create();
        doc.setProducer("VertiGIS Studio");
        if (author) {
            doc.setAuthor(author);
        }
        if (title) {
            doc.setTitle(title);
        }
        if (subject) {
            doc.setSubject(subject);
        }
        if (language) {
            doc.setLanguage(language);
        }
        if (keywords) {
            doc.setKeywords(keywords);
        }

        const page = doc.addPage(); // Defaults to A4 size
        if (pageHeight) {
            page.setHeight(pageHeight);
        }
        if (pageWidth) {
            page.setWidth(pageWidth);
        }

        const pdfBytes = await doc.save();
        const result = new Blob([pdfBytes], { type: "application/pdf" });

        return {
            result,
        };
    }
}
