// 🎭 אוסקר - בוט המלצות סרטים מושלם עם AI
// גרסה מעודכנת ומתוקנת - יוני 2025

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
    Title: "Life is Beautiful",
    Release_Year: 1997,
    Genres: "Comedy, Drama, Romance",
    Rating: "8.6",
    ageRange: "13+",
    "נטפליקס": 1,
    "יס": 1,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=pAYEQP8gx3w",
    Duration: 116
  },
  {
    Title: "Back to the Future",
    Release_Year: 1985,
    Genres: "Adventure, Comedy, Sci-Fi",
    Rating: "8.5",
    ageRange: "7+",
    "נטפליקס": 1,
    "יס": 0,
    "הוט": 1,
    trailer: "https://www.youtube.com/watch?v=qvsgGtivCgs",
    Duration: 116
  },
  {
    Title: "Untouchable",
    Release_Year: 2011,
    Genres: "Biography, Comedy, Drama",
    Rating: "8.5",
    ageRange: "13+",
    "נטפליקס": 1,
    "יס": 1,
    "הוט": 0,
    trailer: "https://www.youtube.com/watch?v=34WIbmXkewU",
    Duration: 112
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
    return moviesDatabase;
  } catch (error) {
    console.error("❌ שגיאה בטעינת הסרטים:", error);
    console.log("⚠️ משתמש במאגר סרטים זמני");
    moviesDatabase = backupMovies;
    return moviesDatabase;
  }
}

