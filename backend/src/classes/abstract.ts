import OpenAI from "openai";

export abstract class GenAIClient {
    client: OpenAI;
    constructor(client: OpenAI) {
        this.client = client
    }
    abstract generateText(prompt: string): Promise<string>;
    abstract generateImage(prompt: string): Promise<string>;
}