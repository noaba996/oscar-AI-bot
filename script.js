// 🎭 הודעות פתיחה
const welcomeMessages = [
  "שלום! אני אוסקר, בוט המלצות הסרטים שלך 🎬 איזה סרט מעניין אותך היום?",
  "היי! אני אוסקר ואני מתמחה בהמלצות סרטים 🍿 מה תרצה לראות?",
  "ברוכים הבאים! אני אוסקר ואשמח לעזור לך למצוא סרט מושלם 🎭 מה אתה מחפש?"
];

// 📚 מאגר סרטים זמני (ישמש כגיבוי) - נשמר כפי שהיה, אך עשוי לדרוש התאמות קטנות אם יש חוסר התאמה בז'אנרים/טווח גילאים
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
    ageRange: "16+", // Changed from 16+ to 17+ for consistency with Gemini output range if needed
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
    ageRange: "12+", // Changed to 13+ for consistency with Gemini output range if needed
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
    ageRange: "12+", // Changed to 13+ for consistency with Gemini output range if needed
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
    ageRange: "16+", // Changed to 17+ for consistency with Gemini output range if needed
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


// Gemini API configuration
// WARNING: Exposing API keys in client-side code is a security risk.
// For production, use a backend proxy.
const API_KEY = "AIzaSyAq-ngUJxyiZM2zkKyyv2yq2b5KsDx5c1M"; // Your API Key
const model = new GoogleGenerativeAI(API_KEY).getGenerativeModel({ model: "gemini-pro" });

// Function to load movie database
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

// Conversation memory
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

// --- Gemini Integration ---

// Function to analyze text using Gemini
async function analyzeText(text) {
  const prompt = `
    אתה אוסקר, בוט המלצות סרטים. המשתמש אמר: "${text}".
    אנא חלץ מתוך הטקסט את הפרטים הבאים. היה גמיש בהבנת כוונת המשתמש, גם עם שגיאות כתיב או ניסוחים לא ברורים.
    אם המשתמש אומר משהו כמו "משהו שישמח אותי", נסה להסיק ז'אנר או מצב רוח מתאים (למשל: קומדיה, שמח).
    אם המשתמש מבקש ללא מפורש ז'אנר, אך אומר משהו כמו "בא לי לראות משהו קליל", פרש זאת כקומדיה.
    אם המשתמש אומר "לא רוצה" או "בלי" משהו ספציפי (למשל, ז'אנר), רשום זאת ברשימה נפרדת.

    1. **ז'אנרים מבוקשים (genres)**: רשימת ז'אנרים (לדוגמה: אקשן, קומדיה, דרמה). השתמש בשמות ז'אנרים מוכרים באנגלית כמו "Action", "Comedy", "Drama", "Sci-Fi", "Fantasy", "Animation", "Thriller", "Horror", "Romance", "Adventure", "Crime", "Mystery", "Family", "Biography", "History", "Documentary", "Musical", "Western", "War". אם המשתמש אומר ז'אנר בעברית, המר אותו לפורמט האנגלי המקובל.
    2. **ז'אנרים להוציא (excludeGenres)**: רשימת ז'אנרים שהמשתמש לא רוצה.
    3. **מצב רוח (moods)**: מצב הרוח של המשתמש (לדוגמה: שמח, עצוב, מרומם, רגוע, מרגש, מפחיד, רומנטי, נוסטלגי, מעורר השראה, משעשע, משועמם, עייף).
    4. **פלטפורמות צפייה (platforms)**: רשימת פלטפורמות (לדוגמה: נטפליקס, יס, הוט). אם המשתמש אומר "לא בנטפליקס", זה אומר שהוא לא רוצה סרטים משם.
    5. **טווח גילאים (ageRange)**: טווח גילאים מומלץ לסרט (אחד מהבאים: "7+", "13+", "17+"). אם המשתמש מציין גיל ספציפי (למשל: "אני בן 10", "לגיל 15"), תרגם זאת לטווח המתאים. אם המשתמש אומר "לילדים", פרש כ-"7+". אם המשתמש אומר "לנוער", פרש כ-"13+". אם המשתמש אומר "למבוגרים", פרש כ-"17+".
    6. **אורך סרט (duration)**: העדפת אורך הסרט (אחד מהבאים: "קצר" - עד 90 דקות, "בינוני" - 91-120 דקות, "ארוך" - מעל 120 דקות).
    7. **שחקנים מועדפים (actors)**: רשימת שחקנים שהוזכרו.
    8. **במאים מועדפים (directors)**: רשימת במאים שהוזכרו.
    9. **פקודה (command)**: אם המשתמש מבקש "עוד", "נוספים", "תודה" או "סיום שיחה" / "ביי" / "להתראות". השתמש בערכים: "אחרים", "תודה", "סיום". אם המשתמש רוצה לאפס את השיחה (למשל, "התחל מחדש"), השתמש בערך "איפוס".

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
      "command": null
    }

    חשוב: התשובה שלך צריכה להכיל אך ורק את אובייקט ה-JSON, ללא טקסט נוסף לפני או אחרי.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    console.log("Gemini Raw Response Text:", textResponse);

    // Attempt to parse JSON. Gemini sometimes includes markdown fences (```json).
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
    console.error("❌ שגיאה בקריאה ל-Gemini API:", error);
    showError("אופס! נראה שיש תקלה קלה במערכת. אנא נסה שוב מאוחר יותר. 🛠️");
    // Return a default empty analysis in case of error
    return {
      genres: [],
      excludeGenres: [],
      moods: [],
      platforms: [],
      ageRange: null,
      duration: null,
      actors: [],
      directors: [],
      command: null
    };
  }
}