// זיכרון השיחה המעודכן
let conversationMemory = {
  lastGenres: [],
  lastMoods: [],
  lastPlatforms: [],
  lastRecommendations: [],
  lastQuestion: null,
  userPreferences: {
    age: null,
    gender: null,
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
  conversationHistory: [],
  mentionedTopics: {
    mood: false,
    welcomeGiven: false
  }
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

const interactiveQuestions = [
  {
    id: "genres",
    question: "איזה סוגי סרטים אתה אוהב? 🎭",
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
    hasButtons: false
  },
  {
    id: "duration",
    question: "כמה זמן יש לך לצפות בסרט? 🕒",
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
    hasButtons: true,
    buttons: [
      { text: "📺 נטפליקס", value: "נטפליקס" },
      { text: "📡 יס", value: "יס" },
      { text: "🔥 הוט", value: "הוט" },
      { text: "❌ אין לי מנויים", value: "אין מנויים" }
    ]
  }
];

// 🔧 פונקציה משופרת לניתוח טקסט עם AI
async function analyzeTextWithAI(userMessage, conversationHistory = []) {
  try {
    console.log("🤖 שולח לניתוח ב-Gemini AI:", userMessage);
    
    const prompt = `
אתה עוזר חכם לבוט המלצות סרטים בעברית בשם "אוסקר". 
תפקידך לנתח בדקדקנות מה המשתמש רוצה ולזהות את כל המידע הרלוונטי.

היסטוריית השיחה הקודמת:
${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

הודעה נוכחית של המשתמש: "${userMessage}"

🔧 חשוב מאוד - זיהוי מקרים מיוחדים:

**זיהוי "לא יודע/לא בטוח":**
- "לא יודע", "לא יודעת", "לא בטוח", "לא בטוחה"
- "אין לי מושג", "לא החלטתי", "תלוי"
- אם זה בהקשר של פלטפורמות = יש גישה לכל הפלטפורמות

**זיהוי מגדר מדויק:**
- זכר: "אוהב", "בן X", "מחפש", פועל עבר זכר
- נקבה: "אוהבת", "בת X", "מחפשת", פועל עבר נקבה

**זיהוי גיל:**
- כל מספר בין 5-120 = גיל
- "בן/בת X" = גיל + מגדר

**זיהוי פלטפורמות:**
- ישיר: "נטפליקס", "יס", "הוט"
- שלילי: "אין לי מנויים", "אין מנויים" = רשימה ריקה []
- "כן" או "יש לי" (לאחר שאלה על פלטפורמה) = כל הפלטפורמות

**זיהוי ז'אנרים:**
- ישיר: "אקשן", "קומדיה", "דרמה"
- עקיף: "משהו מצחיק" = קומדיה, "משהו מפחיד" = אימה

השב בפורמט JSON:
{
  "genres": [רק ז'אנרים מההודעה הנוכחית],
  "ageRange": "7+" | "13+" | "17+" | null,
  "gender": "male" | "female" | null,
  "platforms": [רשימת פלטפורמות או null],
  "duration": "קצר" | "בינוני" | "ארוך" | null,
  "mood": מצב רוח,
  "isNewMoodMention": true אם זו הפעם הראשונה,
  "confidence": 0-1,
  "isUnsureResponse": true אם המשתמש אמר "לא יודע",
  "extractedInfo": "תקציר",
  "command": "אחרים" | "תודה" | "סיום" | null,
  "intentType": "giving_new_info" | "asking_for_recommendations" | "requesting_more" | "casual_chat"
}

השב רק בפורמט JSON.
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    try {
      const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
      const parsedResponse = JSON.parse(cleanResponse);
      
      console.log("✅ AI ניתח בהצלחה:", parsedResponse);
      return parsedResponse;
      
    } catch (parseError) {
      console.log("🔄 נופל חזרה לניתוח מקומי");
      return enhancedFallbackAnalysis(userMessage);
    }

  } catch (error) {
    console.log("🔄 נופל חזרה לניתוח מקומי");
    return enhancedFallbackAnalysis(userMessage);
  }
}

// 🔧 פונקציית גיבוי משופרת לניתוח מקומי
function enhancedFallbackAnalysis(text) {
  const lowerText = text.toLowerCase().trim();
  const analysis = {
    genres: [],
    ageRange: null,
    gender: null,
    platforms: null,
    duration: null,
    mood: null,
    isNewMoodMention: false,
    confidence: 0.8,
    isUnsureResponse: false,
    extractedInfo: "ניתוח מקומי משופר",
    command: null,
    intentType: "giving_new_info"
  };

  // 🔧 זיהוי "לא יודע" מדויק יותר
  const unsurePatterns = [
    "לא יודע", "לא יודעת", "לא בטוח", "לא בטוחה",
    "אין לי מושג", "לא החלטתי", "תלוי", "אולי"
  ];
  
  analysis.isUnsureResponse = unsurePatterns.some(pattern => lowerText.includes(pattern));

  // זיהוי ז'אנרים
  const genrePatterns = {
    "קומדיה": ["קומדיה", "מצחיק", "comedy", "משהו מצחיק", "בא לי לצחוק"],
    "אקשן": ["אקשן", "פעולה", "action", "משהו עם פעולה"],
    "דרמה": ["דרמה", "רגשי", "drama", "משהו רגשי"],
    "רומנטי": ["רומנטי", "אהבה", "romance", "משהו רומנטי"],
    "אימה": ["אימה", "מפחיד", "horror", "משהו מפחיד"],
    "מתח": ["מתח", "thriller", "מותחן", "משהו מותח"]
  };

  for (const [genre, patterns] of Object.entries(genrePatterns)) {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      analysis.genres.push(genre);
    }
  }

  // זיהוי מגדר מהשפה - מדויק יותר
  const malePatterns = ["אוהב", "בן ", "מחפש", "רוצה לראות", "אני גבר"];
  const femalePatterns = ["אוהבת", "בת ", "מחפשת", "רוצה לראות", "אני אישה"];
  
  if (malePatterns.some(pattern => lowerText.includes(pattern))) {
    analysis.gender = "male";
  } else if (femalePatterns.some(pattern => lowerText.includes(pattern))) {
    analysis.gender = "female";
  }

  // זיהוי גיל
  const agePatterns = [
    /(?:^|\s)(\d+)(?:\s|$)/, // מספר עומד לבד
    /(?:אני )?בן\s*(\d+)/, 
    /(?:אני )?בת\s*(\d+)/, 
    /גיל\s*(\d+)/
  ];

  for (const pattern of agePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const age = parseInt(match[1]);
      if (!isNaN(age) && age >= 5 && age <= 120) {
        if (age >= 7 && age <= 12) analysis.ageRange = "7+";
        else if (age >= 13 && age <= 16) analysis.ageRange = "13+";
        else if (age >= 17) analysis.ageRange = "17+";
        
        if (match[0].includes("בן")) analysis.gender = "male";
        if (match[0].includes("בת")) analysis.gender = "female";
        break;
      }
    }
  }

  // זיהוי פלטפורמות
  const platforms = [];
  if (lowerText.includes("נטפליקס")) platforms.push("נטפליקס");
  if (lowerText.includes("יס")) platforms.push("יס");
  if (lowerText.includes("הוט")) platforms.push("הוט");
  
  if (platforms.length > 0) {
    analysis.platforms = platforms;
  } else if (lowerText.includes("אין לי מנויים") || lowerText.includes("אין מנויים")) {
    analysis.platforms = [];
  }

  // זיהוי פקודות
  if (["עוד", "אחרים", "נוספים"].some(cmd => lowerText.includes(cmd))) {
    analysis.command = "אחרים";
    analysis.intentType = "requesting_more";
  } else if (["תודה", "thanks"].some(cmd => lowerText.includes(cmd))) {
    analysis.command = "תודה";
  } else if (["ביי", "להתראות"].some(cmd => lowerText.includes(cmd))) {
    analysis.command = "סיום";
  }

  return analysis;
}

// פונקציה לניתוח טקסט
async function analyzeText(text) {
  console.log("🔍 מתחיל ניתוח טקסט:", text);
  
  const aiAnalysis = await analyzeTextWithAI(text, conversationMemory.conversationHistory);
  
  conversationMemory.conversationHistory.push({
    role: "user",
    content: text
  });
  
  if (conversationMemory.conversationHistory.length > 10) {
    conversationMemory.conversationHistory = conversationMemory.conversationHistory.slice(-10);
  }
  
  console.log("🎯 תוצאת ניתוח סופית:", aiAnalysis);
  return aiAnalysis;
}

// 🔧 פונקציה לקבלת שאלה הבאה
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

// 🔧 פונקציה משופרת ליצירת תגובות מותאמות אישית
function createEnhancedPersonalizedResponse(analysis, infoType) {
  const gender = conversationMemory.userPreferences.gender || analysis.gender;
  const isFemale = gender === "female";
  
  console.log("🎯 יוצר תגובה מותאמת משופרת:", { infoType, gender, isFemale });
  
  const responses = {
    genres: {
      male: [
        `מעולה! ${analysis.genres ? analysis.genres.join(' ו') : 'הז\'אנר שבחרת'} - בחירה נהדרת! יש לי כמה פנינים בז'אנר הזה 🎬`,
        `סופר! אני רואה שאתה חובב ${analysis.genres ? analysis.genres.join(' ו') : 'הז\'אנר הזה'} - יש לי בדיוק מה שאתה מחפש! 🍿`,
        `אחלה! ${analysis.genres ? analysis.genres.join(' ו') : 'הז\'אנר הזה'} זה אחד התחומים שאני הכי אוהב להמליץ עליהם 😊`
      ],
      female: [
        `מעולה! ${analysis.genres ? analysis.genres.join(' ו') : 'הז\'אנר שבחרת'} - בחירה נהדרת! יש לי כמה פנינים בז'אנר הזה 🎬`,
        `סופר! אני רואה שאת חובבת ${analysis.genres ? analysis.genres.join(' ו') : 'הז\'אנר הזה'} - יש לי בדיוק מה שאת מחפשת! 🍿`,
        `אחלה! ${analysis.genres ? analysis.genres.join(' ו') : 'הז\'אנר הזה'} זה אחד התחומים שאני הכי אוהב להמליץ עליהם 😊`
      ]
    },
    age: {
      male: [
        "תודה רבה! עכשיו אני יכול להתאים לך בדיוק את הסרטים המתאימים לגיל שלך 👍",
        "מושלם! זה עוזר לי מאוד לדעת איזה סרטים יהיו הכי מתאימים בשבילך 🎯",
        "נהדר! עכשיו אני יודע בדיוק איזה סרטים יעשו לך את זה 🌟"
      ],
      female: [
        "תודה רבה! עכשיו אני יכול להתאים לך בדיוק את הסרטים המתאימים לגיל שלך 👍",
        "מושלם! זה עוזר לי מאוד לדעת איזה סרטים יהיו הכי מתאימים בשבילך 🎯",
        "נהדר! עכשיו אני יודע בדיוק איזה סרטים יעשו לך את זה 🌟"
      ]
    },
    platforms: {
      male: [
        `מצוין! עכשיו אני יודע שאתה יכול לצפות ב${conversationMemory.lastPlatforms.join(', ')} 📺`,
        `טוב לדעת! אני אמליץ לך רק על סרטים שזמינים ב${conversationMemory.lastPlatforms.join(' או ')} 🎮`,
        `נהדר! עכשיו אני יכול להמליץ לך רק על סרטים שתוכל לראות מיד 👌`
      ],
      female: [
        `מצוין! עכשיו אני יודע שאת יכולה לצפות ב${conversationMemory.lastPlatforms.join(', ')} 📺`,
        `טוב לדעת! אני אמליץ לך רק על סרטים שזמינים ב${conversationMemory.lastPlatforms.join(' או ')} 🎮`,
        `נהדר! עכשיו אני יכול להמליץ לך רק על סרטים שתוכלי לראות מיד 👌`
      ]
    },
    platforms_unsure: {
      male: [
        "אין בעיה! אני אחפש לך סרטים בכל הפלטפורמות הזמינות 📺",
        "בסדר גמור! אני אמליץ לך על סרטים מכל הפלטפורמות 🎬",
        "זה בסדר! אני אחפש לך הכל - נטפליקס, יס והוט 👌"
      ],
      female: [
        "אין בעיה! אני אחפש לך סרטים בכל הפלטפורמות הזמינות 📺",
        "בסדר גמור! אני אמליץ לך על סרטים מכל הפלטפורמות 🎬",
        "זה בסדר! אני אחפש לך הכל - נטפליקס, יס והוט 👌"
      ]
    },
    platforms_none: {
      male: [
        "הבנתי! אני אחפש לך סרטים שזמינים גם בלי מנויים 🎬",
        "אוקיי! יש הרבה דרכים לצפות בסרטים טובים גם בלי מנויים 📺",
        "בסדר! אני אמליץ לך על סרטים שתוכל למצוא גם באופן חופשי 👌"
      ],
      female: [
        "הבנתי! אני אחפש לך סרטים שזמינים גם בלי מנויים 🎬",
        "אוקיי! יש הרבה דרכים לצפות בסרטים טובים גם בלי מנויים 📺",
        "בסדר! אני אמליץ לך על סרטים שתוכלי למצוא גם באופן חופשי 👌"
      ]
    },
    duration: {
      male: [
        `מושלם! אני אמצא לך סרטים ${getDurationDescription(conversationMemory.userPreferences.duration)} שמתאימים לזמן שיש לך ⏰`,
        `טוב לדעת! אני אתמקד בסרטים ${getDurationDescription(conversationMemory.userPreferences.duration)} 🕒`,
        `נהדר! עכשיו אני יכול להמליץ על סרטים שמתאימים בדיוק לזמן שלך ⌚`
      ],
      female: [
        `מושלם! אני אמצא לך סרטים ${getDurationDescription(conversationMemory.userPreferences.duration)} שמתאימים לזמן שיש לך ⏰`,
        `טוב לדעת! אני אתמקד בסרטים ${getDurationDescription(conversationMemory.userPreferences.duration)} 🕒`,
        `נהדר! עכשיו אני יכול להמליץ על סרטים שמתאימים בדיוק לזמן שלך ⌚`
      ]
    }
  };
  
  const genderKey = isFemale ? "female" : "male";
  const typeResponses = responses[infoType]?.[genderKey] || responses[infoType]?.male || [];
  
  if (typeResponses.length > 0) {
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  }
  
  return "תודה על המידע!";
}

