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
    if (process.env.VITE_APP_ENV == 'kubernetes.production') {
      return 'http://TODO'
    } else if (process.env.VITE_APP_ENV == 'kubernetes.staging') {
      return 'http://TODO'
    } else if (process.env.VITE_APP_ENV == 'kubernetes.test') {
      return 'http://TODO'
    } else if (process.env.VITE_APP_ENV == 'kubernetes.development') {
      return 'https://demo.localdev.me'
    } else if (process.env.VITE_APP_ENV == 'docker.production') {
      return 'http://localhost:8000'
    } else if (process.env.VITE_APP_ENV == 'docker.staging') {
      return 'http://localhost:8000'
    } else if (process.env.VITE_APP_ENV == 'docker.test') {
      return 'http://localhost'
    } else if (process.env.VITE_APP_ENV == 'docker.development') {
      return 'http://localhost'
    } else if (process.env.VITE_APP_ENV == 'local.test') {
      return 'http://localhost:3000'
    } else if (process.env.VITE_APP_ENV == 'local.development') {
      return 'http://localhost:3000'
    } else {
      return 'http://localhost'
    }
  })(),
  BACKEND_PATH: (() => {
    if (process.env.VITE_APP_ENV) {
      if (process.env.VITE_APP_ENV.includes('kubernetes')) {
        return '/backend'
      } else if (process.env.VITE_APP_ENV.includes('docker')) {
        return ''
      } else {
        return ''
      }
    }
  })()
}