// Function to get the next question
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

// Function to generate a smart response based on Gemini's analysis
async function generateSmartResponse(message, movies) {
  const analysis = await analyzeText(message); // Perform analysis using Gemini

  let response = "";

  console.log("Debug: generateSmartResponse - analysis from current message:", analysis);
  console.log("Debug: generateSmartResponse - conversationMemory before update:", { ...conversationMemory });

  if (analysis.command === "תודה") {
    const randomThankYou = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
    return randomThankYou;
  }

  if (analysis.command === "סיום") {
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
    // Reset conversation
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
      recommendationOffset: 0
    };
    return randomGoodbye;
  }

  if (analysis.command === "איפוס") {
    clearConversation(message); // Calls clearConversation which also handles the welcome message
    return; // clearConversation handles the response
  }

  // Determine if it's a new genre request or "more" command
  const isNewGenreRequest = analysis.genres.length > 0 &&
    (conversationMemory.lastGenres.length === 0 ||
      JSON.stringify(analysis.genres) !== JSON.stringify(conversationMemory.lastGenres));

  if (isNewGenreRequest) {
    conversationMemory.recommendationOffset = 0;
    console.log("Debug: generateSmartResponse - New genre request detected, resetting offset to 0.");
  } else if (analysis.command === "אחרים") {
    conversationMemory.recommendationOffset += 3;
    console.log("Debug: generateSmartResponse - 'Other' command detected, incrementing offset to:", conversationMemory.recommendationOffset);
  }

  // Update conversation memory with Gemini's analysis
  if (analysis.genres && analysis.genres.length > 0) {
    conversationMemory.lastGenres = analysis.genres;
    conversationMemory.collectedInfo.genres = true;
  }
  if (analysis.moods && analysis.moods.length > 0) {
    conversationMemory.lastMoods = analysis.moods;
  }
  // Handle platforms specifically. If Gemini finds "no" platforms, ensure it's recorded.
  if (analysis.platforms !== undefined) { // Check if platforms field exists in Gemini's output
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
  // Store excluded genres from Gemini, if any
  conversationMemory.excludeGenres = analysis.excludeGenres || [];


  console.log("Debug: generateSmartResponse - conversationMemory after update:", { ...conversationMemory });

  // Check if enough info is collected
  const infoTypesToCollect = ["genres", "age", "duration", "platforms"];
  const allRequiredInfoCollected = infoTypesToCollect.every(type => conversationMemory.collectedInfo[type] === true);

  console.log("Debug: generateSmartResponse - allRequiredInfoCollected:", allRequiredInfoCollected);

  if (allRequiredInfoCollected) {
    conversationMemory.conversationState = "recommending";

    console.log("🎯 מחפש סרטים עם הז'אנרים:", conversationMemory.lastGenres);

    const foundMovies = analyzeAndFindMovies(movies); // Now only depends on conversationMemory
    const moviesToRecommend = foundMovies.slice(conversationMemory.recommendationOffset, conversationMemory.recommendationOffset + 3);

    if (moviesToRecommend.length > 0) {
      response += "<br><br>הנה כמה המלצות בשבילך:<br><br>";

      moviesToRecommend.forEach((movie, index) => {
        response += `${index + 1}. ${formatMovieRecommendation(movie)}<br><br>`;
      });

      if (foundMovies.length > (conversationMemory.recommendationOffset + 3)) {
        response += "<br>רוצה לראות המלצות נוספות? פשוט תגיד 'עוד' או 'אחרים'! 😉<br>";
      }

      // Add mood-specific response
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

      // Reset if no movies found at all
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
      conversationMemory.userPreferences.favoriteActors = [];
      conversationMemory.userPreferences.favoriteDirectors = [];
      conversationMemory.recommendationOffset = 0;
      conversationMemory.excludeGenres = [];

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
    if (analysis.genres && analysis.genres.length > 0) providedInfo.push("ז'אנר");
    if (analysis.ageRange) providedInfo.push("גיל");
    if (analysis.duration) providedInfo.push("אורך סרט");
    if (analysis.platforms && analysis.platforms.length > 0) providedInfo.push("פלטפורמת צפייה");
    // Only acknowledge if new information was explicitly provided, not just confirmation
    if (providedInfo.length > 0 || (analysis.moods && analysis.moods.length > 0)) {
        if (providedInfo.length > 0) {
            response += `תודה על המידע שסיפקת בנוגע ל${providedInfo.join(' ו-')}.`;
        }
        if (analysis.moods && analysis.moods.length > 0) {
            response += ` אני מבין שאתה מרגיש ${analysis.moods[0]}.`;
        }
        response += " <br><br>";
    } else {
        // If no new info and not a clear message, just say something polite before asking the next question
        if (message.trim().length > 0) { // Check if it's not an empty message
             response += "אוקיי. ";
             response += " <br><br>";
        }
    }


    if (nextQuestion) {
      response += `${nextQuestion.question}`;
      conversationMemory.lastQuestion = nextQuestion.id;
    } else {
      // Fallback if no next question, but not all info collected (shouldn't happen with the current flow)
      response += "אנא ספר לי עוד על מה שאתה מחפש.";
      conversationMemory.lastQuestion = null;
    }
  }

  console.log("Debug: generateSmartResponse - Final response length:", response.length);
  return response || "אשמח לעזור לך למצוא סרט מושלם! מה מעניין אותך?";
}


// Function to find movies based on conversation memory
function analyzeAndFindMovies(movies) {
  let filtered = [...movies];

  console.log("🔍 מחפש סרטים בהתאם לזיכרון השיחה:");
  console.log("📊 זיכרון שיחה נוכחי:", conversationMemory);

  // Filter by requested genres
  if (conversationMemory.lastGenres.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by genres:", conversationMemory.lastGenres);
    filtered = filtered.filter(movie => {
      const movieGenres = movie.Genres.toLowerCase().split(", ").map(g => g.trim());
      return conversationMemory.lastGenres.some(requestedGenre => {
        // Convert requested Hebrew genre from Gemini to English if needed for matching
        const englishGenre = requestedGenre.toLowerCase(); // Gemini should return English, but normalize just in case
        return movieGenres.includes(englishGenre);
      });
    });
    console.log("Debug: analyzeAndFindMovies - Movies after genre filtering:", filtered.map(m => m.Title));
  }

  // Filter out excluded genres
  if (conversationMemory.excludeGenres && conversationMemory.excludeGenres.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Excluding genres:", conversationMemory.excludeGenres);
    filtered = filtered.filter(movie => {
      const movieGenres = movie.Genres.toLowerCase().split(", ").map(g => g.trim());
      return !conversationMemory.excludeGenres.some(excludedGenre => {
        const englishExcludedGenre = excludedGenre.toLowerCase();
        return movieGenres.includes(englishExcludedGenre);
      });
    });
    console.log("Debug: analyzeAndFindMovies - Movies after excludeGenre filtering:", filtered.map(m => m.Title));
  }


  // Filter by mood (can also infer genres based on mood if Gemini didn't)
  if (conversationMemory.lastMoods.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by mood. Current movies:", filtered.map(m => m.Title));
    const mood = conversationMemory.lastMoods[0];
    switch (mood) {
      case "עצוב":
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("comedy") ||
          movie.Genres.toLowerCase().includes("family") ||
          movie.Genres.toLowerCase().includes("animation")
        );
        break;
      case "שמח": // If Gemini inferred "שמח", prioritize upbeat genres
      case "משעשע":
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("comedy") ||
          movie.Genres.toLowerCase().includes("animation") ||
          movie.Genres.toLowerCase().includes("family")
        );
        break;
      case "מרומם": // Encouraging/inspirational
      case "מעורר השראה":
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("drama") ||
          movie.Genres.toLowerCase().includes("biography") ||
          movie.Genres.toLowerCase().includes("history")
        );
        break;
      case "רגוע": // Calm
        filtered = filtered.filter(movie =>
          !(movie.Genres.toLowerCase().includes("action") || movie.Genres.toLowerCase().includes("thriller") || movie.Genres.toLowerCase().includes("horror"))
        );
        break;
      case "מרגש": // Emotional/thrilling (can be drama or thriller)
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
          movie.Genres.toLowerCase().includes("romance") ||
          (movie.Genres.toLowerCase().includes("comedy") && movie.Genres.toLowerCase().includes("drama"))
        );
        break;
      case "נוסטלגי":
        filtered = filtered.filter(movie =>
          movie.Release_Year < 2005 // Arbitrary year for "nostalgic"
        );
        break;
      case "משועמם": // Maybe something exciting
        filtered = filtered.filter(movie =>
          movie.Genres.toLowerCase().includes("action") ||
          movie.Genres.toLowerCase().includes("adventure") ||
          movie.Genres.toLowerCase().includes("sci-fi")
        );
        break;
      case "עייף": // Something light and short
        filtered = filtered.filter(movie =>
          (movie.Duration && movie.Duration <= 100) &&
          (movie.Genres.toLowerCase().includes("comedy") || movie.Genres.toLowerCase().includes("animation") || movie.Genres.toLowerCase().includes("family"))
        );
        break;
    }
    console.log("Debug: analyzeAndFindMovies - Movies after mood filtering:", filtered.map(m => m.Title));
  }


  // Filter by platform
  if (conversationMemory.lastPlatforms.length > 0) {
    console.log("Debug: analyzeAndFindMovies - Filtering by platforms. Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie =>
      conversationMemory.lastPlatforms.some(platform => {
        // Ensure platform name matches the JSON key (e.g., "נטפליקס" not "netflix")
        const normalizedPlatform = platform.charAt(0).toUpperCase() + platform.slice(1); // Capitalize first letter (e.g. "נטפליקס")
        return movie[normalizedPlatform] === 1;
      })
    );
    console.log("Debug: analyzeAndFindMovies - Movies after platform filtering:", filtered.map(m => m.Title));
  }

  // Filter by age
  if (conversationMemory.userPreferences.age) {
    console.log("Debug: analyzeAndFindMovies - Filtering by age. User preference:", conversationMemory.userPreferences.age, ". Current movies:", filtered.map(m => m.Title));
    filtered = filtered.filter(movie => {
      const movieAgeRange = movie.ageRange;
      const userAgePreference = conversationMemory.userPreferences.age;
      let isMatch = false;

      // Logic based on movie's stated age range vs. user's preference
      if (userAgePreference === "7+") {
        isMatch = (movieAgeRange === "7+" || movieAgeRange === "All Ages");
      } else if (userAgePreference === "13+") {
        isMatch = (movieAgeRange === "7+" || movieAgeRange === "13+" || movieAgeRange === "All Ages");
      } else if (userAgePreference === "17+") {
        isMatch = true; // All movies are potentially suitable for 17+ (they can decide)
      }

      console.log(`Debug: Checking movie '${movie.Title}' (age: ${movie.ageRange}) against user preference '${conversationMemory.userPreferences.age}'. Match: ${isMatch}`);
      return isMatch;
    });
    console.log("Debug: analyzeAndFindMovies - Movies after age filtering:", filtered.map(m => m.Title));
  }

  // Filter by movie duration
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

  // Filter by actors (requires 'Stars' field in movies.json)
  if (conversationMemory.userPreferences.favoriteActors.length > 0) {
    filtered = filtered.filter(movie =>
      movie.Stars && conversationMemory.userPreferences.favoriteActors.some(actor =>
        movie.Stars.toLowerCase().includes(actor.toLowerCase())
      )
    );
  }

  // Filter by directors (requires 'Director' field in movies.json)
  if (conversationMemory.userPreferences.favoriteDirectors.length > 0) {
    filtered = filtered.filter(movie =>
      movie.Director && conversationMemory.userPreferences.favoriteDirectors.some(director =>
        movie.Director.toLowerCase().includes(director.toLowerCase())
      )
    );
  }

  // Sort by rating (descending)
  filtered.sort((a, b) => parseFloat(b.Rating) - parseFloat(a.Rating));

  // Store the full set of current recommendations in memory
  conversationMemory.lastRecommendations = filtered;

  console.log("🎯 סה״כ סרטים שנמצאו:", filtered.length);
  console.log("🏆 סרטים סופיים:", filtered.map(m => `${m.Title} (${m.Genres})`));

  return filtered;
}

