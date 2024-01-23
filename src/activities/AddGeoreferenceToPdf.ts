import type { IActivityHandler } from "@vertigis/workflow";
import {
    PDFArray,
    PDFDict,
    PDFDocument,
    PDFName,
    PDFNumber,
    PDFString,
} from "pdf-lib";

export interface AddGeoreferenceToPdfInputs {
    /**
     * @description The source PDF document to add the georeference metadata to.
     * @required
     */
    source: Blob;

    /**
     * @description The bounding coordinates of the map element to georeference in PDF user space.
     * The array must contain two coordinate pairs in the following order: [[bottom-left x, bottom-left y], [top-right x, top-right y]].
     * The coordinate [0, 0] represents the bottom left corner of the page.
     * Typically the units of a PDF are in points (1/72 of an inch).
     * @required
     */
    pageBounds: number[][];

    /**
     * @description The bounding coordinates of the map element to georeference in geographic space.
     * The array must contain four coordinate pairs in the following order: [[bottom-left latitude, bottom-left longitude], [top-left latitude, top-left longitude], [top-right latitude, top-right longitude], [bottom-right latitude, bottom-right longitude]].
     * @required
     */
    mapBounds: number[][];

    /**
     * @description The Well-Known Text (WKT) definition of the coordinate system of the map coordinates.
     * @required
     */
    coordinateSystem: string;

    /**
     * @description The zero-based index of the page to apply the georeference metadata to. The default is 0.
     */
    pageIndex?: number;

    /**
     * @description An optional name to apply to the georeference metadata. The default is "Map".
     */
    name?: string;
}

export interface AddGeoreferenceToPdfOutputs {
    /**
     * @description A new PDF document containing the specified georeference metadata.
     */
    result: Blob;
}

/**
 * @category PDF
 * @displayName Add Georeference To PDF
 * @description Adds georeference metadata to a PDF document.
 * @clientOnly
 * @supportedApps EXB, GWV, GVH, WAB
 */
export default class AddGeoreferenceToPdf implements IActivityHandler {
    async execute(
        inputs: AddGeoreferenceToPdfInputs,
    ): Promise<AddGeoreferenceToPdfOutputs> {
        const {
            coordinateSystem,
            mapBounds,
            name,
            pageBounds,
            pageIndex = 0,
            source,
        } = inputs;
        if (!source) {
            throw new Error("source is required");
        }
        if (!coordinateSystem) {
            throw new Error("coordinateSystem is required");
        }
        if (!pageBounds) {
            throw new Error("pageBounds is required");
        }
        if (pageBounds.length != 2 || !pageBounds.every(x => x.length === 2)) {
            throw new Error("pageBounds must contain two coordinate pairs");
        }
        if (!mapBounds) {
            throw new Error("mapBounds is required");
        }
        if (mapBounds.length != 4 || !mapBounds.every(x => x.length === 2)) {
            throw new Error("mapBounds must contain four coordinate pairs");
        }

        const doc = await PDFDocument.load(await source.arrayBuffer());
        const page = doc.getPage(pageIndex);

        const vpName = PDFName.of("VP");
        let vpArray: PDFArray;
        if (page.node.has(vpName)) {
            vpArray = page.node.get(vpName) as PDFArray;
        } else {
            vpArray = PDFArray.withContext(page.node.context);
            page.node.set(vpName, vpArray);
        }
        const vpDict = PDFDict.withContext(page.node.context);
        vpArray.push(vpDict);

        vpDict.set(PDFName.of("Type"), PDFName.of("Viewport"));
        vpDict.set(PDFName.of("Name"), PDFString.of(name || "Map"));

        // The bounding box of the map area in the PDF user space
        const bbox = PDFArray.withContext(page.node.context);
        for (const [x, y] of pageBounds) {
            bbox.push(PDFNumber.of(x));
            bbox.push(PDFNumber.of(y));
        }
        vpDict.set(PDFName.of("BBox"), bbox);

        const measure = PDFDict.withContext(page.node.context);
        vpDict.set(PDFName.of("Measure"), measure);

        measure.set(PDFName.of("Type"), PDFName.of("Measure"));
        measure.set(PDFName.of("Subtype"), PDFName.of("GEO"));

        // /Bounds is optional, but we are providing the default anyway to ensure support in any PDF viewer
        const bounds = PDFArray.withContext(page.node.context);
        bounds.push(PDFNumber.of(0));
        bounds.push(PDFNumber.of(0));
        bounds.push(PDFNumber.of(0));
        bounds.push(PDFNumber.of(1));
        bounds.push(PDFNumber.of(1));
        bounds.push(PDFNumber.of(1));
        bounds.push(PDFNumber.of(1));
        bounds.push(PDFNumber.of(0));
        measure.set(PDFName.of("Bounds"), bounds);

        const gcs = PDFDict.withContext(page.node.context);
        const gcsType = coordinateSystem.startsWith("PROJCS[")
            ? "PROJCS"
            : "GEOGCS";
        vpDict.set(PDFName.of("GCS"), gcs);
        gcs.set(PDFName.of("Type"), PDFName.of(gcsType));
        gcs.set(PDFName.of("WKT"), PDFString.of(coordinateSystem));
        measure.set(PDFName.of("GCS"), gcs);

        // The bounding coordinates of the map area in the real world
        const gpts = PDFArray.withContext(page.node.context);
        for (const [x, y] of mapBounds) {
            gpts.push(PDFNumber.of(x));
            gpts.push(PDFNumber.of(y));
        }
        measure.set(PDFName.of("GPTS"), gpts);

        // /LPTS is optional, but Adobe Reader seems to require it, so we are providing the default to ensure support in any PDF viewer.
        const lpts = PDFArray.withContext(page.node.context);
        lpts.push(PDFNumber.of(0));
        lpts.push(PDFNumber.of(0));
        lpts.push(PDFNumber.of(0));
        lpts.push(PDFNumber.of(1));
        lpts.push(PDFNumber.of(1));
        lpts.push(PDFNumber.of(1));
        lpts.push(PDFNumber.of(1));
        lpts.push(PDFNumber.of(0));
        measure.set(PDFName.of("LPTS"), lpts);

        const pdfBytes = await doc.save();
        const result = new Blob([pdfBytes], { type: "application/pdf" });

        return {
            result,
        };
    }
}