// פונקציה עזר לתיאור אורך סרט
function getDurationDescription(duration) {
  switch(duration) {
    case "קצר": return "קצרים ומהירים";
    case "בינוני": return "באורך סטנדרטי";
    case "ארוך": return "ארוכים ומעמיקים";
    default: return "";
  }
}

// פונקציה ליצירת תגובה למצב רוח
function createMoodResponse(mood) {
  const isFemale = conversationMemory.userPreferences.gender === "female";
  
  switch (mood) {
    case "עצוב":
      return isFemale ? 
        "🥺 מצטער לשמוע שאת מרגישה כך. בואי נבחר סרט שיעלה לך חיוך! " :
        "🥺 מצטער לשמוע שאתה מרגיש כך. בוא נבחר סרט שיעלה לך חיוך! ";
    case "שמח":
      return isFemale ?
        "🎉 אין כמו מצב רוח טוב! בואי נמצא סרט שישמור על זה! " :
        "🎉 אין כמו מצב רוח טוב! בוא נמצא סרט שישמור על זה! ";
    case "מרגש":
      return "💖 נראה שיש לך מצב לסרט שיגע בלב. יש לי בדיוק מה שצריך! ";
    case "רומנטי":
      return "💕 מושלם לערב רומנטי! ";
    default:
      return "";
  }
}

