import { Readable } from 'stream';
import https from "node:https";
import { URL } from 'url';

export const isUndefined = (item: any): boolean => {
    return typeof(item) === "undefined"
}

export const unixTimestamp = () => {  
    return Math.floor(Date.now() / 1000)
}

const isValidUrl = (url: string, allowedDomains: string[]): boolean => {
    try {
        const parsedUrl = new URL(url);
        return allowedDomains.includes(parsedUrl.hostname);
    } catch (err) {
        return false;
    }
}

export const createUrlReadStream = (url: string): Readable => {
    const allowedDomains = ['trusted-domain.com', 'another-trusted-domain.com'];
    if (!isValidUrl(url, allowedDomains)) {
        throw new Error('Invalid URL');
    }

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