export const isUndefined = (item: any): boolean => {
    return typeof(item) === "undefined"
}

export const unixTimestamp = () => {  
    return Math.floor(Date.now() / 1000)
  }