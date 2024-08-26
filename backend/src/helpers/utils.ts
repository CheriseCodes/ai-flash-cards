import { Readable } from 'stream';
import https from "node:https";

export const isUndefined = (item: any): boolean => {
    return typeof(item) === "undefined"
}

export const unixTimestamp = () => {  
    return Math.floor(Date.now() / 1000)
}

export const createUrlReadStream = (url: string): Readable => {
    const readable = new Readable({
      read() {}, // No-op
    })
  
    https.get(url, (response) => {
      response.on('data', (chunk: any) => {
        readable.push(chunk)
      })
  
      response.on('end', () => {
        readable.push(null) // End of stream
      })
    }).on('error', (error) => {
      readable.emit('error', error) // Forward the error to the readable stream
    })
    return readable
  }