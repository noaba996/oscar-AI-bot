// 🎭 הודעות פתיחה
const welcomeMessages = [
  "שלום! אני אוסקר, בוט המלצות הסרטים שלך 🎬 איזה סרט מעניין אותך היום?",
  "היי! אני אוסקר ואני מתמחה בהמלצות סרטים 🍿 מה תרצה לראות?",
  "ברוכים הבאים! אני אוסקר ואשמח לעזור לך למצוא סרט מושלם 🎭 מה אתה מחפש?"
];

// 🤖 הגדרות Gemini AI
const GEMINI_API_KEY = 'AIzaSyANzNK0-8TJLM8XhlXjO-aTLDTePw1PlXc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// 📚 מאגר סרטים זמני (ישמש כגיבוי)
const backupMovies = [
  {
    Title: "המצאה מתוקה",
    Release_Year: 2024,
    Genres: "Animation, Comedy, Family",
    Rating: "7.5",
    ageRange: "7+",
    "נטפליקס": 1,
    "יס": 1,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=sweet_invention_trailer_example",
    Duration: 90
  },
  {
    Title: "המבול",
    Release_Year: 2023,
    Genres: "Action, Drama",
    Rating: "8.5",
    ageRange: "16+",
    "נטפליקס": 1,
    "יס": 0,
    "הוט": 1,
    trailer: "https://www.youtube.com/watch?v=QxJQbGY3LcI",
    Duration: 130
  },
  {
    Title: "המשחק",
    Release_Year: 2022,
    Genres: "Comedy, Romance",
    Rating: "7.8",
    ageRange: "12+",
    "נטפליקס": 1,
    "יס": 1,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=example2",
    Duration: 105
  },
  {
    Title: "מלחמת הכוכבים: עלייתו של סקייווקר",
    Release_Year: 2019,
    Genres: "Action, Adventure, Sci-Fi",
    Rating: "6.5",
    ageRange: "12+",
    "נטפליקס": 1,
    "יס": 1,
    "הוט": 1,
    trailer: "https://www.youtube.com/watch?v=8Qn_spdM5Zg",
    Duration: 142
  },
  {
    Title: "ג'וקר",
    Release_Year: 2019,
    Genres: "Drama, Thriller",
    Rating: "8.4",
    ageRange: "16+",
    "נטפליקס": 1,
    "יס": 1,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=zAGVQLHvwOY",
    Duration: 122
  },
  {
    Title: "המטריקס",
    Release_Year: 1999,
    Genres: "Action, Sci-Fi",
    Rating: "8.7",
    ageRange: "17+",
    "נטפליקס": 1,
    "יס": 0,
    "הוט": 1,
    trailer: "https://www.youtube.com/watch?v=matrix_trailer_example",
    Duration: 110
  },
  {
    Title: "שתיקת הכבשים",
    Release_Year: 1991,
    Genres: "Crime, Drama, Thriller",
    Rating: "8.6",
    ageRange: "17+",
    "נטפליקס": 1,
    "יס": 0,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=silence_of_the_lambs_trailer_example",
    Duration: 118
  },
  {
    Title: "שר הטבעות: אחוות הטבעת",
    Release_Year: 2001,
    Genres: "Adventure, Drama, Fantasy",
    Rating: "8.8",
    ageRange: "13+",
    "נטפליקס": 0,
    "יס": 1,
    "הוט": 1,
    trailer: "https://www.youtube.com/watch?v=fellowship_trailer_example",
    Duration: 178
  },
  {
    Title: "הסנדק",
    Release_Year: 1972,
    Genres: "Crime, Drama",
    Rating: "9.2",
    ageRange: "17+",
    "נטפליקס": 1,
    "יס": 0,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=godfather_trailer_example",
    Duration: 175
  }
];

// פונקציה לטעינת מאגר סרטים
let moviesDatabase = null;

async function loadMoviesDatabase() {
  if (moviesDatabase) return moviesDatabase;
  
  try {
    console.log("📚 מנסה לטעון את מאגר הסרטים...");
    const response = await fetch('movies.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load movies: ${response.status} ${response.statusText}`);
    }
    
    moviesDatabase = await response.json();
    console.log(`✅ נטענו ${moviesDatabase.length} סרטים מהמאגר המקומי`);
    console.log("📊 דוגמה לסרט:", moviesDatabase[0]);
    return moviesDatabase;
  } catch (error) {
    console.error("❌ שגיאה בטעינת הסרטים:", error);
    console.log("⚠️ משתמש במאגר סרטים זמני");
    moviesDatabase = backupMovies;
    return moviesDatabase;
  }
}

