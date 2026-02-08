import { Question, Prize, LeaderboardEntry, EscapeRoom, BoardSquare } from '@/types/game';

export const trueFalseQuestions: Question[] = [
  { id: 1, question: "The Pythagorean theorem applies only to right triangles.", answer: true, category: 'math', difficulty: 'easy', points: 100 },
  { id: 2, question: "Shakespeare wrote 'Pride and Prejudice'.", answer: false, category: 'reading', difficulty: 'easy', points: 100 },
  { id: 3, question: "The mitochondria is known as the powerhouse of the cell.", answer: true, category: 'science', difficulty: 'easy', points: 100 },
  { id: 4, question: "The American Revolution ended in 1776.", answer: false, category: 'history', difficulty: 'medium', points: 150 },
  { id: 5, question: "A pronoun replaces a noun in a sentence.", answer: true, category: 'language', difficulty: 'easy', points: 100 },
  { id: 6, question: "The square root of 144 is 14.", answer: false, category: 'math', difficulty: 'easy', points: 100 },
  { id: 7, question: "Water boils at 100 degrees Celsius at sea level.", answer: true, category: 'science', difficulty: 'easy', points: 100 },
  { id: 8, question: "The Great Wall of China is visible from space.", answer: false, category: 'history', difficulty: 'medium', points: 150 },
  { id: 9, question: "An adverb modifies a verb, adjective, or another adverb.", answer: true, category: 'language', difficulty: 'medium', points: 150 },
  { id: 10, question: "The novel '1984' was written by George Orwell.", answer: true, category: 'reading', difficulty: 'easy', points: 100 },
  { id: 11, question: "Pi is exactly equal to 3.14.", answer: false, category: 'math', difficulty: 'medium', points: 150 },
  { id: 12, question: "Photosynthesis occurs in the nucleus of plant cells.", answer: false, category: 'science', difficulty: 'medium', points: 150 },
  { id: 13, question: "The Declaration of Independence was signed in 1776.", answer: true, category: 'history', difficulty: 'easy', points: 100 },
  { id: 14, question: "A simile uses 'like' or 'as' to make comparisons.", answer: true, category: 'language', difficulty: 'easy', points: 100 },
  { id: 15, question: "To Kill a Mockingbird is set in Alabama.", answer: true, category: 'reading', difficulty: 'medium', points: 150 },
  { id: 16, question: "The sum of angles in a triangle equals 180 degrees.", answer: true, category: 'math', difficulty: 'easy', points: 100 },
  { id: 17, question: "DNA stands for Deoxyribonucleic Acid.", answer: true, category: 'science', difficulty: 'medium', points: 150 },
  { id: 18, question: "World War I began in 1914.", answer: true, category: 'history', difficulty: 'easy', points: 100 },
  { id: 19, question: "A metaphor is a direct comparison without using 'like' or 'as'.", answer: true, category: 'language', difficulty: 'medium', points: 150 },
  { id: 20, question: "The Catcher in the Rye was written by F. Scott Fitzgerald.", answer: false, category: 'reading', difficulty: 'medium', points: 150 },
  { id: 21, question: "Negative numbers multiplied together give a positive result.", answer: true, category: 'math', difficulty: 'medium', points: 150 },
  { id: 22, question: "Electrons have a positive charge.", answer: false, category: 'science', difficulty: 'easy', points: 100 },
  { id: 23, question: "The Renaissance began in Italy.", answer: true, category: 'history', difficulty: 'medium', points: 150 },
  { id: 24, question: "An oxymoron combines contradictory terms.", answer: true, category: 'language', difficulty: 'hard', points: 200 },
  { id: 25, question: "Moby Dick is about a great white shark.", answer: false, category: 'reading', difficulty: 'easy', points: 100 },
  { id: 26, question: "Zero is considered an even number.", answer: true, category: 'math', difficulty: 'hard', points: 200 },
  { id: 27, question: "Sound travels faster than light.", answer: false, category: 'science', difficulty: 'easy', points: 100 },
  { id: 28, question: "The Cold War involved direct military combat between the US and USSR.", answer: false, category: 'history', difficulty: 'medium', points: 150 },
  { id: 29, question: "Alliteration is the repetition of consonant sounds.", answer: true, category: 'language', difficulty: 'medium', points: 150 },
  { id: 30, question: "The Odyssey was written by Homer.", answer: true, category: 'reading', difficulty: 'medium', points: 150 },
];

