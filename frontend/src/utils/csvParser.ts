import { Question, Answer } from '../types/game';

/**
 * Splits a CSV line into columns, respecting quoted strings that may contain commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export interface CSVParseResult {
  success: boolean;
  questions: Question[];
  totalQuestions: number;
  totalAnswers: number;
  errors: string[];
}

/**
 * Parses CSV content with expected fields:
 * Question ID, Question, Rank, Answer, Points
 * (Also tolerates leading comma/index, e.g. ,Question ID,Question,Rank,Answer,Points)
 */
export function parseSurveyCSV(csvText: string): CSVParseResult {
  const errors: string[] = [];
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      questions: [],
      totalQuestions: 0,
      totalAnswers: 0,
      errors: ['The CSV file is empty.'],
    };
  }

  // Detect header indices
  const headerTokens = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/["']/g, ''));

  let qidIdx = -1;
  let qTextIdx = -1;
  let rankIdx = -1;
  let ansIdx = -1;
  let ptsIdx = -1;

  for (let i = 0; i < headerTokens.length; i++) {
    const token = headerTokens[i];
    if (token === 'question id' || token === 'question_id' || token === 'qid') {
      qidIdx = i;
    } else if (token === 'question' || token === 'question text' || token === 'prompt') {
      qTextIdx = i;
    } else if (token === 'rank' || token === 'order' || token === '#') {
      rankIdx = i;
    } else if (token === 'answer' || token === 'response') {
      ansIdx = i;
    } else if (token === 'points' || token === 'point' || token === 'score' || token === 'pts') {
      ptsIdx = i;
    }
  }

  // Fallback defaults if header matching failed but column count matches standard layouts
  let startIndex = 1;
  if (qidIdx === -1 || qTextIdx === -1 || ansIdx === -1 || ptsIdx === -1) {
    // Check if line 0 might actually be data or if standard column positions apply
    if (headerTokens.length >= 6 && headerTokens[0] === '') {
      // e.g. ,Question ID,Question,Rank,Answer,Points
      qidIdx = 1;
      qTextIdx = 2;
      rankIdx = 3;
      ansIdx = 4;
      ptsIdx = 5;
    } else if (headerTokens.length >= 5) {
      // Question ID,Question,Rank,Answer,Points
      qidIdx = 0;
      qTextIdx = 1;
      rankIdx = 2;
      ansIdx = 3;
      ptsIdx = 4;
    } else {
      return {
        success: false,
        questions: [],
        totalQuestions: 0,
        totalAnswers: 0,
        errors: [
          'Could not identify required columns. Expected fields: Question ID, Question, Rank, Answer, Points',
        ],
      };
    }
  }

  // Map of questionId -> { text: string, answers: Answer[] }
  const questionMap = new Map<string, { id: string; text: string; answers: Answer[] }>();

  for (let i = startIndex; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 3 || row.every((c) => c === '')) continue;

    const qidRaw = (row[qidIdx] || '').trim();
    const qTextRaw = (row[qTextIdx] || '').trim().replace(/^["']|["']$/g, '');
    const rankRaw = parseInt(row[rankIdx] || '') || 0;
    const ansTextRaw = (row[ansIdx] || '').trim().replace(/^["']|["']$/g, '');
    const ptsRaw = parseInt(row[ptsIdx] || '') || 0;

    if (!qTextRaw && !qidRaw) {
      continue;
    }

    const qKey = qidRaw || qTextRaw.toUpperCase();

    if (!questionMap.has(qKey)) {
      questionMap.set(qKey, {
        id: `csv-${qKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        text: qTextRaw ? qTextRaw.toUpperCase() : `QUESTION ${qKey}`,
        answers: [],
      });
    }

    const qGroup = questionMap.get(qKey)!;
    // Update question text if previously blank
    if (qTextRaw && (!qGroup.text || qGroup.text.startsWith('QUESTION '))) {
      qGroup.text = qTextRaw.toUpperCase();
    }

    if (ansTextRaw) {
      qGroup.answers.push({
        id: `csv-${qKey}-${qGroup.answers.length + 1}-${Date.now()}`,
        rank: rankRaw > 0 ? rankRaw : qGroup.answers.length + 1,
        text: ansTextRaw.toUpperCase(),
        points: ptsRaw,
        revealed: false,
      });
    }
  }

  // Transform into final Question array, normalizing ranks and respondents
  const parsedQuestions: Question[] = [];
  let totalAnswersCount = 0;

  for (const [key, qData] of questionMap.entries()) {
    if (qData.answers.length === 0) continue;

    // Sort answers by rank (or by points descending if ranks are uniform)
    qData.answers.sort((a, b) => a.rank - b.rank);

    // Re-index ranks 1..N cleanly
    qData.answers.forEach((a, idx) => {
      a.rank = idx + 1;
    });

    const totalPts = qData.answers.reduce((acc, a) => acc + a.points, 0);

    parsedQuestions.push({
      id: qData.id,
      surveyId: `#${key.slice(0, 10)}`,
      text: qData.text,
      totalRespondents: totalPts || 100,
      answers: qData.answers,
    });

    totalAnswersCount += qData.answers.length;
  }

  if (parsedQuestions.length === 0) {
    return {
      success: false,
      questions: [],
      totalQuestions: 0,
      totalAnswers: 0,
      errors: ['No valid question records could be extracted from the CSV.'],
    };
  }

  return {
    success: true,
    questions: parsedQuestions,
    totalQuestions: parsedQuestions.length,
    totalAnswers: totalAnswersCount,
    errors,
  };
}

export const SAMPLE_SURVEY_CSV = `Question ID,Question,Rank,Answer,Points
1,Name something people do immediately after waking up,1,Check their phone,70
1,Name something people do immediately after waking up,2,Turn off the alarm / snooze,59
1,Name something people do immediately after waking up,3,Use the bathroom,48
1,Name something people do immediately after waking up,4,Stretch or yawn,37
1,Name something people do immediately after waking up,5,Brush their teeth,26
1,Name something people do immediately after waking up,6,Make coffee or tea,15
1,Name something people do immediately after waking up,7,Go back to sleep,7
2,Name something people do in an elevator when they are alone,1,Take selfie / make reels,70
2,Name something people do in an elevator when they are alone,2,Pant adjusting / hair adjusting,59
2,Name something people do in an elevator when they are alone,3,Sing / hum music,48
2,Name something people do in an elevator when they are alone,4,Pick your nose / clean your mouth,37
2,Name something people do in an elevator when they are alone,5,Dancing,26
2,Name something people do in an elevator when they are alone,6,Farting,15
2,Name something people do in an elevator when they are alone,7,Press all the buttons,7
3,Name a good place to go when you want to cry,1,Bathroom,70
3,Name a good place to go when you want to cry,2,Bedroom,59
3,Name a good place to go when you want to cry,3,Mom's lap,48
3,Name a good place to go when you want to cry,4,Friend,37
3,Name a good place to go when you want to cry,5,Terrace / balcony,26
3,Name a good place to go when you want to cry,6,Beach / park,15
3,Name a good place to go when you want to cry,7,Worship place,7
4,"Name a ""throwback"" cartoon show that teens love to watch",1,Tom and Jerry,70
4,"Name a ""throwback"" cartoon show that teens love to watch",2,Shinchan,59
4,"Name a ""throwback"" cartoon show that teens love to watch",3,Doraemon,48
4,"Name a ""throwback"" cartoon show that teens love to watch",4,Ben 10,37
4,"Name a ""throwback"" cartoon show that teens love to watch",5,Pokemon,26
4,"Name a ""throwback"" cartoon show that teens love to watch",6,Ninja Hattori,15
4,"Name a ""throwback"" cartoon show that teens love to watch",7,Jackie Chan,7
5,Name a reason a person might wake up at 2:00 in the morning,1,Needed to use the bathroom,70
5,Name a reason a person might wake up at 2:00 in the morning,2,Thirsty,59
5,Name a reason a person might wake up at 2:00 in the morning,3,Nightmare / bad dream,48
5,Name a reason a person might wake up at 2:00 in the morning,4,Heard a strange noise,37
5,Name a reason a person might wake up at 2:00 in the morning,5,Too hot or too cold,26
5,Name a reason a person might wake up at 2:00 in the morning,6,Phone call / notification,15
5,Name a reason a person might wake up at 2:00 in the morning,7,Hungry / midnight craving,7
6,Name something that's forbidden in most swimming pools,1,Running around the pool,70
6,Name something that's forbidden in most swimming pools,2,Peeing,59
6,Name something that's forbidden in most swimming pools,3,Diving,48
6,Name something that's forbidden in most swimming pools,4,Smoking / drinking,37
6,Name something that's forbidden in most swimming pools,5,Eating,26
6,Name something that's forbidden in most swimming pools,6,Bringing pets,15
6,Name something that's forbidden in most swimming pools,7,Nudity,7
7,Where do you go barefoot?,1,House,70
7,Where do you go barefoot?,2,Bed,59
7,Where do you go barefoot?,3,Shower,48
7,Where do you go barefoot?,4,Beach,37
7,Where do you go barefoot?,5,Worship place,26
7,Where do you go barefoot?,6,Classical dance / yoga studios,15
7,Where do you go barefoot?,7,Exam hall,7
8,Name something that can destroy a friendship instantly,1,Betrayal / breaking trust,70
8,Name something that can destroy a friendship instantly,2,Dating a friend's ex or crush,59
8,Name something that can destroy a friendship instantly,3,Talking behind their back,48
8,Name something that can destroy a friendship instantly,4,Lying,37
8,Name something that can destroy a friendship instantly,5,Spreading rumors,26
8,Name something that can destroy a friendship instantly,6,Revealing a secret,15
8,Name something that can destroy a friendship instantly,7,Insulting their family or partner,7
9,What do you do before going to bed?,1,Brush your teeth,70
9,What do you do before going to bed?,2,Set an alarm,59
9,What do you do before going to bed?,3,Watch reels / series,48
9,What do you do before going to bed?,4,Turn off the lights,37
9,What do you do before going to bed?,5,Use the restroom,26
9,What do you do before going to bed?,6,Take a bath,15
9,What do you do before going to bed?,7,Listen to music,7
10,In which place are you told to whisper?,1,Library,70
10,In which place are you told to whisper?,2,Movie theatre,59
10,In which place are you told to whisper?,3,Exam Hall,48
10,In which place are you told to whisper?,4,Worship place / Meditation Hall,37
10,In which place are you told to whisper?,5,Funeral,26
10,In which place are you told to whisper?,6,Classroom,15
10,In which place are you told to whisper?,7,Crowd Gathering / meeting,7
11,What's something you would never borrow from your friend?,1,Underwear,70
11,What's something you would never borrow from your friend?,2,Toothbrush,59
11,What's something you would never borrow from your friend?,3,Money,48
11,What's something you would never borrow from your friend?,4,Car,37
11,What's something you would never borrow from your friend?,5,Pillow,26
11,What's something you would never borrow from your friend?,6,Laptop,15
11,What's something you would never borrow from your friend?,7,Helmet,7
12,Name something people do after accidentally sending a message to the wrong person,1,Delete or unsend it,70
12,Name something people do after accidentally sending a message to the wrong person,2,Apologize immediately,59
12,Name something people do after accidentally sending a message to the wrong person,3,Explain that it was meant for someone else,48
12,Name something people do after accidentally sending a message to the wrong person,4,Panic,37
12,Name something people do after accidentally sending a message to the wrong person,5,Send a follow-up clarification,26
12,Name something people do after accidentally sending a message to the wrong person,6,Pretend it never happened / ghost them,15
12,Name something people do after accidentally sending a message to the wrong person,7,Turn off their phone / avoid replying,7`;
