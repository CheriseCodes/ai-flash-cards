import { HttpResponse, http } from "msw"

export const handlers = [
    http.post("/flashcards",() => {
        return new HttpResponse.json({data: []})
    }),
    http.post("/openai/test/text", ({request}) => {
        const url = new URL(request.url)
        const word = url.searchParams.get("word")
        const langMode = url.searchParams.get("lang_mode")
        const langLevel = url.searchParams.get("lang_level")
        return new HttpResponse.json({id: 123, created: 123, usage: {
            prompt_tokens: 123,
            completion_tokens: 123,
            total_tokens: 123
          }, choices:[{ finish_reason: "stop", message: {content: JSON.stringify({word: `${word}`,sampleSentence: `Example sentence using ${word} in ${langMode} at level ${langLevel}`,translatedSampleSentence:"English translation of the example sentence",wordTranslated: `English translation of ${word}`})}}]})
    }),
    http.post("/openai/test/imagine", () => {
        return new HttpResponse.json({
            created: Date.now(),
            data: [
              {
                url: "https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/gavygdwhilk8d2cytkeq"
              }
            ]
        })
    }),
    http.post("/upload/image",({request}) => {
        const url = new URL(request.url)
        const imgUrl = url.searchParams.get("imgUrl")
        return new HttpResponse.json(
            { url: imgUrl }
        )
    })
]