// 🔧 פונקציה משופרת לטיפול במידע חדש
function handleNewInfo(analysis, movies) {
  console.log("🔍 handleNewInfo called with analysis:", analysis);
  
  let response = "";
  let newInfoAdded = false;
  let responseType = null;
  
  // זיהוי "לא יודע" - תיקון חשוב!
  const userMessage = conversationMemory.conversationHistory[conversationMemory.conversationHistory.length - 1]?.content?.toLowerCase() || "";
  const isUnsure = userMessage.includes("לא יודע") || 
                   userMessage.includes("לא יודעת") || 
                   userMessage.includes("לא בטוח") || 
                   userMessage.includes("לא בטוחה") ||
                   userMessage.includes("אין לי מושג") ||
                   userMessage.includes("לא החלטתי") ||
                   analysis.isUnsureResponse;

  // שמירת מגדר אם זוהה
  if (analysis.gender) {
    conversationMemory.userPreferences.gender = analysis.gender;
    console.log("👥 Gender detected and saved:", analysis.gender);
  }

  // טיפול בז'אנרים
  if (analysis.genres && analysis.genres.length > 0 && !conversationMemory.collectedInfo.genres) {
    conversationMemory.lastGenres = analysis.genres;
    conversationMemory.collectedInfo.genres = true;
    newInfoAdded = true;
    responseType = "genres";
    console.log("✅ NEW Genres detected and saved:", analysis.genres);
  }

  // טיפול בגיל
  if (analysis.ageRange && !conversationMemory.collectedInfo.age) {
    conversationMemory.userPreferences.age = analysis.ageRange;
    conversationMemory.collectedInfo.age = true;
    newInfoAdded = true;
    responseType = "age";
    console.log("✅ NEW Age detected and saved:", analysis.ageRange);
  }

  // טיפול באורך
  if (analysis.duration && !conversationMemory.collectedInfo.duration) {
    conversationMemory.userPreferences.duration = analysis.duration;
    conversationMemory.collectedInfo.duration = true;
    newInfoAdded = true;
    responseType = "duration";
    console.log("✅ NEW Duration detected and saved:", analysis.duration);
  }

  // 🔧 תיקון טיפול בפלטפורמות - עם זיהוי "לא יודע"
  if (!conversationMemory.collectedInfo.platforms) {
    if (isUnsure && conversationMemory.lastQuestion === "platforms") {
      // אם המשתמש אמר "לא יודע" על פלטפורמות - נחשיב שיש לו הכל
      conversationMemory.lastPlatforms = ["נטפליקס", "יס", "הוט"];
      conversationMemory.collectedInfo.platforms = true;
      newInfoAdded = true;
      responseType = "platforms_unsure";
      console.log("✅ User unsure about platforms - assuming all platforms");
    } else if (analysis.platforms !== null && analysis.platforms !== undefined) {
      if (analysis.platforms.length > 0) {
        conversationMemory.lastPlatforms = analysis.platforms;
        conversationMemory.collectedInfo.platforms = true;
        newInfoAdded = true;
        responseType = "platforms";
        console.log("✅ NEW Platforms saved:", analysis.platforms);
      } else if (analysis.platforms.length === 0) {
        conversationMemory.lastPlatforms = [];
        conversationMemory.collectedInfo.platforms = true;
        newInfoAdded = true;
        responseType = "platforms_none";
        console.log("✅ No platforms (no subscriptions) saved");
      }
    }
  }

  // תגובה למצב רוח
  if (analysis.mood && analysis.isNewMoodMention && !conversationMemory.mentionedTopics.mood) {
    conversationMemory.lastMoods = [analysis.mood];
    conversationMemory.mentionedTopics.mood = true;
    console.log("💭 Mood response added:", analysis.mood);
    
    response += createMoodResponse(analysis.mood);
  }

  // בדיקה אם יש מספיק מידע
  const allRequiredInfoCollected = ["genres", "age", "duration", "platforms"]
    .every(type => conversationMemory.collectedInfo[type] === true);

  if (allRequiredInfoCollected) {
    console.log("🎯 All info collected - generating recommendations");
    return generateRecommendations(movies, response);
  } else {
    // 🔧 תגובה מותאמת אישית ספציפית יותר
    if (newInfoAdded && responseType) {
      const personalizedResponse = createEnhancedPersonalizedResponse(analysis, responseType);
      response += personalizedResponse + " ";
    }
    
    const missingInfoResponse = askForMissingInfo();
    return response + missingInfoResponse;
  }
}