// Format movie recommendation for display
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

// Function to send message
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";

  const convo = document.getElementById("conversation");

  convo.innerHTML += `<div class='bubble user'>${message}</div>`;
  const loadingId = Date.now();
  convo.innerHTML += `<div class='bubble bot' id='loading-${loadingId}'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">🤔 חושב על התשובה הטובה ביותר...</div>
  </div>`;

  try {
    const movies = await loadMoviesDatabase();
    const smartResponse = await generateSmartResponse(message, movies); // Await here

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

// Function to handle errors
function showError(error) {
  const convo = document.getElementById("conversation");
  let errorMessage = "אופס! משהו השתבש. בוא ננסה שוב? 🔧";

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    if (error.message.includes("Failed to load movies")) {
      errorMessage = `⚠️ לא הצלחתי לטעון את מאגר הסרטים.<br>
        אנא וודא שקובץ movies.json קיים ונגיש.`;
    } else if (error.message.includes("Gemini API call failed")) {
       errorMessage = `אוי לא! נראה שיש בעיה עם חיבור ה-AI. אנא נסה שוב בעוד רגע. 🤖`;
    } else if (error.message.includes("JSON.parse")) {
       errorMessage = `אופס! הייתה בעיה בהבנת התשובה מה-AI. נסה לנסח מחדש את בקשתך. 🙏`;
    }
  }

  convo.innerHTML += `<div class='bubble bot'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">${errorMessage}</div>
  </div>`;
}

