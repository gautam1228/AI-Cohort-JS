import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function generateVectorEmbeddingsForPDF(pdfPath) {
    // Load the PDF content as document (Convert it to text)
    const loader = new PDFLoader(pdfPath);
    const document = await loader.load(); // Converts the PDF to text, chunks the data page by page

    // Initialize the embeddings model
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Creating the vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings, // using this embedding model
        {
            url: "http://localhost:6333",
            collectionName: "rag-docs",
        },
    );

    // Adding the document embeddings to the vector store
    await vectorStore.addDocuments(document);
    console.log(`Indexing of documents completed ...`);
}