// ליצירת כפתורים אינטראקטיביים
function createInteractiveButtonsWithEvents(question) {
  if (!question.hasButtons) return '';
  
  const buttonId = `buttons-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  let buttonsHTML = `<div class="interactive-buttons" id="${buttonId}">`;
  
  question.buttons.forEach((button, index) => {
    const btnId = `btn-${buttonId}-${index}`;
    buttonsHTML += `
      <button class="choice-button" 
              id="${btnId}"
              data-value="${button.value}"
              data-container-id="${buttonId}">
        ${button.text}
      </button>
    `;
  });
  
  buttonsHTML += '</div>';
  
  setTimeout(() => {
    question.buttons.forEach((button, index) => {
      const btnId = `btn-${buttonId}-${index}`;
      const btnElement = document.getElementById(btnId);
      if (btnElement) {
        btnElement.addEventListener('click', async function() {
          console.log("🔘 כפתור נלחץ:", button.value);
          
          const buttonsContainer = document.getElementById(buttonId);
          if (buttonsContainer) {
            buttonsContainer.remove();
          }
          
          const convo = document.getElementById("conversation");
          convo.innerHTML += `<div class='bubble user'>${button.value}</div>`;
          
          const loadingId = Date.now();
          convo.innerHTML += `<div class='bubble bot' id='loading-${loadingId}'>
            <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
            <div class="bot-message">🤖 מעבד את הבחירה שלך...</div>
          </div>`;

          try {
            const movies = await loadMoviesDatabase();
            const smartResponse = await generateSmartResponse(button.value, movies);

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
        });
      }
    });
  }, 100);
  
  return buttonsHTML;
}

// פונקציה לטיפול בשגיאות
function showError(error) {
  const convo = document.getElementById("conversation");
  let errorMessage = "אופס! משהו השתבש. בוא ננסה שוב? 🔧";
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    if (error.message.includes("Failed to load movies")) {
      errorMessage = `⚠️ לא הצלחתי לטעון את מאגר הסרטים.<br>אנא וודא שקובץ movies.json קיים ונגיש.`;
    } else if (error.message.includes("Gemini API error")) {
      errorMessage = `🤖 יש בעיה עם שירות ה-AI.<br>אני עובר לניתוח מקומי! 🔄`;
    }
  }
  
  convo.innerHTML += `<div class='bubble bot'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">${errorMessage}</div>
  </div>`;
}

// פונקציה לניקוי השיחה
function clearConversation(userMessage = null) {
  const convo = document.getElementById("conversation");
  convo.innerHTML = '';
  resetConversationMemory();
  
  if (userMessage) {
    convo.innerHTML += `<div class='bubble user'>${userMessage}</div>`;
  }

  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  convo.innerHTML += `<div class='bubble bot'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">${randomWelcome}</div>
  </div>`;
}

// פונקציה לאיפוס זיכרון השיחה
function resetConversationMemory() {
  conversationMemory = {
    lastGenres: [],
    lastMoods: [],
    lastPlatforms: [],
    lastRecommendations: [],
    lastQuestion: null,
    userPreferences: {
      age: null,
      gender: null,
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
    conversationHistory: [],
    mentionedTopics: {
      mood: false,
      welcomeGiven: false
    }
  };
}

// פונקציה משופרת ליצירת תשובה חכמה
async function generateSmartResponse(message, movies) {
  const analysis = await analyzeText(message);
  let response = "";

  console.log("Debug: generateSmartResponse - analysis from AI:", analysis);

  // טיפול בפקודות מיוחדות
  if (analysis.command === "תודה") {
    const randomThankYou = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
    return randomThankYou;
  }
  
  if (analysis.command === "סיום") {
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
    resetConversationMemory();
    return randomGoodbye;
  }

  // טיפול לפי סוג הכוונה של המשתמש
  switch (analysis.intentType) {
    case "casual_chat":
      return handleCasualChat(message);
      
    case "requesting_more":
      return handleMoreRecommendations(movies);
      
    case "giving_new_info":
      return handleNewInfo(analysis, movies);
      
    case "asking_for_recommendations":
      return handleRecommendationRequest(analysis, movies);
      
    default:
      return handleDefault(analysis, movies);
  }
}

// פונקציה לטיפול בצ'אט מזדמן
function handleCasualChat(message) {
  const casualResponses = [
    "היי! איך אני יכול לעזור לך למצוא סרט מושלם היום? 🎬",
    "שלום! אני כאן כדי להמליץ לך על סרטים מעולים. מה מעניין אותך? 🍿",
    "היי! מוכן לגלות סרט חדש? ספר לי מה אתה אוהב 😊"
  ];
  
  if (!conversationMemory.mentionedTopics.welcomeGiven) {
    conversationMemory.mentionedTopics.welcomeGiven = true;
    return casualResponses[Math.floor(Math.random() * casualResponses.length)];
  }
  
  return "איך אני יכול לעזור לך למצוא סרט? 😊";
}

// פונקציה לטיפול בבקשה להמלצות נוספות
function handleMoreRecommendations(movies) {
  conversationMemory.recommendationOffset += 3;
  
  const foundMovies = analyzeAndFindMovies("", movies);
  const moviesToRecommend = foundMovies.slice(conversationMemory.recommendationOffset, conversationMemory.recommendationOffset + 3);

  if (moviesToRecommend.length > 0) {
    let response = "הנה עוד המלצות בשבילך:<br><br>";
    
    moviesToRecommend.forEach((movie, index) => {
      response += `${index + 1}. ${formatMovieRecommendation(movie)}<br><br>`;
    });
    
    if (foundMovies.length > (conversationMemory.recommendationOffset + 3)) {
      response += "יש לי עוד המלצות אם תרצה! 😉";
    } else {
      response += "אלו כל ההמלצות שיש לי עם ההעדפות הנוכחיות. רוצה לנסות משהו אחר? 🤔";
    }
    
    return response;
  } else {
    return "זהו, נגמרו לי ההמלצות עם ההעדפות האלו. בוא נחפש משהו אחר? 😊";
  }
}

// פונקציה לטיפול בבקשה ישירה להמלצות
function handleRecommendationRequest(analysis, movies) {
  const allRequiredInfoCollected = ["genres", "age", "duration", "platforms"]
    .every(type => conversationMemory.collectedInfo[type] === true);

  if (allRequiredInfoCollected) {
    return generateRecommendations(movies, "");
  } else {
    return "כדי להמליץ לך על הסרט המושלם, אני צריך לדעת קצת על ההעדפות שלך. " + askForMissingInfo();
  }
}

// פונקציה ברירת מחדל
function handleDefault(analysis, movies) {
  return handleNewInfo(analysis, movies);
}

// פונקציה ליצירת המלצות
function generateRecommendations(movies, prefixResponse = "") {
  conversationMemory.recommendationOffset = 0;
  const foundMovies = analyzeAndFindMovies("", movies);
  const moviesToRecommend = foundMovies.slice(0, 3);

  if (moviesToRecommend.length > 0) {
    let response = prefixResponse + "הנה ההמלצות שלי בשבילך:<br><br>";
    
    moviesToRecommend.forEach((movie, index) => {
      response += `${index + 1}. ${formatMovieRecommendation(movie)}<br><br>`;
    });
    
    if (foundMovies.length > 3) {
      response += "יש לי עוד המלצות אם תרצה! פשוט תגיד 'עוד' או 'אחרים' 😉";
    }
    
    return response;
  } else {
    return prefixResponse + "מצטער, לא מצאתי סרטים שמתאימים בדיוק להעדפות שלך. אולי ננסה עם קריטריונים אחרים?";
  }
}

// פונקציה לשאילת מידע חסר
function askForMissingInfo() {
  const nextQuestion = getNextQuestion();
  if (nextQuestion) {
    let response = nextQuestion.question;
    
    if (nextQuestion.hasButtons) {
      response += "<br><br>" + createInteractiveButtonsWithEvents(nextQuestion);
    }
    
    conversationMemory.lastQuestion = nextQuestion.id;
    return response;
  }
  
  return "ספר לי קצת על מה שאתה מחפש ואני אמליץ לך! 😊";
}

// פונקציה לחיפוש סרטים
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
    const mood = conversationMemory.lastMoods[0];
    switch(mood) {
      case "עצוב":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("comedy")
        );
        break;
      case "מרגש":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("drama")
        );
        break;
      case "רומנטי":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("romance")
        );
        break;
      case "מרומם":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("drama") ||
          movie.Genres.toLowerCase().includes("biography")
        );
        break;
      case "נוסטלגי":
        filtered = filtered.filter(movie => 
          movie.Release_Year < 2000
        );
        break;
      case "משעשע":
        filtered = filtered.filter(movie => 
          movie.Genres.toLowerCase().includes("comedy")
        );
        break;
    }
  }

  // סינון לפי פלטפורמה
  if (conversationMemory.lastPlatforms.length > 0) {
    filtered = filtered.filter(movie => 
      conversationMemory.lastPlatforms.some(platform => movie[platform] === 1)
    );
  }

  // סינון לפי גיל
  if (conversationMemory.userPreferences.age) {
    filtered = filtered.filter(movie => {
      const movieAgeRange = movie.ageRange;
      const userAgePreference = conversationMemory.userPreferences.age;
      
      if (movieAgeRange === "All Ages") return true;
      
      if (userAgePreference === "7+") {
        return (movieAgeRange === "7+");
      } else if (userAgePreference === "13+") {
        return (movieAgeRange === "7+" || movieAgeRange === "13+");
      } else if (userAgePreference === "17+") {
        return true;
      }
      return false;
    });
  }

  // סינון לפי אורך סרט
  if (conversationMemory.userPreferences.duration) {
    filtered = filtered.filter(movie => {
      const duration = movie.Duration || 0;
      if (conversationMemory.userPreferences.duration === "קצר") return duration <= 90;
      if (conversationMemory.userPreferences.duration === "בינוני") return duration > 90 && duration <= 120;
      if (conversationMemory.userPreferences.duration === "ארוך") return duration > 120;
      return true;
    });
  }

  // מיון לפי דירוג
  filtered.sort((a, b) => parseFloat(b.Rating) - parseFloat(a.Rating));

  // שמירת ההמלצות בזיכרון
  if (filtered.length > 0) {
    conversationMemory.lastRecommendations = filtered.slice(0, 3);
  }

  console.log("🎯 סה״כ סרטים שנמצאו:", filtered.length);
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

// פונקציה לשליחת הודעה
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";

  const lowerMessage = message.toLowerCase();
  const resetKeywords = ["התחל שיחה חדשה", "אפס", "חדש"];

  const convo = document.getElementById("conversation");

  if (resetKeywords.some(k => lowerMessage.includes(k))) {
    clearConversation(message);
    convo.scrollTop = convo.scrollHeight;
    return;
  }

  // בדיקה אם זה רק ברכה פשוטה
  const simpleGreetings = ["היי", "שלום", "הי", "בוקר טוב", "שלום אוסקר"];
  const isOnlyGreeting = simpleGreetings.some(g => 
    lowerMessage === g || 
    lowerMessage === g + "!" || 
    lowerMessage === g + "."
  );

  if (isOnlyGreeting) {
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
    <div class="bot-message">🤖 מעבד את ההודעה שלך...</div>
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

// אירועי מקלדת ופתיחה
document.addEventListener('DOMContentLoaded', async function() {
  console.log("🚀 העמוד נטען - מתחיל אתחול עם AI...");
  
  const input = document.getElementById("userInput");
  const convo = document.getElementById("conversation");
  
  if (!input || !convo) {
    console.error("❌ אלמנטים חיוניים לא נמצאו");
    return;
  }
  
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  try {
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    convo.innerHTML = `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">${randomWelcome}</div>
    </div>`;
    
  } catch (error) {
    console.error("❌ שגיאה בהוספת הודעת פתיחה:", error);
    
    convo.innerHTML = `<div class='bubble bot'>
      <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
      <div class="bot-message">שלום! אני אוסקר, בוט המלצות הסרטים שלך עם AI! 🎬🤖 איזה סרט מעניין אותך היום?</div>
    </div>`;
  }

  // הוספת CSS לכפתורים
  const additionalCSS = `
    .choice-button {
      pointer-events: auto !important;
      cursor: pointer !important;
      user-select: none;
      border: 2px solid #007bff;
      background-color: #007bff;
      color: white;
      padding: 10px 15px;
      margin: 5px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .choice-button:hover {
      background-color: #0056b3 !important;
      border-color: #0056b3 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,123,255,0.3);
    }

    .choice-button:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(0,123,255,0.3);
    }

    .interactive-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
      justify-content: flex-start;
    }

    @media (max-width: 768px) {
      .choice-button {
        font-size: 12px;
        padding: 8px 12px;
      }
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = additionalCSS;
  document.head.appendChild(styleSheet);
  
  console.log("🎉 אתחול הושלם בהצלחה - אוסקר עם AI מוכן לשימוש!");
});