// 📚 מאגר מילות מפתח להדרכת ה-AI
const keywordsForAI = {
  genres: {
    "אקשן": ["אקשן", "פעולה", "action", "קרב", "מרדף", "הרפתקה"],
    "קומדיה": ["קומדיה", "מצחיק", "comedy", "הומור", "צחוק", "מבדר", "קל", "קליל", "כיפי"],
    "דרמה": ["דרמה", "רגשי", "drama", "מרגש", "עצוב", "רציני", "נוגע ללב", "דרמטי"],
    "רומנטי": ["רומנטי", "אהבה", "romance", "זוגי", "רומנטיקה", "מתוק", "עדין"],
    "אימה": ["אימה", "מפחיד", "horror", "מבעית", "מצמרר", "דמים"],
    "מתח": ["מתח", "thriller", "מותחן", "ריגול"],
    "מדע בדיוני": ["מדע בדיוני", "sci-fi", "עתידני", "חלל", "רובוטים", "פנטזיה", "עתיד", "טכנולוגיה"],
    "פנטזיה": ["פנטזיה", "קסם", "דרקונים", "עולמות אחרים", "כישוף", "אגדה"],
    "אנימציה": ["אנימציה", "מצויר", "ילדים", "פיקסאר", "דיסני", "אנימה", "מנגה"],
    "תיעודי": ["תיעודי", "דוקומנטרי", "אמת", "מציאות", "היסטוריה", "טבע", "ביוגרפיה"],
    "ביוגרפיה": ["ביוגרפיה", "סיפור אמיתי", "חיים של", "אישיות", "היסטורי", "אדם אמיתי"],
    "היסטוריה": ["היסטוריה", "תקופה עתיקה", "עבר", "מלכים", "היסטורי"],
    "מוזיקלי": ["מוזיקלי", "שירים", "ריקוד", "מחזמר", "מוזיקה", "קליפים"],
    "מערבון": ["מערבון", "קאובוי", "פראי מערב", "סוסים", "אקדחים"],
    "פשע": ["פשע", "משטרה", "גניבה", "חוק", "פושעים", "בלש", "חקירה"],
    "מסתורין": ["מסתורין", "תעלומה", "בלש", "חקירה", "לא ברור", "חידה"],
    "משפחה": ["משפחה", "הורים", "אחים", "כיף לכל המשפחה"],
    "ספורט": ["ספורט", "כדורגל", "כדורסל", "אולימפיאדה", "תחרות", "נצחון"],
    "מלחמה": ["מלחמה", "קרב", "חיילים", "צבא", "היסטורי", "גבורה"]
  },
  moods: {
    "שמח": ["שמח", "מבדר", "קליל", "חיובי", "מאושר", "טוב לי", "מעולה", "מצוין", "נהדר", "כיפי"],
    "מרומם": ["מרומם", "מעורר השראה", "מוטיבציה", "הצלחה", "מעודד", "מחזק", "מעצים", "אופטימי"],
    "רגוע": ["רגוע", "נינוח", "שלווה", "מרגיע", "שליו", "מרגוע", "מנוחה", "שקט", "רפוי"],
    "עצוב": ["עצוב", "מעוצבן", "כועס", "עצבני", "מתסכל", "מעצבן", "מרגיז", "מעיק", "קשה", "רע לי"],
    "מרגש": ["מרגש", "נוגע ללב", "רגשי", "נוגע", "סוחף", "עוצמתי", "מותח"],
    "מפחיד": ["מפחיד", "מלחיץ", "מסתורי", "אימה", "מטריד", "מבהיל", "פחד", "בעתה", "חרדה"],
    "רומנטי": ["רומנטי", "אהבה", "זוגי", "רומנטיקה", "זוגיות", "מתוק", "דביק", "נשיקה"],
    "נוסטלגי": ["נוסטלגי", "זיכרונות", "ילדות", "עבר", "ישן", "קלאסי", "פעם", "זכרון", "עתיק"],
    "משעשע": ["משעשע", "מצחיק", "מבדר", "קליל", "הומור", "צחוק", "שעשוע", "בדיחה"]
  },
  platforms: {
    "נטפליקס": ["נטפליקס", "netflix"],
    "יס": ["יס", "yes"],
    "הוט": ["הוט", "hot"]
  },
  duration: {
    "קצר": ["קצר", "מהיר", "קליל", "קצת זמן", "לא יותר מידי", "משהו קטן", "עד שעה וחצי"],
    "בינוני": ["בינוני", "רגיל", "סטנדרטי", "נורמלי", "כשעתיים", "לא יותר מדי ארוך"],
    "ארוך": ["ארוך", "יותר משעתיים", "סרט ארוך", "אין לי בעיה עם זמן"]
  },
  commands: {
    "אחרים": ["אחרים", "נוספים", "עוד", "הבאים", "אחר"],
    "איפוס": ["התחל שיחה חדשה", "אפס", "חדש", "התחל מחדש"],
    "תודה": ["תודה", "תודה רבה", "תודות", "thanks", "thank you", "אני מרוצה", "מצאתי", "זה מה שחיפשתי"],
    "סיום": ["ביי", "להתראות", "עד הפעם הבאה", "bye", "goodbye", "נתראה", "תודה ושלום", "זהו", "סיימנו"]
  }
};

// עדכון זיכרון השיחה
let conversationMemory = {
  lastGenres: [],
  lastMoods: [],
  lastPlatforms: [],
  lastRecommendations: [],
  lastQuestion: null,
  userPreferences: {
    age: null,
    duration: null,
    favoriteActors: [],
    favoriteDirectors: []
  },
  conversationState: "collecting_info",
  collectedInfo: {
    genres: false,
    age: false,
    mood: false,
    duration: false,
    platforms: false
  },
  recommendationOffset: 0,
  conversationHistory: [] // היסטוריית השיחה ל-AI
};

const goodbyeMessages = [
  "תודה שהשתמשת באוסקר! 🎬 מקווה שתהנה מהסרט! עד הפעם הבאה! 👋",
  "היה כיף לעזור לך למצוא סרט! 🍿 בילוי נעים וחזור מתי שתרצה! 😊",
  "אני שמח שעזרתי! 🎭 תהנה מהצפייה ואשמח לראות אותך שוב! 🌟",
  "תודה על הביקור! 🎥 מקווה שהמלצותיי היו שימושיות. עד המפגש הבא! 🤗"
];

const thankYouMessages = [
  "על לא דבר! 😊 אני כאן בשבילך מתי שתרצה המלצות נוספות! 🎬",
  "אני שמח שעזרתי! 🎭 תהנה מהסרט ותחזור אליי מתי שתרצה! 🍿",
  "תמיד בשמחה! 🌟 מקווה שתהנה מהצפייה! אני כאן אם תצטרך עוד המלצות! 🎥",
  "זה בדיוק למה אני כאן! 😄 חזור אליי מתי שתרצה המלצות חדשות! 🎬"
];

