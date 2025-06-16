import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// 🎭 הודעות פתיחה
const welcomeMessages = [
  "שלום! אני אוסקר, בוט המלצות הסרטים שלך 🎬 איזה סרט מעניין אותך היום?",
  "היי! אני אוסקר ואני מתמחה בהמלצות סרטים 🍿 מה תרצה לראות?",
  "ברוכים הבאים! אני אוסקר ואשמח לעזור לך למצוא סרט מושלם 🎭 מה אתה מחפש?"
];

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
    ageRange: "17+",
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
    ageRange: "13+",
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
    ageRange: "13+",
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
    ageRange: "17+",
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

const API_KEY = "AIzaSyAq-ngUJxyiZM2zkKyyv2yq2b5KsDx5c1M"; // המפתח שלך
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const model = new GoogleGenerativeAI(API_KEY).getGenerativeModel({ model: "gemini-pro" });

// פונקציה לטעינת מאגר סרטים
let moviesDatabase = null;

async function loadMoviesDatabase() {
  if (moviesDatabase) return moviesDatabase;

  try {
    console.log("📚 מנסה לטעון את מאגר הסרטים...");
    const response = await fetch('movies.json'); // ודא ש-movies.json נמצא באותה תיקייה
    if (!response.ok) {
      throw new Error(`Failed to load movies: ${response.status} ${response.statusText}`); // <-- תיקון כאן!
    }
    moviesDatabase = await response.json();
    console.log(`✅ נטענו ${moviesDatabase.length} סרטים מהמאגר המקומי`); // <-- תיקון כאן!
    console.log("📊 דוגמה לסרט:", moviesDatabase[0]);
    return moviesDatabase;
  } catch (error) {
    console.error("❌ שגיאה בטעינת הסרטים:", error);
    console.log("⚠ משתמש במאגר סרטים זמני");
    moviesDatabase = backupMovies;
    return moviesDatabase;
  }
}

// עדכון זיכרון השיחה
let conversationMemory = {
  lastGenres: [],
  excludeGenres: [], // נוסף שדה לז'אנרים שצריך להוציא
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
    mood: false, // לא נאסף במפורש, אבל יכול להשפיע על המלצות
    duration: false,
    platforms: false
  },
  recommendationOffset: 0
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

// שאלות אינטראקטיביות (ללא מילות מפתח, Gemini מבין את הכוונה)
const interactiveQuestions = [
  {
    id: "genres",
    question: "איזה סוגי סרטים אתה אוהב? (למשל: אקשן, קומדיה, דרמה וכו') 🎭",
  },
  {
    id: "age",
    question: "מה הגיל שלך? זה יעזור לי להתאים סרטים מתאימים 👥",
  },
  {
    id: "duration",
    question: "כמה זמן יש לך לצפות בסרט? (קצר/בינוני/ארוך) 🕒",
  },
  {
    id: "platforms",
    question: "האם יש לך מנוי לנטפליקס, יס או הוט? 📺",
  }
];

