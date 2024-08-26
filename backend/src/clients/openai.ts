import OpenAI from "openai";
import { OpenAIClient } from "../classes/openai";


let apiKey = process.env.OPENAI_API_KEY
if (process.env.NODE_ENV && process.env.APP_ENV && (process.env.NODE_ENV.includes("test") || process.env.APP_ENV.includes("test") || process.env.APP_ENV.includes("development"))) {
    apiKey = "placeholder"
} 
export const openai: OpenAIClient = new OpenAIClient(new OpenAI({apiKey: apiKey}))