// עדכון שאלות אינטראקטיביות
const interactiveQuestions = [
  {
    id: "genres",
    question: "איזה סוגי סרטים אתה אוהב? 🎭",
    keywords: ["ז'אנר", "סוג", "סרטים", "אוהב"],
    hasButtons: true,
    buttons: [
      { text: "🎬 אקשן", value: "אקשן" },
      { text: "😂 קומדיה", value: "קומדיה" },
      { text: "💖 דרמה", value: "דרמה" },
      { text: "💕 רומנטי", value: "רומנטי" },
      { text: "👻 אימה", value: "אימה" },
      { text: "🔍 מתח", value: "מתח" },
      { text: "🚀 מדע בדיוני", value: "מדע בדיוני" },
      { text: "🧙‍♂️ פנטזיה", value: "פנטזיה" },
      { text: "🎨 אנימציה", value: "אנימציה" },
      { text: "📚 תיעודי", value: "תיעודי" },
      { text: "👑 ביוגרפיה", value: "ביוגרפיה" },
      { text: "⚔️ היסטוריה", value: "היסטוריה" }
    ]
  },
  {
    id: "age",
    question: "מה הגיל שלך? זה יעזור לי להתאים סרטים מתאימים 👥",
    keywords: ["גיל", "בן", "בת", "ילד", "מבוגר"],
    hasButtons: false
  },
  {
    id: "duration",
    question: "כמה זמן יש לך לצפות בסרט? 🕒",
    keywords: ["זמן", "אורך", "כמה זמן", "משך"],
    hasButtons: true,
    buttons: [
      { text: "⏱️ פחות משעה וחצי", value: "קצר" },
      { text: "🕐 שעה וחצי - שעתיים", value: "בינוני" },
      { text: "🕰️ מעל שעתיים", value: "ארוך" }
    ]
  },
  {
    id: "platforms",
    question: "האם יש לך מנוי לנטפליקס, יס או הוט? 📺",
    keywords: ["פלטפורמה", "מנוי", "נטפליקס", "יס", "הוט"],
    hasButtons: true,
    buttons: [
      { text: "📺 נטפליקס", value: "נטפליקס" },
      { text: "📡 יס", value: "יס" },
      { text: "🔥 הוט", value: "הוט" },
      { text: "❌ אין לי מנויים", value: "אין מנויים" }
    ]
  }
];

// 🤖 פונקציה לניתוח טקסט באמצעות Gemini AI
async function analyzeTextWithAI(userMessage, conversationHistory = []) {
  try {
    console.log("🤖 שולח לניתוח ב-Gemini AI:", userMessage);
    
    // בניית הפרומפט ל-AI
    const prompt = `
אתה עוזר חכם לבוט המלצות סרטים בעברית בשם "אוסקר". 
המשימה שלך היא לנתח הודעות של משתמשים ולחלץ מידע רלוונטי להמלצות סרטים.

היסטוריית השיחה הקודמת:
${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

הודעה נוכחית של המשתמש: "${userMessage}"

אנא נתח את ההודעה וחלץ מידע בפורמט JSON הבא:
{
  "genres": [רשימת ז'אנרים בעברית, למשל: "אקשן", "קומדיה"],
  "ageRange": "7+" | "13+" | "17+" | null,
  "platforms": [רשימת פלטפורמות: "נטפליקס", "יס", "הוט"] | [],
  "duration": "קצר" | "בינוני" | "ארוך" | null,
  "mood": מצב רוח של המשתמש כמו "שמח", "עצוב", "מרגש" וכו' | null,
  "confidence": מספר בין 0-1 שמייצג כמה אתה בטוח בניתוח,
  "missingInfo": [רשימה של מה חסר: "genres", "age", "duration", "platforms"],
  "extractedInfo": "תקציר קצר של מה שהבנת מהמשתמש",
  "command": "אחרים" | "איפוס" | "תודה" | "סיום" | null
}

דוגמאות לז'אנרים: אקשן, קומדיה, דרמה, רומנטי, אימה, מתח, מדע בדיוני, פנטזיה, אנימציה, תיעודי, ביוגרפיה, היסטוריה, מוזיקלי, מערבון, פשע, מסתורין, משפחה, ספורט, מלחמה

חשוב:
- אם המשתמש לא ציין משהו בבירור, השאר null
- התעלם משגיאות כתיב והבן את הכוונה
- אם המשתמש אומר "אקשן" או "פעולה" - זה אותו ז'אנר
- אם המשתמש אומר "כן", "יש לי", "נטפליקס" - זה אומר שיש לו את הפלטפורמה
- אם המשתמש אומר "לא", "אין לי" - זה אומר שאין לו מנויים
- גילאים: 7-12 = "7+", 13-16 = "13+", 17+ = "17+"

השב רק בפורמט JSON, ללא הסבר נוסף.
`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    console.log("🤖 תשובת AI גולמית:", aiResponse);
    
    // ניסיון לפרסר את ה-JSON
    try {
      // ניקוי התשובה מסימנים מיותרים
      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      const parsedResponse = JSON.parse(cleanResponse);
      
      console.log("✅ AI ניתח בהצלחה:", parsedResponse);
      return parsedResponse;
      
    } catch (parseError) {
      console.error("❌ שגיאה בפרסור תשובת AI:", parseError);
      console.log("🔄 נופל חזרה לניתוח מקומי");
      return fallbackAnalysis(userMessage);
    }

  } catch (error) {
    console.error("❌ שגיאה ב-Gemini AI:", error);
    console.log("🔄 נופל חזרה לניתוח מקומי");
    return fallbackAnalysis(userMessage);
  }
}