// Keyboard events and initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 העמוד נטען - מתחיל אתחול...");

  const input = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton"); // Get the button by ID
  const convo = document.getElementById("conversation");

  if (!input || !convo || !sendButton) {
    console.error("❌ אלמנטים חיוניים לא נמצאו");
    return;
  }

  console.log("✅ אלמנטים נמצאו בהצלחה");

  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  sendButton.addEventListener('click', sendMessage); // Add event listener to the send button
  console.log("✅ Event listener הוגדר לקלט ולכפתור השליחה");

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
      <div class="bot-message">שלום! אני אוסקר, בוט המלצות הסרטים שלך 🎬 איזה סרט מעניין אותך היום?</div>
    </div>`;
  }

  console.log("🎉 אתחול הושלם בהצלחה - אוסקר מוכן לשימוש!");
});

// Function to clear conversation
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
    excludeGenres: [] // Reset this too
  };

  if (userMessage) {
    convo.innerHTML += `<div class='bubble user'>${userMessage}</div>`;
  }

  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  convo.innerHTML += `<div class='bubble bot'>
    <img src="OSCARPIC.jpeg" alt="Oscar" class="bot-avatar">
    <div class="bot-message">${randomWelcome}</div>
  </div>`;
  convo.scrollTop = convo.scrollHeight; // Scroll to bottom after clearing
}
