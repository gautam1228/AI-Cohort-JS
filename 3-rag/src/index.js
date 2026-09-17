import { generateVectorEmbeddingsForPDF } from "./indexing.js";
import "dotenv/config";

async function main() {
    const pdfPath = "./docs/nodejs.pdf";

    console.log(`Starting indexing of provided documents ...`);

    await generateVectorEmbeddingsForPDF(pdfPath);
}

main();