// פונקציית גיבוי לניתוח מקומי (הקוד המקורי)
function fallbackAnalysis(text) {
  const lowerText = text.toLowerCase().trim();
  const analysis = {
    genres: [],
    ageRange: null,
    platforms: [],
    duration: null,
    mood: null,
    confidence: 0.7, // בטחון בינוני
    missingInfo: [],
    extractedInfo: "ניתוח מקומי של הטקסט",
    command: null
  };

  // זיהוי פקודות
  for (const [command, words] of Object.entries(keywordsForAI.commands)) {
    const wordMatch = words.some(word => {
      if (command === "סיום") {
        return lowerText === word || 
               lowerText.startsWith(word + " ") || 
               lowerText.endsWith(" " + word) ||
               lowerText.includes(" " + word + " ");
      } else {
        return lowerText.includes(word);
      }
    });

    if (wordMatch) {
      analysis.command = command;
      break;
    }
  }

  // זיהוי ז'אנרים
  for (const [genre, words] of Object.entries(keywordsForAI.genres)) {
    if (words.some(word => lowerText.includes(word))) {
      analysis.genres.push(genre);
    }
  }

  // זיהוי מצבי רוח
  for (const [mood, words] of Object.entries(keywordsForAI.moods)) {
    if (words.some(word => lowerText.includes(word))) {
      analysis.mood = mood;
      break; // רק מצב רוח אחד
    }
  }

  // זיהוי פלטפורמות
  const platformKeywords = {
    "נטפליקס": ["נטפליקס", "netflix", "כן", "יש", "יש לי"],
    "יס": ["יס", "yes", "כן", "יש", "יש לי"],
    "הוט": ["הוט", "hot", "כן", "יש", "יש לי"]
  };

  for (const [platform, keywords] of Object.entries(platformKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword) || lowerText === keyword)) {
      analysis.platforms.push(platform);
    }
  }

  const negativeKeywords = ["לא", "אין", "אין לי", "אף אחד"];
  if (negativeKeywords.some(keyword => lowerText === keyword || lowerText.includes(keyword))) {
    analysis.platforms = [];
  }

  // זיהוי אורך סרט
  for (const [duration, words] of Object.entries(keywordsForAI.duration)) {
    if (words.some(word => lowerText.includes(word))) {
      analysis.duration = duration;
      break;
    }
  }

  // זיהוי גיל
  const agePatterns = [
    /(\d+)\s*(?:שנה|שנים|גיל)/,
    /בן\s*(\d+)/,
    /בת\s*(\d+)/,
    /אני\s*(\d+)/,
    /(\d+)\s*אני/,
    /^(\d+)$/
  ];

  for (const pattern of agePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const age = parseInt(match[1]);
      if (!isNaN(age)) {
        if (age >= 7 && age <= 12) analysis.ageRange = "7+";
        else if (age >= 13 && age <= 16) analysis.ageRange = "13+";
        else if (age >= 17) analysis.ageRange = "17+";
        break;
      }
    }
  }

  // בדיקת מידע חסר
  if (analysis.genres.length === 0) analysis.missingInfo.push("genres");
  if (!analysis.ageRange) analysis.missingInfo.push("age");
  if (!analysis.duration) analysis.missingInfo.push("duration");
  if (analysis.platforms.length === 0) analysis.missingInfo.push("platforms");

  return analysis;
}

// פונקציה לניתוח טקסט - עכשיו משתמשת ב-AI
async function analyzeText(text) {
  console.log("🔍 מתחיל ניתוח טקסט:", text);
  
  // שליחה ל-AI לניתוח
  const aiAnalysis = await analyzeTextWithAI(text, conversationMemory.conversationHistory);
  
  // הוספת ההודעה להיסטוריה
  conversationMemory.conversationHistory.push({
    role: "user",
    content: text
  });
  
  // שמירה רק של 10 ההודעות האחרונות
  if (conversationMemory.conversationHistory.length > 10) {
    conversationMemory.conversationHistory = conversationMemory.conversationHistory.slice(-10);
  }
  
  console.log("🎯 תוצאת ניתוח סופית:", aiAnalysis);
  return aiAnalysis;
}

// פונקציה לחישוב דמיון בין סרטים
function calculateSimilarity(movie1, movie2) {
  let score = 0;
  
  const genres1 = movie1.Genres.toLowerCase().split(", ");
  const genres2 = movie2.Genres.toLowerCase().split(", ");
  const commonGenres = genres1.filter(g => genres2.includes(g));
  score += commonGenres.length * 2;

  const ratingDiff = Math.abs(parseFloat(movie1.Rating) - parseFloat(movie2.Rating));
  score += (10 - ratingDiff) * 0.5;

  const yearDiff = Math.abs(movie1.Release_Year - movie2.Release_Year);
  score += (10 - Math.min(yearDiff, 10)) * 0.3;

  return score;
}

// פונקציה לזיהוי טקסט לא ברור
function isUnclearText(text) {
  if (text.length < 2) return true;
  if (/^[\s\p{P}]+$/u.test(text)) return true;
  if (/^\d+$/.test(text)) return true;
  if (/^[א-ת]{1,2}$/.test(text)) return true;
  if (/^[^א-תa-zA-Z0-9\s]+$/.test(text)) return true;
  
  return false;
}

// פונקציה לבדיקת הבנה של תשובה - עודכנה לעבוד עם AI
function checkUnderstanding(message, questionId) {
  // אם ה-AI זיהה פקודה ברורה, זה נחשב כהבנה
  return !isUnclearText(message);
}

