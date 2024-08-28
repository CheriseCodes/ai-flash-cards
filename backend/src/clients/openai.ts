import OpenAI from "openai";
import { OpenAIClient } from "../classes/openai";


let apiKey = process.env.OPENAI_API_KEY
if (process.env.NODE_ENV && process.env.NODE_ENV.includes("test")) {
    apiKey = "placeholder"
} 
export const openai: OpenAIClient = new OpenAIClient(new OpenAI({apiKey: apiKey}))
