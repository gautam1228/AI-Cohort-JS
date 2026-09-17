import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

import OpenAI from "openai";

const openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function answerUserQuery(userQuery) {
    // take the user query
    // Initialize the embedding model
    const embedder = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Get the vector store
    const vectorStore = new QdrantVectorStore(embedder, {
        url: "http://localhost:6333",
        collectionName: "rag-docs",
    });

    // Convert the user query into the same type of vector embedding that the document was chunked and stored as
    // perform cosine similarity search over the vectors stored in the vector store
    const retriever = vectorStore.asRetriever({ k: 5 }); // taking the top 5 chunks ranked by cosine similarity
    const results = await retriever.invoke(userQuery);
    // provide the top k chunks to the query as context
    const SYSTEM_PROMPT = `
    You are an expert in answering the usery query based on the provided context about the document.
    Do not answer anything beyond what is present in the document.

    Always answer the user in short and mention the page number on which the content is available.

    User Documents:
    ${results.map((result) => JSON.stringify({ pageContent: result.pageContent, pageNumber: result.metadata.loc.pageNumber })).join("\n\n")}
    `;

    // Make an LLM call, the LLM answers the user query alongwith the context of the document
    const llmResponse = await openAiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userQuery },
        ],
    });

    console.log(`LLM Response: ${llmResponse.choices[0].message.content}`);
}

answerUserQuery("FS Module");