// פונקציה לקבלת שאלה הבאה
function getNextQuestion() {
  const allInfoCollected = Object.values(conversationMemory.collectedInfo).every(info => info === true);
  if (allInfoCollected) {
    return null;
  }

  const questionOrder = ["genres", "age", "duration", "platforms"];
  
  for (const questionId of questionOrder) {
    if (!conversationMemory.collectedInfo[questionId]) {
      return interactiveQuestions.find(q => q.id === questionId);
    }
  }

  return null;
}

// פונקציה ליצירת כפתורים אינטראקטיביים
function createInteractiveButtons(question) {
  if (!question.hasButtons) return '';
  
  const buttonId = `buttons-${Date.now()}`;
  let buttonsHTML = `<div class="interactive-buttons" id="${buttonId}">`;
  
  question.buttons.forEach((button, index) => {
    buttonsHTML += `
      <button class="choice-button" onclick="handleButtonClick('${button.value}', '${buttonId}')">
        ${button.text}
      </button>
    `;
  });
  
  buttonsHTML += '</div>';
  return buttonsHTML;
}

// פונקציה לטיפול בלחיצה על כפתור
function handleButtonClick(value, buttonId) {
  // הסרת הכפתורים לאחר הבחירה
  const buttonsContainer = document.getElementById(buttonId);
  if (buttonsContainer) {
    buttonsContainer.remove();
  }
  
  // הוספת תשובת המשתמש לשיחה
  const convo = document.getElementById("conversation");
  convo.innerHTML += `<div class='bubble user'>${value}</div>`;
  
  // עיבוד התשובה
  processUserChoice(value);
  
  convo.scrollTop = convo.scrollHeight;
}

// פונקציה לעיבוד בחירת המשתמש
async function processUserChoice(choice) {
  const convo = document.getElementById("conversation");
  const loadingId = Date.now();
  
  convo.innerHTML += `<div class='bubble bot' id='loading-${loadingId}'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">🤖 מעבד את הבחירה שלך...</div>
  </div>`;

  try {
    const movies = await loadMoviesDatabase();
    const smartResponse = await generateSmartResponse(choice, movies);

    document.getElementById(`loading-${loadingId}`).remove();
    convo.innerHTML += `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">${smartResponse}</div>
    </div>`;

  } catch (error) {
    const loadingElement = document.getElementById(`loading-${loadingId}`);
    if (loadingElement) loadingElement.remove();
    
    console.error("❌ שגיאה:", error);
    showError(error);
  }

  convo.scrollTop = convo.scrollHeight;

  const allInfoCollected = Object.values(conversationMemory.collectedInfo).every(info => info === true);
  if (allInfoCollected) {
    return null;
  }

  const questionOrder = ["genres", "age", "duration", "platforms"];
  
  for (const questionId of questionOrder) {
    if (!conversationMemory.collectedInfo[questionId]) {
      return interactiveQuestions.find(q => q.id === questionId);
    }
  }

  return null;
}

