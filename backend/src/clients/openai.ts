import OpenAI from "openai";


let apiKey = process.env.OPENAI_API_KEY
if (process.env.NODE_ENV && process.env.APP_ENV && (process.env.NODE_ENV.includes("test") || process.env.APP_ENV.includes("test") || process.env.APP_ENV.includes("development"))) {
    apiKey = "placeholder"
} 
export const openai = new OpenAI({apiKey: apiKey})