export const escapeRooms: EscapeRoom[] = [
  {
    id: 1,
    name: "The Classroom",
    equations: [
      { equation: "2x + 5 = 15", answer: 5 },
      { equation: "3y - 9 = 12", answer: 7 },
      { equation: "4z + 8 = 24", answer: 4 },
      { equation: "5a - 10 = 25", answer: 7 },
      { equation: "2b + 6 = 18", answer: 6 },
    ],
    isUnlocked: true,
    isCompleted: false
  },
  {
    id: 2,
    name: "The Library",
    equations: [
      { equation: "x² = 49", answer: 7 },
      { equation: "√y = 8", answer: 64 },
      { equation: "3x + 2y = 20, y = 4", answer: 4 },
      { equation: "2(x + 3) = 16", answer: 5 },
      { equation: "x/4 + 3 = 7", answer: 16 },
    ],
    isUnlocked: false,
    isCompleted: false
  },
  {
    id: 3,
    name: "The Laboratory",
    equations: [
      { equation: "x³ = 27", answer: 3 },
      { equation: "2x² - 8 = 10", answer: 3 },
      { equation: "log₁₀(x) = 2", answer: 100 },
      { equation: "(x + 2)(x - 2) = 21", answer: 5 },
      { equation: "3x + 4y = 26, x = 2", answer: 5 },
    ],
    isUnlocked: false,
    isCompleted: false
  }
];

export const generateBoardSquares = (): BoardSquare[] => {
  const categories: ('history' | 'language' | 'science' | 'reading')[] = ['history', 'language', 'science', 'reading'];
  const squares: BoardSquare[] = [];
  
  const categoryQuestions: Record<string, Question[]> = {
    history: [
      { id: 101, question: "In what year did World War II end?", answer: "1945", category: 'history', difficulty: 'easy', points: 100 },
      { id: 102, question: "Who was the first President of the United States?", answer: "George Washington", category: 'history', difficulty: 'easy', points: 100 },
      { id: 103, question: "The French Revolution began in what year?", answer: "1789", category: 'history', difficulty: 'medium', points: 150 },
      { id: 104, question: "Who discovered America in 1492?", answer: "Christopher Columbus", category: 'history', difficulty: 'easy', points: 100 },
      { id: 105, question: "The Berlin Wall fell in what year?", answer: "1989", category: 'history', difficulty: 'medium', points: 150 },
      { id: 106, question: "Who was the British Prime Minister during WWII?", answer: "Winston Churchill", category: 'history', difficulty: 'medium', points: 150 },
    ],
    language: [
      { id: 201, question: "What is the past tense of 'run'?", answer: "ran", category: 'language', difficulty: 'easy', points: 100 },
      { id: 202, question: "What type of word is 'quickly'?", answer: "adverb", category: 'language', difficulty: 'easy', points: 100 },
      { id: 203, question: "What is a word that means the opposite called?", answer: "antonym", category: 'language', difficulty: 'easy', points: 100 },
      { id: 204, question: "What punctuation ends an interrogative sentence?", answer: "question mark", category: 'language', difficulty: 'easy', points: 100 },
      { id: 205, question: "What is the plural of 'child'?", answer: "children", category: 'language', difficulty: 'easy', points: 100 },
      { id: 206, question: "What literary device gives human qualities to non-human things?", answer: "personification", category: 'language', difficulty: 'hard', points: 200 },
    ],
    science: [
      { id: 301, question: "What planet is known as the Red Planet?", answer: "Mars", category: 'science', difficulty: 'easy', points: 100 },
      { id: 302, question: "What is the chemical symbol for water?", answer: "H2O", category: 'science', difficulty: 'easy', points: 100 },
      { id: 303, question: "How many bones are in the adult human body?", answer: "206", category: 'science', difficulty: 'medium', points: 150 },
      { id: 304, question: "What gas do plants absorb from the atmosphere?", answer: "Carbon dioxide", category: 'science', difficulty: 'easy', points: 100 },
      { id: 305, question: "What is the largest organ in the human body?", answer: "Skin", category: 'science', difficulty: 'medium', points: 150 },
      { id: 306, question: "What is the speed of light in km/s (approximately)?", answer: "300000", category: 'science', difficulty: 'hard', points: 200 },
    ],
    reading: [
      { id: 401, question: "Who wrote 'Romeo and Juliet'?", answer: "Shakespeare", category: 'reading', difficulty: 'easy', points: 100 },
      { id: 402, question: "What is the main character in a story called?", answer: "protagonist", category: 'reading', difficulty: 'easy', points: 100 },
      { id: 403, question: "Who wrote 'The Great Gatsby'?", answer: "F. Scott Fitzgerald", category: 'reading', difficulty: 'medium', points: 150 },
      { id: 404, question: "What is the turning point of a story called?", answer: "climax", category: 'reading', difficulty: 'medium', points: 150 },
      { id: 405, question: "Who wrote 'Harry Potter'?", answer: "J.K. Rowling", category: 'reading', difficulty: 'easy', points: 100 },
      { id: 406, question: "What narrative technique tells a story from 'I' perspective?", answer: "first person", category: 'reading', difficulty: 'medium', points: 150 },
    ]
  };
  
  for (let i = 0; i < 25; i++) {
    const category = categories[i % 4];
    const isTrap = Math.random() < 0.16; // ~4 traps on the board
    const questionIndex = Math.floor(i / 4) % categoryQuestions[category].length;
    
    squares.push({
      id: i,
      category,
      isTrap,
      trapType: isTrap ? (Math.random() < 0.5 ? 'loseTurn' : 'losePoints') : undefined,
      pointsLoss: isTrap ? Math.floor(Math.random() * 3 + 1) * 50 : undefined,
      isRevealed: false,
      question: categoryQuestions[category][questionIndex]
    });
  }
  
  return squares;
};