// פונקציה ליצירת תשובה חכמה - עודכנה לעבוד עם AI
async function generateSmartResponse(message, movies) {
  const analysis = await analyzeText(message);
  let response = "";

  console.log("Debug: generateSmartResponse - analysis from AI:", analysis);
  console.log("Debug: generateSmartResponse - conversationMemory before update:", { ...conversationMemory });

  if (analysis.command === "תודה") {
    const randomThankYou = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
    return randomThankYou;
  }
  
  if (analysis.command === "סיום") {
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
    // איפוס השיחה
    conversationMemory = {
      lastGenres: [],
      lastMoods: [],
      lastPlatforms: [],
      lastRecommendations: [],
      lastQuestion: null,
      userPreferences: {
        age: null,
        duration: null,
        favoriteActors: [],
        favoriteDirectors: []
      },
      conversationState: "collecting_info",
      collectedInfo: {
        genres: false,
        age: false,
        mood: false,
        duration: false,
        platforms: false
      },
      recommendationOffset: 0,
      conversationHistory: []
    };
    return randomGoodbye;
  }

  // שינוי חשוב: לא לאפס offset אם זה רק מידע משלים
  const isNewGenreRequest = analysis.genres && analysis.genres.length > 0 && 
    (conversationMemory.lastGenres.length === 0 || 
     JSON.stringify(analysis.genres) !== JSON.stringify(conversationMemory.lastGenres));

  if (isNewGenreRequest) {
    conversationMemory.recommendationOffset = 0;
    console.log("Debug: generateSmartResponse - New genre request detected, resetting offset to 0.");
  } else if (analysis.command === "אחרים") {
    conversationMemory.recommendationOffset += 3;
    console.log("Debug: generateSmartResponse - 'Other' command detected, incrementing offset to:", conversationMemory.recommendationOffset);
  }

  // עדכון זיכרון השיחה על בסיס ניתוח ה-AI
  if (analysis.genres && analysis.genres.length > 0) {
    conversationMemory.lastGenres = analysis.genres;
    conversationMemory.collectedInfo.genres = true;
  }

  if (analysis.mood) {
    conversationMemory.lastMoods = [analysis.mood];
  }
  
  if (analysis.platforms && analysis.platforms.length > 0) {
    conversationMemory.lastPlatforms = analysis.platforms;
    conversationMemory.collectedInfo.platforms = true;
  } else if (analysis.platforms && analysis.platforms.length === 0 && 
             message.toLowerCase().includes("לא") || message.toLowerCase().includes("אין")) {
    // המשתמש אמר שאין לו מנויים
    conversationMemory.lastPlatforms = [];
    conversationMemory.collectedInfo.platforms = true;
  }
  
  if (analysis.ageRange) {
    conversationMemory.userPreferences.age = analysis.ageRange;
    conversationMemory.collectedInfo.age = true;
  }
  
  if (analysis.duration) {
    conversationMemory.userPreferences.duration = analysis.duration;
    conversationMemory.collectedInfo.duration = true;
  }

  console.log("Debug: generateSmartResponse - conversationMemory after update:", { ...conversationMemory });

  // בדיקה אם יש מספיק מידע להמלצות
  const infoTypesToCollect = ["genres", "age", "duration", "platforms"];
  const allRequiredInfoCollected = infoTypesToCollect.every(type => conversationMemory.collectedInfo[type] === true);

  console.log("Debug: generateSmartResponse - allRequiredInfoCollected:", allRequiredInfoCollected);

  if (allRequiredInfoCollected) {
    conversationMemory.conversationState = "recommending";
    
    console.log("🎯 מחפש סרטים עם הז'אנרים:", conversationMemory.lastGenres);
    
    const foundMovies = analyzeAndFindMovies(message, movies);
    const moviesToRecommend = foundMovies.slice(conversationMemory.recommendationOffset, conversationMemory.recommendationOffset + 3);

    if (moviesToRecommend.length > 0) {
      response += "<br><br>הנה כמה המלצות בשבילך:<br><br>";
      
      moviesToRecommend.forEach((movie, index) => {
        response += `${index + 1}. ${formatMovieRecommendation(movie)}<br><br>`;
      });
      
      if (foundMovies.length > (conversationMemory.recommendationOffset + 3)) {
        response += "<br>רוצה לראות המלצות נוספות? פשוט תגיד 'עוד' או 'אחרים'! 😉<br>";
      }

      // הוספת תגובה מותאמת למצב רוח
      if (analysis.mood) {
        const mood = analysis.mood;
        switch(mood) {
          case "עצוב":
            response += "💝 מקווה שהסרטים האלה יעזרו לשפר את מצב הרוח שלך!";
            break;
          case "מרגש":
            response += "💖 מקווה שתהנה מהסרטים המרגשים האלה!";
            break;
          case "רומנטי":
            response += "💕 מקווה שתהנה מהסרטים הרומנטיים האלה!";
            break;
          case "מרומם":
            response += "✨ מקווה שהסרטים האלה יעוררו בך השראה!";
            break;
          case "נוסטלגי":
            response += "🌟 מקווה שהסרטים האלה יעירו זיכרונות נעימים!";
            break;
          case "משעשע":
            response += "😊 מקווה שהסרטים האלה יעלו לך חיוך!";
            break;
        }
      }

    } else {
      if (conversationMemory.recommendationOffset > 0) {
        response += "<br><br>זהו, נראה שאלו כל הסרטים שמצאתי עבור ההעדפות הנוכחיות שלך. אולי ננסה עם העדפות אחרות? 😉";
      } else {
        response += "<br><br>מצטער, לא מצאתי סרטים שמתאימים בדיוק להעדפות שלך.";
      }
      
      // איפוס מחדש רק אם לא נמצאו סרטים בכלל
      conversationMemory.collectedInfo = {
        genres: false,
        age: false,
        mood: false,
        duration: false,
        platforms: false
      };
      conversationMemory.lastGenres = [];
      conversationMemory.lastPlatforms = [];
      conversationMemory.userPreferences.age = null;
      conversationMemory.userPreferences.duration = null;
      conversationMemory.recommendationOffset = 0;

      const nextQuestion = getNextQuestion();
      if (nextQuestion) {
        response += ` אולי ננסה שוב? ${nextQuestion.question}`;
        conversationMemory.lastQuestion = nextQuestion.id;
      } else {
        response += " אנא נסה לתאר את הסרט שאתה מחפש במילים אחרות.";
        conversationMemory.lastQuestion = null;
      }
    }
  } else {
    const nextQuestion = getNextQuestion();
    console.log("Debug: generateSmartResponse - nextQuestion:", nextQuestion ? nextQuestion.id : null);

    const providedInfo = [];
    if(analysis.genres && analysis.genres.length > 0) providedInfo.push("ז'אנר");
    if(analysis.ageRange) providedInfo.push("גיל");
    if(analysis.duration) providedInfo.push("אורך סרט");
    if(analysis.platforms && analysis.platforms.length > 0) providedInfo.push("פלטפורמת צפייה");

    if(providedInfo.length > 0) {
      response += `תודה על המידע שסיפקת בנוגע ל${providedInfo.join(' ו-')}.`;
      if (analysis.mood) {
        response += ` אני מבין שאתה מרגיש ${analysis.mood}.`;
      }
      response += " <br><br>";
    } else {
      if (analysis.mood) {
        response += `אני מבין שאתה מרגיש ${analysis.mood}.`;
        response += " <br><br>";
      } else if (!isUnclearText(message)) {
        response += "תודה על המידע. ";
        response += " <br><br>";
      }
    }

    if (nextQuestion) {
      response += `${nextQuestion.question}`;
      
      // הוספת כפתורים אינטראקטיביים אם יש
      if (nextQuestion.hasButtons) {
        response += "<br><br>" + createInteractiveButtons(nextQuestion);
      }
      
      conversationMemory.lastQuestion = nextQuestion.id;
    }
  }

  // הוספת תשובת הבוט להיסטוריה
  conversationMemory.conversationHistory.push({
    role: "assistant",
    content: response
  });

  console.log("Debug: generateSmartResponse - Final response length:", response.length);
  return response || "אשמח לעזור לך למצוא סרט מושלם! מה מעניין אותך?";
}

