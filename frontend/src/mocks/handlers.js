import { HttpResponse, http } from "msw"

import serviceConfig from "../../config/service.json";

const backendDomain = `${serviceConfig.BACKEND_ENDPOINT}${serviceConfig.BACKEND_PATH}`

export const handlers = [
    http.get(`${backendDomain}/flashcards`,() => {
        return HttpResponse.json({"data": [{"Content":{"S":"{\"word\": \"blanche\",\"sampleSentence\": \"Ma mère a préparé une sauce blanche pour accompagner les pâtes.\",\"translatedSampleSentence\":\"My mother made a white sauce to accompany the pasta.\",\"wordTranslated\": \"white\"}"},"TimeStamp":{"S":"1701047496686"},"FlashCardId":{"S":"f552286a-4780-4a36-8500-326d3ce6785f"}}]})
    }),
    http.get(`${backendDomain}/generations/sentences`, ({request}) => {
        const url = new URL(request.url)
        const word = url.searchParams.get("word")
        const langMode = url.searchParams.get("lang_mode")
        const langLevel = url.searchParams.get("lang_level")
        const data = {
                        id: 123,
                        created: 123,
                        usage: {
                            prompt_tokens: 123,
                            completion_tokens: 123,
                            total_tokens: 123
                        }, 
                        choices: [
                            { 
                                finish_reason: "stop", message: {content: JSON.stringify({word: `${word}`,sampleSentence: `Example sentence using ${word} in ${langMode} at level ${langLevel}`,translatedSampleSentence:"English translation of the example sentence",wordTranslated: `English translation of ${word}`})}}]}
        return HttpResponse.json(data)
    }),
    http.get(`${backendDomain}/generations/images`, () => {
        return HttpResponse.json({
            created: Date.now(),
            data: [
              {
                url: "https://picsum.photos/256"
              }
            ]
        })
    }),
    http.post(`${backendDomain}/upload/image`,({}) => {
        return HttpResponse.json(
            { url: "https://picsum.photos/256" }
        )
    })
]