export const prizes: Prize[] = [
  { id: '1', name: '10% Off SAT Prep Course', description: 'Get 10% off any SAT preparation course', pointsCost: 500, image: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321952027_fe4e493d.png', category: 'discount' },
  { id: '2', name: 'Study Guide eBook', description: 'Complete SAT study guide digital download', pointsCost: 750, image: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321952027_fe4e493d.png', category: 'merchandise' },
  { id: '3', name: '25% Off Tutoring Session', description: 'One-on-one tutoring session discount', pointsCost: 1000, image: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321952027_fe4e493d.png', category: 'discount' },
  { id: '4', name: 'Premium Avatar Pack', description: 'Unlock exclusive avatar customizations', pointsCost: 300, image: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg', category: 'merchandise' },
  { id: '5', name: 'Practice Test Bundle', description: '5 full-length practice SAT tests', pointsCost: 1500, image: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321952027_fe4e493d.png', category: 'merchandise' },
  { id: '6', name: 'Virtual Study Session', description: 'Join an exclusive group study session', pointsCost: 2000, image: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321952027_fe4e493d.png', category: 'experience' },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: { id: '1', username: 'MathWizard99', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg', points: 15000, rank: 1, gamesPlayed: 50, wins: 45 }, score: 9850, date: '2026-01-12' },
  { rank: 2, user: { id: '2', username: 'ScienceQueen', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321810567_99563e03.jpg', points: 14200, rank: 2, gamesPlayed: 48, wins: 40 }, score: 9720, date: '2026-01-12' },
  { rank: 3, user: { id: '3', username: 'HistoryBuff', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321811522_a9a123dd.png', points: 13500, rank: 3, gamesPlayed: 45, wins: 38 }, score: 9650, date: '2026-01-11' },
  { rank: 4, user: { id: '4', username: 'WordSmith', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321872035_87a820c3.png', points: 12800, rank: 4, gamesPlayed: 42, wins: 35 }, score: 9500, date: '2026-01-11' },
  { rank: 5, user: { id: '5', username: 'BrainiacX', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg', points: 12000, rank: 5, gamesPlayed: 40, wins: 32 }, score: 9350, date: '2026-01-10' },
  { rank: 6, user: { id: '6', username: 'QuizMaster', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321810567_99563e03.jpg', points: 11500, rank: 6, gamesPlayed: 38, wins: 30 }, score: 9200, date: '2026-01-10' },
  { rank: 7, user: { id: '7', username: 'StudyPro', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321811522_a9a123dd.png', points: 11000, rank: 7, gamesPlayed: 36, wins: 28 }, score: 9050, date: '2026-01-09' },
  { rank: 8, user: { id: '8', username: 'AcePilot', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321872035_87a820c3.png', points: 10500, rank: 8, gamesPlayed: 34, wins: 26 }, score: 8900, date: '2026-01-09' },
  { rank: 9, user: { id: '9', username: 'TopStudent', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg', points: 10000, rank: 9, gamesPlayed: 32, wins: 24 }, score: 8750, date: '2026-01-08' },
  { rank: 10, user: { id: '10', username: 'ChampionX', email: '', avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321810567_99563e03.jpg', points: 9500, rank: 10, gamesPlayed: 30, wins: 22 }, score: 8600, date: '2026-01-08' },
];

export const hostQuotes = {
  welcome: [
    "Welcome to FINAL EXAM! I'm Principal Powers, and today we separate the scholars from the slackers!",
    "Alright students, time to show me what you've got! No bathroom breaks, no excuses!",
    "Listen up! This is MY arena, and only the smartest survive!"
  ],
  round1Intro: [
    "Round ONE! True or False - you've got 5 minutes to prove you actually paid attention in class!",
    "Speed round time! True or False questions coming at you FAST. Don't embarrass yourself!",
    "Let's see if you can handle the basics! TRUE or FALSE - no maybe, no 'I think so'!"
  ],
  round2Intro: [
    "Round TWO! The Math Escape Room! Solve equations or stay trapped forever... well, for 10 minutes anyway.",
    "Time to put those math skills to work! Three rooms, ten minutes. The clock is NOT your friend!",
    "Welcome to the escape room! Hope you didn't sleep through algebra!"
  ],
  round3Intro: [
    "Round THREE! The Game Board! Pick your category, but watch out for TRAPS! I love traps!",
    "Category time! History, Language, Science, Reading - and a few surprises I planted myself!",
    "Choose wisely on this board! Some squares bite back!"
  ],
  round4Intro: [
    "FINAL ROUND! Your team better not let you down! Five minutes, random questions, TEAMWORK!",
    "Time for the team round! Let's see if your friends are as smart as you think they are!",
    "Last chance for glory! Your team's got 5 minutes to seal the deal!"
  ],
  correct: [
    "CORRECT! Maybe you DO belong in my school!",
    "That's right! I'm almost impressed!",
    "Nailed it! Keep that energy!",
    "Boom! Someone's been studying!"
  ],
  incorrect: [
    "WRONG! Did you even open a textbook?",
    "Ouch! That's gonna cost you!",
    "Incorrect! My grandmother could've gotten that one!",
    "Nope! Back to the books for you!"
  ],
  timeUp: [
    "TIME'S UP! Pencils down, no exceptions!",
    "BUZZER! That's all the time you get!",
    "And that's the bell! No extra credit here!"
  ],
  victory: [
    "CONGRATULATIONS! You've proven yourself worthy of my respect... barely!",
    "WINNER! Now THAT'S what I like to see! Excellence!",
    "You did it! I knew you had it in you... okay, I had my doubts!"
  ],
  defeat: [
    "Better luck next time! My office hours are open for tutoring!",
    "Not your day, but champions get back up! Try again!",
    "Tough loss, but every failure is a lesson! Now get back in there!"
  ]
};
