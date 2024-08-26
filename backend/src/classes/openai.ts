import { GenAIClient } from "./abstract";
import { ChatCompletion } from "openai/resources/index.mjs";
import OpenAI from "openai";

export class OpenAIClient extends GenAIClient {
    constructor(client: OpenAI) {
        super(client)
    }
    async generateText(prompts: string[]): Promise<ChatCompletion> {
        const messages = []
        for (const prompt of prompts) {
            messages.push({
                role: "user",
                content: prompt,
            });
        }
        const response: ChatCompletion = await this.client.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 1,
            messages,
          });
          if (response.id) {
            return response
          }
    }
    async generateImage(prompt: string): Promise<string> {
        const response = await this.client.images.generate({
            prompt: prompt,
            n: 1,
            size: "256x256",
          });
          if (response?.created) {
            return response.data[0].url;
          } else {
            return ""
          }
    }
}