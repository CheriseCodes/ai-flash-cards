const appConfig = {
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

const allowedFrenchWords = [
  'aller', 'avoir', 'être', 'faire', 'pouvoir', 'dire', 'voir', 'savoir', 'venir', 'devoir',
  'prendre', 'donner', 'trouver', 'aimer', 'parler', 'mettre', 'venir', 'travailler', 'vouloir', 'demander',
  'chercher', 'regarder', 'lire', 'comprendre', 'écouter',
  'temps', 'homme', 'jour', 'monde', 'année', 'maison', 'travail', 'main', 'place', 'personne',
  'vie', 'côté', 'femme', 'enfant', 'œil', 'ville', 'gouvernement', 'partie', 'problème', 'groupe',
  'société', 'question', 'ami', 'famille', 'enfant', 'homme',
  'bon', 'nouveau', 'jeune', 'grand', 'petit', 'vieux', 'autre', 'beau', 'long', 'mauvais',
  'vrai', 'gros', 'premier', 'dernier', 'fort', 'faible', 'blanc', 'noir', 'rouge', 'bleu',
  'chaud', 'froid', 'sec', 'humide', 'clair',
  'bien', 'très', 'trop', 'vite', 'lentement', 'soudainement', 'tard', 'tôt', 'ici', 'là-bas',
  'maintenant', 'jamais', 'toujours', 'peut-être', 'aussi', 'très', 'peu', 'beaucoup', 'à peine', 'encore',
  'surtout', 'malheureusement', 'heureusement', 'bientôt', 'probablement'
];

const allowedSpanishWords = [
  'ser', 'estar', 'tener', 'hacer', 'decir', 'ir', 'ver', 'saber', 'poder', 'venir',
  'dar', 'hablar', 'llevar', 'encontrar', 'querer', 'pensar', 'creer', 'buscar', 'trabajar', 'necesitar',
  'vivir', 'sentir', 'oír', 'cambiar', 'comer',
  'tiempo', 'persona', 'día', 'mundo', 'año', 'casa', 'trabajo', 'mano', 'lugar', 'persona',
  'vida', 'lado', 'mujer', 'hombre', 'niño', 'ojo', 'ciudad', 'gobierno', 'parte', 'problema',
  'grupo', 'sociedad', 'pregunta', 'amigo', 'familia', 'niño', 'hombre',
  'bueno', 'nuevo', 'joven', 'grande', 'pequeño', 'viejo', 'otro', 'bello', 'largo', 'malo',
  'verdadero', 'gordo', 'primer', 'último', 'fuerte', 'débil', 'blanco', 'negro', 'rojo', 'azul',
  'caliente', 'frío', 'seco', 'húmedo', 'claro',
  'bien', 'muy', 'demasiado', 'rápido', 'lentamente', 'súbitamente', 'tarde', 'temprano', 'aquí', 'allí',
  'ahora', 'nunca', 'siempre', 'quizás', 'también', 'tan', 'poco', 'mucho', 'apenas', 'todavía',
  'sobre todo', 'desafortunadamente', 'afortunadamente', 'pronto', 'probablemente'
];

const allowedKoreanWords = [
  '하다', '있다', '되다', '같다', '보다', '알다', '오다', '가다', '말하다', '사랑하다',
  '일어나다', '좋다', '생각하다', '주다', '모르다', '안녕하다', '들다', '사다', '만나다', '쓰다',
  '웃다', '일하다', '읽다', '싶다', '자다',
  '사람', '시간', '일', '년', '말', '손', '물', '눈', '이유', '곳',
  '삶', '곁', '여자', '남자', '아이', '눈', '도시', '정부', '부분', '문제',
  '그룹', '사회', '질문', '친구', '가족', '아이', '남자',
  '좋다', '새롭다', '젊다', '크다', '작다', '늙다', '다르다', '아름답다', '긴', '나쁘다',
  '진실하다', '뚱뚱하다', '첫', '마지막', '강하다', '약하다', '하얗다', '검정하다', '빨갛다', '파랗다',
  '뜨겁다', '춥다', '건조하다', '습하다', '맑다',
  '잘', '매우', '너무', '빨리', '천천히', '갑자기', '늦게', '일찍', '여기', '저기',
  '지금', '결코', '항상', '어쩌면', '또한', '너무', '조금', '많이', '거의', '아직',
  '무엇보다', '불행히도', '다행히도', '일찍', '아마'
];




export default appConfig;