// פונקציה לחיפוש סרטים - עודכנה לעבוד עם נתוני AI
function analyzeAndFindMovies(message, movies) {
  let filtered = [...movies];

  console.log("🔍 מחפש סרטים על בסיס זיכרון השיחה");
  console.log("🎯 מחפש ז'אנרים:", conversationMemory.lastGenres);
    
  // סינון לפי ז'אנר
  if (conversationMemory.lastGenres.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by genres:", conversationMemory.lastGenres);
    filtered = filtered.filter(movie => {
      const movieGenres = movie.Genres.toLowerCase().split(", ");
      
      return conversationMemory.lastGenres.some(requestedGenre => {
        const englishGenre = getEnglishGenre(requestedGenre);
        const englishGenreWords = englishGenre.toLowerCase().split(/[\s-]+/);
        
        const genreMatch = movieGenres.some(movieGenre => {
          return englishGenreWords.some(word => movieGenre.includes(word));
        });
        
        console.log(`Debug: Checking if movie genres [${movieGenres.join(', ')}] include requested genre '${requestedGenre}' (English: '${englishGenre}'): ${genreMatch}`);
        return genreMatch;
      });
    });
    console.log("Debug: analyzeAndFindMovies - Movies after genre filtering:", filtered.map(m => m.Title));
  }

  // סינון לפי מצב רוח
  if (conversationMemory.lastMoods.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by mood. Current movies:", filtered.map(m => m.Title));
    const mood = conversationMemory.lastMoods[0];
    switch(mood) {
      case "עצוב":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("comedy") || 
          movie.Genres.toLowerCase().includes("קומדיה")
        );
        break;
      case "מרגש":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("drama") || 
          movie.Genres.toLowerCase().includes("דרמה")
        );
        break;
      case "רומנטי":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("romance") || 
          movie.Genres.toLowerCase().includes("רומנטי")
        );
        break;
      case "מרומם":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("drama") || 
          movie.Genres.toLowerCase().includes("דרמה") ||
          movie.Genres.toLowerCase().includes("biography") ||
          movie.Genres.toLowerCase().includes("ביוגרפי")
        );
        break;
      case "נוסטלגי":
        filtered = filtered.filter(movie => 
          movie.Release_Year < 2000
        );
        break;
      case "משעשע":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("comedy") || 
          movie.Genres.toLowerCase().includes("קומדיה")
        );
        break;
    }
    console.log("Debug: analyzeAndFindMovies - Movies after mood filtering:", filtered.map(m => m.Title));
  }

  // סינון לפי פלטפורמה
  if (conversationMemory.lastPlatforms.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by platforms. Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie => 
      conversationMemory.lastPlatforms.some(platform => movie[platform] === 1)
    );
    console.log("Debug: analyzeAndFindMovies - Movies after platform filtering:", filtered.map(m => m.Title));
  }

  // סינון לפי גיל
  if (conversationMemory.userPreferences.age) {
    console.log("Debug: analyzeAndFindMovies - Filtering by age. User preference:", conversationMemory.userPreferences.age, ". Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie => {
      const movieAgeRange = movie.ageRange;
      const userAgePreference = conversationMemory.userPreferences.age;
      let isMatch = false;

      if (movieAgeRange === "All Ages") {
        isMatch = true;
      } else {
        if (userAgePreference === "7+") {
          isMatch = (movieAgeRange === "7+");
        } else if (userAgePreference === "13+") {
          isMatch = (movieAgeRange === "7+" || movieAgeRange === "13+");
        } else if (userAgePreference === "17+") {
          isMatch = true;
        }
      }
      
      console.log(`Debug: Checking movie '${movie.Title}' (age: ${movie.ageRange}) against user preference '${conversationMemory.userPreferences.age}'. Match: ${isMatch}`);
      return isMatch;
    });
    console.log("Debug: analyzeAndFindMovies - Movies after age filtering:", filtered.map(m => m.Title));
  }

  // סינון לפי אורך סרט
  if (conversationMemory.userPreferences.duration) {
    console.log("Debug: analyzeAndFindMovies - Filtering by duration. User preference:", conversationMemory.userPreferences.duration, ". Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie => {
      const duration = movie.Duration || 0;
      if (conversationMemory.userPreferences.duration === "קצר") return duration <= 90;
      if (conversationMemory.userPreferences.duration === "בינוני") return duration > 90 && duration <= 120;
      if (conversationMemory.userPreferences.duration === "ארוך") return duration > 120;
      return true;
    });
    console.log("Debug: analyzeAndFindMovies - Movies after duration filtering:", filtered.map(m => m.Title));
  }

  // מיון לפי דירוג
  filtered.sort((a, b) => parseFloat(b.Rating) - parseFloat(a.Rating));

  // שמירת ההמלצות בזיכרון
  if (filtered.length > 0) {
    conversationMemory.lastRecommendations = filtered.slice(0, 3);
  }

  console.log("🎯 סה״כ סרטים שנמצאו:", filtered.length);
  console.log("🏆 סרטים סופיים:", filtered.map(m => `${m.Title} (${m.Genres})`));

  return filtered;
}

// פונקציה להמרת ז'אנר עברי לאנגלי
function getEnglishGenre(hebrewGenre) {
  const genreMap = {
    "אקשן": "Action",
    "קומדיה": "Comedy", 
    "דרמה": "Drama",
    "רומנטי": "Romance",
    "אימה": "Horror",
    "מתח": "Thriller",
    "מדע בדיוני": "Sci-Fi",
    "פנטזיה": "Fantasy",
    "אנימציה": "Animation",
    "תיעודי": "Documentary",
    "ביוגרפיה": "Biography",
    "היסטוריה": "History",
    "מוזיקלי": "Musical",
    "מערבון": "Western",
    "פשע": "Crime",
    "מסתורין": "Mystery",
    "משפחה": "Family",
    "ספורט": "Sport",
    "מלחמה": "War",
    "הרפתקה": "Adventure"
  };
  console.log(`Debug: getEnglishGenre - Mapping '${hebrewGenre}' to '${genreMap[hebrewGenre] || hebrewGenre}'`);
  return genreMap[hebrewGenre] || hebrewGenre;
}

