export const languageConfig: any = {
  languageModes: {
    KOREAN: "Korean",
    FRENCH: "French",
    SPANISH: "Spanish",
  },
  cferLanguageLevels: {
    A1: "A1",
    A2: "A2",
    B1: "B1",
    B2: "B2",
    C1: "C1",
    C2: "C2",
  },
  koreanLanguageLevels: {
    TOPIK1: "TOPIK1",
    TOPIK2: "TOPIK2",
    TOPIK3: "TOPIK3",
    TOPIK4: "TOPIK4",
    TOPIK5: "TOPIK5",
    TOPIK6: "TOPIK6",
  },
};

export const serviceConfig = {
  BACKEND_ENDPOINT: (() => {
    if (import.meta.env.VITE_APP_ENV == 'kubernetes.production') {
      return 'http://TODO'
    } else if (import.meta.env.VITE_APP_ENV == 'local.development') {
      return 'http://localhost:3000'
    } else if (import.meta.env.VITE_APP_ENV == 'docker.development') {
      return 'http://localhost:3000'
    } else if (import.meta.env.VITE_APP_ENV == 'local.production') {
      return 'http://localhost:8000'
    }
  })(),
  BACKEND_PATH: (() => {
      if (import.meta.env.VITE_APP_ENV == 'kubernetes.production') {
        return ''
      } else if (import.meta.env.VITE_APP_ENV == 'local.development') {
        return ''
      } else if (import.meta.env.VITE_APP_ENV == 'docker.development') {
        return ''
      } else if (import.meta.env.VITE_APP_ENV == 'local.production') {
        return ''
      }
  })()
}
