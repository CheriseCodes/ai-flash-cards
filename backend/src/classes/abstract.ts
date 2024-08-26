import OpenAI from "openai";
import { ChatCompletion } from "openai/resources/index.mjs";

export abstract class GenAIClient {
    client: OpenAI;
    constructor(client: OpenAI) {
        this.client = client
    }
    abstract generateText(prompts: string[]): Promise<ChatCompletion>;
    abstract generateImage(prompt: string): Promise<OpenAI.Images.ImagesResponse>;
}