// פורמט הצגת סרט
function formatMovieRecommendation(movie) {
  const platforms = [];
  if (movie["נטפליקס"] === 1) platforms.push("נטפליקס");
  if (movie["יס"] === 1) platforms.push("יס");
  if (movie["הוט"] === 1) platforms.push("הוט");

  let trailerLinkHTML = '';
  if (movie.trailer) {
      trailerLinkHTML = `<br>🎥 <a href="${movie.trailer}" target="_blank" class="movie-link">צפה בטריילר</a>`;
  } else {
      const searchQuery = encodeURIComponent(`${movie.Title} ${movie.Release_Year} trailer`);
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
      trailerLinkHTML = `<br>🎥 <a href="${youtubeSearchUrl}" target="_blank" class="movie-link">חפש טריילר ביוטיוב</a>`;
  }

  let html = `🎬 <strong>"${movie.Title}"</strong> (${movie.Release_Year})<br>
🎭 ז'אנר: ${movie.Genres}<br>
⭐ דירוג IMDb: <strong>${movie.Rating}</strong><br>
👥 גיל מומלץ: ${movie.ageRange}<br>
📺 זמין ב: ${platforms.join(", ") || "לא צוינה פלטפורמה"}`;

  html += trailerLinkHTML;

  return html;
}

// פונקציה לשליחת הודעה - עודכנה לעבוד עם AI
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";

  const lowerMessage = message.toLowerCase();
  const greetings = ["היי", "שלום", "הי", "בוקר טוב"];
  const resetKeywords = ["התחל שיחה חדשה", "אפס", "חדש"];

  const convo = document.getElementById("conversation");

  if (resetKeywords.some(k => lowerMessage.includes(k))) {
    clearConversation(message);
    convo.scrollTop = convo.scrollHeight;
    return;
  }

  if (greetings.some(g => lowerMessage.includes(g))) {
    convo.innerHTML += `<div class='bubble user'>${message}</div>`;
    const welcomeResponse = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    convo.innerHTML += `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">${welcomeResponse}</div>
    </div>`;
    convo.scrollTop = convo.scrollHeight;
    return;
  }

  convo.innerHTML += `<div class='bubble user'>${message}</div>`;
  const loadingId = Date.now();
  convo.innerHTML += `<div class='bubble bot' id='loading-${loadingId}'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">🤖 מעבד את ההודעה שלך באמצעות AI...</div>
  </div>`;

  try {
    const movies = await loadMoviesDatabase();
    const smartResponse = await generateSmartResponse(message, movies);

    document.getElementById(`loading-${loadingId}`).remove();
    convo.innerHTML += `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">${smartResponse}</div>
    </div>`;

  } catch (error) {
    const loadingElement = document.getElementById(`loading-${loadingId}`);
    if (loadingElement) loadingElement.remove();
    
    console.error("❌ שגיאה:", error);
    showError(error);
  }

  convo.scrollTop = convo.scrollHeight;
}

// פונקציה לטיפול בשגיאות
function showError(error) {
  const convo = document.getElementById("conversation");
  let errorMessage = "אופס! משהו השתבש. בוא ננסה שוב? 🔧";
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    if (error.message.includes("Failed to load movies")) {
      errorMessage = `⚠️ לא הצלחתי לטעון את מאגר הסרטים.<br>
        אנא וודא שקובץ movies.json קיים ונגיש.`;
    } else if (error.message.includes("Gemini API error")) {
      errorMessage = `🤖 יש בעיה עם שירות ה-AI.<br>
        אני עובר לניתוח מקומי לטוב אותך! 🔄`;
    }
  }
  
  convo.innerHTML += `<div class='bubble bot'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">${errorMessage}</div>
  </div>`;
}

// אירועי מקלדת ופתיחה
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 העמוד נטען - מתחיל אתחול עם AI...");
  
  const input = document.getElementById("userInput");
  const convo = document.getElementById("conversation");
  
  if (!input || !convo) {
    console.error("❌ אלמנטים חיוניים לא נמצאו");
    return;
  }
  
  console.log("✅ אלמנטים נמצאו בהצלחה");
  
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  console.log("✅ Event listener הוגדר לקלט");

  try {
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    console.log("🎭 הודעת ברוכים הבאים נבחרה:", randomWelcome);
    
    convo.innerHTML = `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">${randomWelcome}</div>
    </div>`;
    
    console.log("✅ הודעת פתיחה נוספה בהצלחה");
  } catch (error) {
    console.error("❌ שגיאה בהוספת הודעת פתיחה:", error);
    
    convo.innerHTML = `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">שלום! אני אוסקר, בוט המלצות הסרטים שלך עם AI! 🎬🤖 איזה סרט מעניין אותך היום?</div>
    </div>`;
  }
  
  console.log("🎉 אתחול הושלם בהצלחה - אוסקר עם AI מוכן לשימוש!");
});

// פונקציה לניקוי השיחה
function clearConversation(userMessage = null) {
  const convo = document.getElementById("conversation");
  convo.innerHTML = '';
  conversationMemory = {
    lastGenres: [],
    lastMoods: [],
    lastPlatforms: [],
    lastRecommendations: [],
    lastQuestion: null,
    userPreferences: {
      age: null,
      duration: null,
      favoriteActors: [],
      favoriteDirectors: []
    },
    conversationState: "collecting_info",
    collectedInfo: {
      genres: false,
      age: false,
      mood: false,
      duration: false,
      platforms: false
    },
    recommendationOffset: 0,
    conversationHistory: []
  };
  
  if (userMessage) {
    convo.innerHTML += `<div class='bubble user'>${userMessage}</div>`;
  }

  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  convo.innerHTML += `<div class='bubble bot'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">${randomWelcome}</div>
  </div>`;
}
