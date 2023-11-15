import type { IActivityHandler } from "@vertigis/workflow";
import { PDFDocument } from "pdf-lib";

interface MergePdfsInputs {
    /**
     * @description The source PDF documents to merge.
     * @required
     */
    sources: Blob[];
}

interface MergePdfsOutputs {
    /**
     * @description The merged PDF document.
     */
    result: Blob;
}

/**
 * @displayName Merge PDFs
 * @category PDF
 * @description Merges multiple PDF documents into a single PDF document.
 * @clientOnly
 * @supportedApps EXB, GWV, GVH, WAB
 */
export default class MergePdfs implements IActivityHandler {
    async execute(inputs: MergePdfsInputs): Promise<MergePdfsOutputs> {
        const { sources } = inputs;
        if (!sources) {
            throw new Error("sources is required");
        }

        const mergedPdf = await PDFDocument.create();
        for (const source of sources) {
            const doc = await PDFDocument.load(await source.arrayBuffer());
            const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            pages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const result = new Blob([pdfBytes], { type: "application/pdf" });

        return {
            result,
        };
    }
}
