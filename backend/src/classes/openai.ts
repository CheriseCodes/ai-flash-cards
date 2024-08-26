import { GenAIClient } from "./abstract";
import OpenAI from "openai";

export class OpenAIClient extends GenAIClient {
    constructor(client: OpenAI) {
        super(client)
    }
    async generateText(prompt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            resolve(prompt);
          });
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