// --- פונקציה עיקרית לניתוח טקסט באמצעות Gemini ---
async function analyzeText(text) {
  const prompt = `
    אתה אוסקר, בוט המלצות סרטים. המשתמש אמר: "${text}".
    אנא חלץ מתוך הטקסט את הפרטים הבאים. היה גמיש בהבנת כוונת המשתמש, גם עם שגיאות כתיב או ניסוחים לא ברורים.
    אם המשתמש אומר משהו כמו "משהו שישמח אותי", נסה להסיק ז'אנר או מצב רוח מתאים (למשל: קומדיה, שמח).
    אם המשתמש אומר "לא רוצה" או "בלי" משהו ספציפי (למשל, ז'אנר), רשום זאת ברשימה נפרדת.
    אם המשתמש שואל שאלה שלא קשורה להמלצות סרטים (כמו "מה שלומך?"), השב ברוחב לב והתמקד בחזרה להמלצות סרטים.

    1. *ז'אנרים מבוקשים (genres)*: רשימת ז'אנרים. השתמש בשמות ז'אנרים מוכרים באנגלית כמו "Action", "Comedy", "Drama", "Sci-Fi", "Fantasy", "Animation", "Thriller", "Horror", "Romance", "Adventure", "Crime", "Mystery", "Family", "Biography", "History", "Documentary", "Musical", "Western", "War", "Sport". אם המשתמש אומר ז'אנר בעברית, המר אותו לפורמט האנגלי המקובל.
    2. *ז'אנרים להוציא (excludeGenres)*: רשימת ז'אנרים שהמשתמש לא רוצה.
    3. *מצב רוח (moods)*: מצב הרוח של המשתמש (לדוגמה: שמח, עצוב, מרומם, רגוע, מרגש, מפחיד, רומנטי, נוסטלגי, מעורר השראה, משעשע, משועמם, עייף).
    4. *פלטפורמות צפייה (platforms)*: רשימת פלטפורמות (לדוגמה: נטפליקס, יס, הוט).
    5. *טווח גילאים (ageRange)*: טווח גילאים מומלץ לסרט (אחד מהבאים: "7+", "13+", "17+", "All Ages"). אם המשתמש מציין גיל ספציפי (למשל: "אני בן 10", "לגיל 15"), תרגם זאת לטווח המתאים. אם המשתמש אומר "לילדים", פרש כ-"7+". אם המשתמש אומר "לנוער", פרש כ-"13+". אם המשתמש אומר "למבוגרים", פרש כ-"17+".
    6. *אורך סרט (duration)*: העדפת אורך הסרט (אחד מהבאים: "קצר" - עד 90 דקות, "בינוני" - 91-120 דקות, "ארוך" - מעל 120 דקות).
    7. *שחקנים מועדפים (actors)*: רשימת שחקנים שהוזכרו.
    8. *במאים מועדפים (directors)*: רשימת במאים שהוזכרו.
    9. *פקודה (command)*: אם המשתמש מבקש "עוד", "נוספים", "תודה" או "סיום שיחה" / "ביי" / "להתראות". השתמש בערכים: "אחרים", "תודה", "סיום", "איפוס" (אם המשתמש רוצה להתחיל שיחה חדשה, "אפס", "התחל מחדש"). אם זו שאלה לא רלוונטית, השאר null.
    10. *האם יש צורך בתגובה כללית (generalResponseNeeded)*: בוליאני. נכון אם השאלה אינה דורשת חילוץ נתונים אלא תגובה כללית כמו ברכה, פרידה או שאלה כללית שלא קשורה להמלצות.

    אנא החזר את המידע בפורמט JSON קריא, עם השדות הבאים. אם אינך מוצא מידע עבור שדה מסוים, השאר אותו ריק, null, או array ריק כפי שצוין.
    {
      "genres": [],
      "excludeGenres": [],
      "moods": [],
      "platforms": [],
      "ageRange": null,
      "duration": null,
      "actors": [],
      "directors": [],
      "command": null,
      "generalResponseNeeded": false
    }

    חשוב: התשובה שלך צריכה להכיל אך ורק את אובייקט ה-JSON, ללא טקסט נוסף לפני או אחרי.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    console.log("Gemini Raw Response Text:", textResponse);

    // ניסיון לפרסר JSON. Gemini עשוי לפעמים לכלול תגי קוד (json).
    let jsonString = textResponse.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7);
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.substring(0, jsonString.length - 3);
    }

    const analysis = JSON.parse(jsonString);
    console.log("Gemini Parsed Analysis:", analysis);
    return analysis;

  } catch (error) {
    console.error("❌ שגיאה בקריאה ל-Gemini API או בפירסור JSON:", error);
    // במקרה של שגיאה, נחזיר ניתוח ריק או ברירת מחדל כדי למנוע קריסה
    return {
      genres: [],
      excludeGenres: [],
      moods: [],
      platforms: [],
      ageRange: null,
      duration: null,
      actors: [],
      directors: [],
      command: null,
      generalResponseNeeded: false
    };
  }
}

// פונקציה לקבלת השאלה הבאה (לא השתנתה)
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

// פונקציה ליצירת תשובה חכמה (הותאמה לעבודה עם analyzeText של Gemini)
async function generateSmartResponse(message, movies) {
  const analysis = await analyzeText(message); // ניתוח ההודעה באמצעות Gemini

  let response = "";

  console.log("Debug: generateSmartResponse - analysis from Gemini:", analysis);
  console.log("Debug: generateSmartResponse - conversationMemory before update:", { ...conversationMemory });

  // טיפול בפקודות שהתגלו על ידי Gemini
  if (analysis.command === "תודה") {
    const randomThankYou = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
    return randomThankYou;
  }

  if (analysis.command === "סיום") {
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
    clearConversation(); // איפוס השיחה
    return randomGoodbye;
  }

  if (analysis.command === "איפוס") {
    clearConversation(message); // איפוס השיחה והצגת הודעת המשתמש
    return ""; // clearConversation כבר מטפלת בתגובה הראשונית
  }

  // טיפול בתגובות כלליות מ-Gemini (למשל, ברכות, שאלות לא קשורות)
  if (analysis.generalResponseNeeded) {
    const genericGreetings = ["שלום", "היי", "בוקר טוב", "ערב טוב", "מה נשמע", "מה שלומך"];
    const lowerMessage = message.toLowerCase();

    if (genericGreetings.some(g => lowerMessage.includes(g))) {
        // אם זו ברכה, תן ברכה חזרה ואז שאל את השאלה הבאה
        const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        const nextQ = getNextQuestion();
        if (nextQ) {
            return `היי גם לך! ${randomWelcome.replace("שלום! אני אוסקר, בוט המלצות הסרטים שלך 🎬 ", "")} ${nextQ.question}`;
        }
        return randomWelcome;
    } else {
        // אם זו שאלה כללית אחרת, נתמקד מחדש
        const nextQ = getNextQuestion();
        if (nextQ) {
            return `אני בוט להמלצות סרטים! אשמח לעזור לך למצוא משהו. ${nextQ.question}`;
        }
        return "אני כאן כדי למצוא לך את הסרט המושלם. ספר לי מה תרצה לראות!";
    }
  }


  // קביעה אם זו בקשת ז'אנר חדשה או פקודת "עוד"
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

  // עדכון זיכרון השיחה עם ניתוח Gemini
  if (analysis.genres && analysis.genres.length > 0) {
    conversationMemory.lastGenres = analysis.genres;
    conversationMemory.collectedInfo.genres = true;
  }
  if (analysis.excludeGenres && analysis.excludeGenres.length > 0) {
    conversationMemory.excludeGenres = analysis.excludeGenres;
  }
  if (analysis.moods && analysis.moods.length > 0) {
    conversationMemory.lastMoods = analysis.moods;
    conversationMemory.collectedInfo.mood = true; // סימון כמידע שנאסף
  }
  if (analysis.platforms !== undefined) {
    conversationMemory.lastPlatforms = analysis.platforms;
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
  if (analysis.actors && analysis.actors.length > 0) {
    conversationMemory.userPreferences.favoriteActors = analysis.actors;
  }
  if (analysis.directors && analysis.directors.length > 0) {
    conversationMemory.userPreferences.favoriteDirectors = analysis.directors;
  }

  console.log("Debug: generateSmartResponse - conversationMemory after update:", { ...conversationMemory });

  // בדיקה אם נאסף מספיק מידע להמלצות
  const infoTypesToCollect = ["genres", "age", "duration", "platforms"];
  const allRequiredInfoCollected = infoTypesToCollect.every(type => conversationMemory.collectedInfo[type] === true);

  console.log("Debug: generateSmartResponse - allRequiredInfoCollected:", allRequiredInfoCollected);

  if (allRequiredInfoCollected) {
    conversationMemory.conversationState = "recommending";

    console.log("🎯 מחפש סרטים עם הז'אנרים:", conversationMemory.lastGenres);

    const foundMovies = analyzeAndFindMovies(movies);
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
      if (analysis.moods && analysis.moods.length > 0) {
        const mood = analysis.moods[0];
        switch (mood) {
          case "עצוב":
            response += "💝 מקווה שהסרטים האלה יעזרו לשפר את מצב הרוח שלך!";
            break;
          case "מרגש":
            response += "💖 מקווה שתהנה מהסרטים המרגשים האלה!";
            break;
          case "רומנטי":
            response += "💕 מקווה שתהנה מהסרטים הרומנטיים האלה!";
            break;
          case "מעורר השראה":
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

      // איפוס אם לא נמצאו סרטים כלל
      conversationMemory.collectedInfo = {
        genres: false,
        age: false,
        mood: false,
        duration: false,
        platforms: false
      };
      conversationMemory.lastGenres = [];
      conversationMemory.excludeGenres = [];
      conversationMemory.lastPlatforms = [];
      conversationMemory.userPreferences.age = null;
      conversationMemory.userPreferences.duration = null;
      conversationMemory.userPreferences.favoriteActors = [];
      conversationMemory.userPreferences.favoriteDirectors = [];
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
    // עדיין אוספים מידע מהמשתמש
    const nextQuestion = getNextQuestion();
    console.log("Debug: generateSmartResponse - nextQuestion:", nextQuestion ? nextQuestion.id : null);

    const providedInfo = [];
    if (analysis.genres && analysis.genres.length > 0) providedInfo.push("ז'אנר");
    if (analysis.ageRange) providedInfo.push("גיל");
    if (analysis.duration) providedInfo.push("אורך סרט");
    if (analysis.platforms && analysis.platforms.length > 0) providedInfo.push("פלטפורמת צפייה");

    if (providedInfo.length > 0 || (analysis.moods && analysis.moods.length > 0)) {
        if (providedInfo.length > 0) {
            response += `תודה על המידע שסיפקת בנוגע ל${providedInfo.join(' ו-')}.`;
        }
        if (analysis.moods && analysis.moods.length > 0) {
            response += ` אני מבין שאתה מרגיש ${analysis.moods[0]}.`;
        }
        response += " <br><br>";
    } else if (message.trim().length > 0) {
        // תגובה כללית אם לא חולץ מידע ספציפי חדש
        response += "אוקיי. ";
        response += " <br><br>";
    }


    if (nextQuestion) {
      response += `${nextQuestion.question}`;
      conversationMemory.lastQuestion = nextQuestion.id;
    } else {
      response += "אנא ספר לי עוד על מה שאתה מחפש.";
      conversationMemory.lastQuestion = null;
    }
  }

  console.log("Debug: generateSmartResponse - Final response length:", response.length);
  return response || "אשמח לעזור לך למצוא סרט מושלם! מה מעניין אותך?";
}

// פונקציה לחיפוש סרטים (הותאמה לעבודה עם זיכרון השיחה וז'אנרים באנגלית)
function analyzeAndFindMovies(movies) {
  let filtered = [...movies];

  console.log("🔍 מחפש סרטים בהתאם לזיכרון השיחה:");
  console.log("📊 זיכרון שיחה נוכחי:", conversationMemory);

  // סינון לפי ז'אנר
  if (conversationMemory.lastGenres.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by genres:", conversationMemory.lastGenres);
    filtered = filtered.filter(movie => {
      const movieGenres = movie.Genres.toLowerCase().split(", ").map(g => g.trim());
      return conversationMemory.lastGenres.some(requestedGenre => {
        // Gemini אמור להחזיר ז'אנרים באנגלית, אז נשווה ישירות
        return movieGenres.includes(requestedGenre.toLowerCase());
      });
    });
    console.log("Debug: analyzeAndFindMovies - Movies after genre filtering:", filtered.map(m => m.Title));
  }

  // סינון החוצה ז'אנרים לא רצויים
  if (conversationMemory.excludeGenres && conversationMemory.excludeGenres.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Excluding genres:", conversationMemory.excludeGenres);
    filtered = filtered.filter(movie => {
      const movieGenres = movie.Genres.toLowerCase().split(", ").map(g => g.trim());
      return !conversationMemory.excludeGenres.some(excludedGenre => {
        return movieGenres.includes(excludedGenre.toLowerCase());
      });
    });
    console.log("Debug: analyzeAndFindMovies - Movies after excludeGenre filtering:", filtered.map(m => m.Title));
  }

  // סינון לפי מצב רוח (ניתן להסיק ז'אנרים לפי מצב רוח אם Gemini לא זיהה)
  if (conversationMemory.lastMoods.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by mood. Current movies:", filtered.map(m => m.Title));
    const mood = conversationMemory.lastMoods[0];
    switch (mood) {
      case "עצוב":
      case "רגוע":
      case "עייף":
        // להציג סרטים שמחים/קלילים יותר
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("comedy") ||
          movie.Genres.toLowerCase().includes("family") ||
          movie.Genres.toLowerCase().includes("animation") ||
          movie.Genres.toLowerCase().includes("romance")
        );
        break;
      case "שמח":
      case "מרומם":
      case "מעורר השראה":
      case "משעשע":
        // להציג סרטים מעודדים/מצחיקים/דרמות חיוביות
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("comedy") ||
          movie.Genres.toLowerCase().includes("biography") ||
          (movie.Genres.toLowerCase().includes("drama") && movie.Rating && parseFloat(movie.Rating) >= 7.5) // דרמות עם דירוג גבוה יותר
        );
        break;
      case "מרגש":
        // להציג סרטים עם עלילה סוחפת
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("drama") ||
          movie.Genres.toLowerCase().includes("thriller") ||
          movie.Genres.toLowerCase().includes("adventure")
        );
        break;
      case "מפחיד":
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("horror") ||
          movie.Genres.toLowerCase().includes("thriller") ||
          movie.Genres.toLowerCase().includes("mystery")
        );
        break;
      case "רומנטי":
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("romance")
        );
        break;
      case "נוסטלגי":
        filtered = filtered.filter(movie =>
          movie.Release_Year < 2005
        );
        break;
      case "משועמם":
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("action") ||
          movie.Genres.toLowerCase().includes("adventure") ||
          movie.Genres.toLowerCase().includes("sci-fi") ||
          movie.Genres.toLowerCase().includes("thriller")
        );
        break;
    }
    console.log("Debug: analyzeAndFindMovies - Movies after mood filtering:", filtered.map(m => m.Title));
  }

  // סינון לפי פלטפורמה
  if (conversationMemory.lastPlatforms.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by platforms. Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie =>
      conversationMemory.lastPlatforms.some(platform => {
        // וודא ששם הפלטפורמה מתאים למפתח ב-JSON (למשל, "נטפליקס")
        return movie[platform] === 1;
      })
    );
    console.log("Debug: analyzeAndFindMovies - Movies after platform filtering:", filtered.map(m => m.Title));
  } else if (conversationMemory.collectedInfo.platforms && conversationMemory.lastPlatforms.length === 0) {
    // אם המשתמש אמר שאין לו מנוי לאף אחת, אל תסנן לפי פלטפורמה.
    // הקריאה "אף אחד" או "אין לי" תגרום ל-analysis.platforms להיות ריק.
    // במקרה זה, לא נסנן בכלל, אלא אם כן המשתמש ציין פלטפורמה מסוימת שאין לו.
    // אם הוא לא ציין אף פלטפורמה, ופשוט אמר "אין לי", נתייחס לזה כחוסר העדפה.
    console.log("Debug: User stated no specific platform preference, or no platforms available. Not filtering by platform.");
  }


  // סינון לפי גיל
  if (conversationMemory.userPreferences.age) {
    console.log("Debug: analyzeAndFindMovies - Filtering by age. User preference:", conversationMemory.userPreferences.age, ". Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie => {
      const movieAgeRange = movie.ageRange;
      const userAgePreference = conversationMemory.userPreferences.age;
      let isMatch = false;

      if (userAgePreference === "7+") {
        isMatch = (movieAgeRange === "7+" || movieAgeRange === "All Ages");
      } else if (userAgePreference === "13+") {
        isMatch = (movieAgeRange === "7+" || movieAgeRange === "13+" || movieAgeRange === "All Ages");
      } else if (userAgePreference === "17+") {
        isMatch = true; // 17+ יכולים לראות הכל
      } else if (userAgePreference === "All Ages") { // למי שרוצה "כל הגילאים"
        isMatch = (movieAgeRange === "All Ages" || movieAgeRange === "7+" || movieAgeRange === "13+" || movieAgeRange === "17+");
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

  // סינון לפי שחקנים (דורש שדה 'Stars' ב-movies.json)
  if (conversationMemory.userPreferences.favoriteActors.length > 0) {
    filtered = filtered.filter(movie =>
      movie.Stars && conversationMemory.userPreferences.favoriteActors.some(actor =>
        movie.Stars.toLowerCase().includes(actor.toLowerCase())
      )
    );
  }

  // סינון לפי במאים (דורש שדה 'Director' ב-movies.json)
  if (conversationMemory.userPreferences.favoriteDirectors.length > 0) {
    filtered = filtered.filter(movie =>
      movie.Director && conversationMemory.userPreferences.favoriteDirectors.some(director =>
        movie.Director.toLowerCase().includes(director.toLowerCase())
      )
    );
  }

  // מיון לפי דירוג (מהגבוה לנמוך)
  filtered.sort((a, b) => parseFloat(b.Rating) - parseFloat(a.Rating));

  // שמירת ההמלצות בזיכרון
  conversationMemory.lastRecommendations = filtered;

  console.log("🎯 סה״כ סרטים שנמצאו:", filtered.length);
  console.log("🏆 סרטים סופיים:", filtered.map(m => `${m.Title} (${m.Release_Year})`).join(", "));
  return filtered; // חשוב להחזיר את הרשימה המסוננת
}


// --- פונקציות לתצוגה וניהול ה-UI (הותאמו לשינויים) ---

// פונקציה להוספת הודעה לצא'ט
function addMessage(sender, message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.innerHTML = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // גלילה אוטומטית למטה
}

// פונקציה לניקוי השיחה
function clearConversation(userMessage = null) {
  document.getElementById('chat-messages').innerHTML = ''; // מנקה את כל ההודעות
  conversationMemory = { // מאפס את זיכרון השיחה
    lastGenres: [],
    excludeGenres: [],
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
    recommendationOffset: 0
  };
  if (userMessage && userMessage.toLowerCase().includes("איפוס")) {
    addMessage('bot', `בטח, בוא נתחיל מחדש! ${welcomeMessages[0]}`); // הודעת פתיחה אחרי איפוס
  } else {
    // מציג הודעת פתיחה רק פעם אחת בטעינה ראשונית של הדף
    // או לאחר איפוס יזום שלא דרך פקודת "איפוס"
    // אבל בדרך כלל welcome message מוצגת כבר ב-DOMContentLoaded
  }
}


// פונקציה לעיצוב המלצת סרט
function formatMovieRecommendation(movie) {
  let details = `<b>${movie.Title}</b> (${movie.Release_Year})<br>`;
  if (movie.Director) details += `<b>במאי:</b> ${movie.Director}<br>`;
  if (movie.Stars) details += `<b>שחקנים:</b> ${movie.Stars}<br>`;
  if (movie.Genres) details += `<b>ז'אנר:</b> ${movie.Genres}<br>`;
  if (movie.Rating) details += `<b>דירוג:</b> ${movie.Rating}/10<br>`;
  if (movie.ageRange) details += `<b>גיל מומלץ:</b> ${movie.ageRange}<br>`;
  if (movie.Duration) {
    let durationText = '';
    if (movie.Duration <= 90) durationText = 'קצר (עד 90 דקות)';
    else if (movie.Duration <= 120) durationText = 'בינוני (91-120 דקות)';
    else durationText = 'ארוך (מעל 120 דקות)';
    details += `<b>אורך:</b> ${movie.Duration} דקות (${durationText})<br>`;
  }
  let platforms = [];
  if (movie["נטפליקס"] === 1) platforms.push("נטפליקס");
  if (movie["יס"] === 1) platforms.push("יס");
  if (movie["הוט"] === 1) platforms.push("הוט");
  if (platforms.length > 0) {
    details += `<b>זמין ב:</b> ${platforms.join(", ")}<br>`;
  } else {
    details += `<b>זמין ב:</b> לא ידוע<br>`;
  }
  if (movie.trailer) details += `<a href="${movie.trailer}" target="_blank">צפה בטריילר</a>`;
  return details;
}


// --- טיפול באירועי UI ---

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM Loaded. Initializing bot...");
  addMessage('bot', welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
  await loadMoviesDatabase(); // טוען את מאגר הסרטים בטעינת הדף
});

document.getElementById('send-button').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();

  if (message) {
    addMessage('user', message);
    userInput.value = ''; // נקה את תיבת הקלט

    const movies = await loadMoviesDatabase(); // ודא שהמאגר טעון
    const botResponse = await generateSmartResponse(message, movies);
    addMessage('bot', botResponse);
  }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('send-button').click();
  }
});
