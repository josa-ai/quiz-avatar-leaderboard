export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  category: 'math' | 'reading' | 'science' | 'history' | 'language';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const flashCards: FlashCard[] = [
  // MATH
  {
    id: 1,
    question: "What is the Pythagorean theorem?",
    answer: "a² + b² = c²",
    explanation: "The Pythagorean theorem states that in a right triangle, the square of the hypotenuse (c) equals the sum of squares of the other two sides (a and b). This fundamental relationship is used in geometry, trigonometry, and real-world applications like construction and navigation.",
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "What is the quadratic formula?",
    answer: "x = (-b ± √(b²-4ac)) / 2a",
    explanation: "The quadratic formula solves equations in the form ax² + bx + c = 0. The ± symbol means you get two solutions (roots). The discriminant (b²-4ac) tells you: if positive = 2 real solutions, if zero = 1 solution, if negative = no real solutions.",
    category: 'math',
    difficulty: 'medium'
  },
  {
    id: 3,
    question: "What is the value of π (pi) to 4 decimal places?",
    answer: "3.1416",
    explanation: "Pi (π) is the ratio of a circle's circumference to its diameter. It's an irrational number, meaning it never ends or repeats. Pi is essential for calculating circle area (πr²), circumference (2πr), and appears throughout mathematics and physics.",
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 4,
    question: "What is the slope-intercept form of a linear equation?",
    answer: "y = mx + b",
    explanation: "In y = mx + b, 'm' represents the slope (rise over run - how steep the line is), and 'b' is the y-intercept (where the line crosses the y-axis). This form makes it easy to graph lines and understand their behavior.",
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 5,
    question: "What is the formula for the area of a circle?",
    answer: "A = πr²",
    explanation: "The area of a circle equals pi times the radius squared. Remember: radius is half the diameter. This formula works because a circle can be divided into infinitely small triangles that, when rearranged, form a rectangle with area πr².",
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 6,
    question: "What is a prime number?",
    answer: "A number divisible only by 1 and itself",
    explanation: "Prime numbers are the 'building blocks' of all numbers. Examples: 2, 3, 5, 7, 11, 13... Note that 1 is NOT prime, and 2 is the only even prime. Every number can be expressed as a product of primes (prime factorization).",
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 7,
    question: "What does PEMDAS stand for?",
    answer: "Parentheses, Exponents, Multiplication, Division, Addition, Subtraction",
    explanation: "PEMDAS is the order of operations. Work from left to right: First solve Parentheses, then Exponents, then Multiplication/Division (same priority, left to right), finally Addition/Subtraction (same priority, left to right).",
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 8,
    question: "What is the derivative of x²?",
    answer: "2x",
    explanation: "Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹. So for x², n=2, giving us 2x¹ = 2x. Derivatives represent the rate of change - the slope of the tangent line at any point on the curve y = x².",
    category: 'math',
    difficulty: 'hard'
  },

  // READING
  {
    id: 9,
    question: "What is the main purpose of a thesis statement?",
    answer: "To present the main argument or central idea of an essay",
    explanation: "A thesis statement typically appears at the end of the introduction. It tells readers what to expect, provides focus for the writer, and makes a claim that the rest of the essay will support with evidence and analysis.",
    category: 'reading',
    difficulty: 'easy'
  },
  {
    id: 10,
    question: "What is the difference between theme and plot?",
    answer: "Theme is the underlying message; plot is the sequence of events",
    explanation: "Plot answers 'What happens?' (the story events). Theme answers 'What does it mean?' (the deeper message about life, society, or human nature). For example, in Romeo and Juliet: plot = star-crossed lovers die; theme = love vs. hate, fate vs. free will.",
    category: 'reading',
    difficulty: 'medium'
  },
  {
    id: 11,
    question: "What is an unreliable narrator?",
    answer: "A narrator whose credibility is compromised",
    explanation: "Unreliable narrators may lie, be mentally unstable, have limited knowledge, or be biased. Authors use them to create suspense, surprise readers, or explore subjective truth. Examples: 'Gone Girl,' 'The Catcher in the Rye,' 'Life of Pi.'",
    category: 'reading',
    difficulty: 'medium'
  },
  {
    id: 12,
    question: "What is foreshadowing?",
    answer: "Hints or clues about future events in a story",
    explanation: "Foreshadowing creates suspense and prepares readers for what's coming. It can be subtle (weather changes, symbolic objects) or direct (character predictions). Good foreshadowing feels inevitable in hindsight but isn't obvious on first read.",
    category: 'reading',
    difficulty: 'easy'
  },
  {
    id: 13,
    question: "What is the climax of a story?",
    answer: "The turning point or moment of highest tension",
    explanation: "The climax is where the main conflict reaches its peak. Everything before builds toward it (rising action), and everything after resolves from it (falling action). It's the 'point of no return' where the outcome becomes inevitable.",
    category: 'reading',
    difficulty: 'easy'
  },
  {
    id: 14,
    question: "What is dramatic irony?",
    answer: "When the audience knows something characters don't",
    explanation: "Dramatic irony creates tension and engagement. Classic example: In Romeo and Juliet, we know Juliet isn't really dead, but Romeo doesn't. This knowledge makes his actions more tragic and keeps us emotionally invested.",
    category: 'reading',
    difficulty: 'medium'
  },
  {
    id: 15,
    question: "What is the purpose of a topic sentence?",
    answer: "To introduce the main idea of a paragraph",
    explanation: "Topic sentences usually appear first in a paragraph. They connect to the thesis, preview the paragraph's content, and help readers follow the argument. Supporting sentences then provide evidence, examples, and analysis.",
    category: 'reading',
    difficulty: 'easy'
  },
  {
    id: 16,
    question: "What is an allegory?",
    answer: "A story with a hidden moral or political meaning",
    explanation: "Allegories use characters and events to represent abstract ideas. 'Animal Farm' represents the Russian Revolution; 'The Lord of the Flies' represents civilization vs. savagery. Understanding the allegory deepens comprehension of the text's message.",
    category: 'reading',
    difficulty: 'hard'
  },

  // SCIENCE
  {
    id: 17,
    question: "What is photosynthesis?",
    answer: "The process plants use to convert sunlight into food",
    explanation: "Photosynthesis equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants absorb carbon dioxide and water, use chlorophyll to capture light energy, and produce glucose (food) and oxygen. This process is essential for life on Earth.",
    category: 'science',
    difficulty: 'easy'
  },
  {
    id: 18,
    question: "What are the three states of matter?",
    answer: "Solid, liquid, and gas",
    explanation: "States differ by particle arrangement and energy: Solids have fixed shape/volume (particles vibrate in place). Liquids have fixed volume but take container shape (particles slide past each other). Gases fill any container (particles move freely). Plasma is a fourth state found in stars.",
    category: 'science',
    difficulty: 'easy'
  },
  {
    id: 19,
    question: "What is the function of mitochondria?",
    answer: "To produce energy (ATP) for the cell",
    explanation: "Mitochondria are the 'powerhouses' of cells. Through cellular respiration, they convert glucose and oxygen into ATP (adenosine triphosphate) - the energy currency cells use for all functions. They have their own DNA, suggesting ancient bacterial origins.",
    category: 'science',
    difficulty: 'easy'
  },
  {
    id: 20,
    question: "What is Newton's First Law of Motion?",
    answer: "An object at rest stays at rest; an object in motion stays in motion unless acted upon by a force",
    explanation: "Also called the Law of Inertia. Objects resist changes to their motion. A ball won't move until pushed; a rolling ball won't stop until friction or another force acts on it. This explains why seatbelts are necessary - your body wants to keep moving in a crash.",
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 21,
    question: "What is the difference between DNA and RNA?",
    answer: "DNA is double-stranded and stores genetic info; RNA is single-stranded and helps make proteins",
    explanation: "DNA (deoxyribonucleic acid) is the permanent genetic blueprint in the nucleus. RNA (ribonucleic acid) is a temporary copy that carries instructions to ribosomes for protein synthesis. DNA uses thymine; RNA uses uracil.",
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 22,
    question: "What is the pH scale?",
    answer: "A measure of acidity/alkalinity from 0-14, with 7 being neutral",
    explanation: "pH measures hydrogen ion concentration. Below 7 = acidic (lemon juice ~2, stomach acid ~1). Above 7 = basic/alkaline (soap ~10, bleach ~13). Each number represents a 10x difference in concentration. Blood is slightly basic at 7.4.",
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 23,
    question: "What is natural selection?",
    answer: "The process where organisms better adapted to their environment survive and reproduce more",
    explanation: "Darwin's key insight: Variation exists in populations. Some traits help survival/reproduction. These traits are passed to offspring. Over time, beneficial traits become more common. This drives evolution - not 'survival of the fittest' but 'survival of the fit enough.'",
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 24,
    question: "What is the speed of light?",
    answer: "Approximately 299,792 km/s (or about 186,000 miles/s)",
    explanation: "Light speed (c) is the universal speed limit - nothing with mass can reach it. It takes light 8 minutes to reach Earth from the Sun, and 4 years from the nearest star. Einstein showed that c is constant regardless of the observer's motion.",
    category: 'science',
    difficulty: 'hard'
  },

  // HISTORY
  {
    id: 25,
    question: "When did World War II end?",
    answer: "1945",
    explanation: "WWII ended in two stages: V-E Day (Victory in Europe) on May 8, 1945, when Germany surrendered. V-J Day (Victory over Japan) on August 15, 1945, after atomic bombs on Hiroshima and Nagasaki. The war lasted 6 years and killed 70-85 million people.",
    category: 'history',
    difficulty: 'easy'
  },
  {
    id: 26,
    question: "Who wrote the Declaration of Independence?",
    answer: "Thomas Jefferson (primary author)",
    explanation: "Jefferson drafted it in June 1776, with edits from Benjamin Franklin and John Adams. The document declared American independence from Britain, listed grievances against King George III, and established principles of natural rights and government by consent.",
    category: 'history',
    difficulty: 'easy'
  },
  {
    id: 27,
    question: "What was the Renaissance?",
    answer: "A cultural rebirth in Europe (14th-17th century) emphasizing art, science, and humanism",
    explanation: "Starting in Italy, the Renaissance ('rebirth') revived interest in classical Greek and Roman culture. It produced artists like Leonardo da Vinci and Michelangelo, scientists like Galileo, and new ideas about individual potential and secular knowledge.",
    category: 'history',
    difficulty: 'medium'
  },
  {
    id: 28,
    question: "What caused the French Revolution?",
    answer: "Social inequality, financial crisis, and Enlightenment ideas",
    explanation: "France's rigid class system (clergy, nobility, commoners), crushing debt from wars, food shortages, and Enlightenment ideals of liberty and equality sparked revolution in 1789. The storming of the Bastille symbolized the overthrow of the old order.",
    category: 'history',
    difficulty: 'medium'
  },
  {
    id: 29,
    question: "What was the Cold War?",
    answer: "A period of political tension between the US and USSR (1947-1991) without direct military conflict",
    explanation: "After WWII, the US (capitalism/democracy) and USSR (communism) competed for global influence through proxy wars, nuclear arms race, space race, and propaganda. It ended with the Soviet Union's collapse in 1991. Key events: Korean War, Cuban Missile Crisis, Vietnam War.",
    category: 'history',
    difficulty: 'medium'
  },
  {
    id: 30,
    question: "What was the significance of the Magna Carta?",
    answer: "It limited the power of the English king and established rule of law",
    explanation: "Signed in 1215, the Magna Carta established that even the king was subject to law. It guaranteed rights like trial by jury and protection from arbitrary imprisonment. It influenced the US Constitution and remains a symbol of liberty and constitutional government.",
    category: 'history',
    difficulty: 'medium'
  },
  {
    id: 31,
    question: "Who was the first President of the United States?",
    answer: "George Washington",
    explanation: "Washington served two terms (1789-1797). As commander of the Continental Army, he led America to independence. As president, he established precedents like the two-term limit and peaceful transfer of power. He's called the 'Father of His Country.'",
    category: 'history',
    difficulty: 'easy'
  },
  {
    id: 32,
    question: "What was the Industrial Revolution?",
    answer: "The transition from agrarian to industrial economy (18th-19th century)",
    explanation: "Starting in Britain, new machines (steam engine, spinning jenny) transformed manufacturing. Factories replaced cottage industries, cities grew rapidly, and new social classes emerged. It brought both progress (technology, wealth) and problems (pollution, child labor, inequality).",
    category: 'history',
    difficulty: 'medium'
  },

  // LANGUAGE
  {
    id: 33,
    question: "What is a metaphor?",
    answer: "A direct comparison between two unlike things without using 'like' or 'as'",
    explanation: "Metaphors create vivid imagery by stating one thing IS another: 'Life is a journey,' 'Time is money,' 'The world is a stage.' Unlike similes (which use 'like' or 'as'), metaphors make direct equations, creating stronger, more immediate comparisons.",
    category: 'language',
    difficulty: 'easy'
  },
  {
    id: 34,
    question: "What is the difference between 'affect' and 'effect'?",
    answer: "Affect is usually a verb (to influence); effect is usually a noun (a result)",
    explanation: "Memory trick: Affect = Action (verb), Effect = End result (noun). 'The rain affected my mood.' 'The effect was noticeable.' Exception: 'effect' can be a verb meaning 'to bring about' ('effect change'), and 'affect' can be a noun in psychology.",
    category: 'language',
    difficulty: 'medium'
  },
  {
    id: 35,
    question: "What is an independent clause?",
    answer: "A group of words with a subject and verb that can stand alone as a sentence",
    explanation: "Independent clauses express complete thoughts: 'I went home.' 'She studies hard.' They can be joined by coordinating conjunctions (FANBOYS: for, and, nor, but, or, yet, so) or semicolons. Dependent clauses need independent clauses to make sense.",
    category: 'language',
    difficulty: 'medium'
  },
  {
    id: 36,
    question: "What is parallel structure?",
    answer: "Using the same grammatical form for similar elements in a sentence",
    explanation: "Parallel structure creates rhythm and clarity. Wrong: 'I like swimming, to run, and biking.' Right: 'I like swimming, running, and biking.' Apply to lists, comparisons, and paired ideas. It makes writing more elegant and easier to read.",
    category: 'language',
    difficulty: 'medium'
  },
  {
    id: 37,
    question: "What is an antecedent?",
    answer: "The noun that a pronoun refers to",
    explanation: "In 'Sarah lost her keys,' 'Sarah' is the antecedent of 'her.' Pronouns must agree with antecedents in number (singular/plural) and gender. Unclear antecedents cause confusion: 'Tom told John he was late' - who was late?",
    category: 'language',
    difficulty: 'medium'
  },
  {
    id: 38,
    question: "What is the subjunctive mood?",
    answer: "A verb form expressing wishes, demands, or hypothetical situations",
    explanation: "The subjunctive often uses 'were' instead of 'was': 'If I were rich...' (not 'was'). It appears after verbs like 'suggest,' 'demand,' 'insist': 'I suggest he be present.' It expresses things contrary to fact or not yet realized.",
    category: 'language',
    difficulty: 'hard'
  },
  {
    id: 39,
    question: "What is a dangling modifier?",
    answer: "A modifier that doesn't clearly connect to what it's supposed to modify",
    explanation: "Wrong: 'Walking to school, the rain started.' (The rain wasn't walking!) Right: 'Walking to school, I got caught in the rain.' The modifier should be next to what it modifies. Dangling modifiers create confusing or unintentionally funny sentences.",
    category: 'language',
    difficulty: 'hard'
  },
  {
    id: 40,
    question: "What is alliteration?",
    answer: "The repetition of initial consonant sounds in nearby words",
    explanation: "Examples: 'Peter Piper picked a peck of pickled peppers.' 'She sells seashells by the seashore.' Alliteration creates rhythm, emphasis, and memorability. It's common in poetry, tongue twisters, brand names (Coca-Cola), and headlines.",
    category: 'language',
    difficulty: 'easy'
  }
];

export const subjectInfo = {
  math: {
    name: 'Mathematics',
    icon: 'calculator',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/50',
    description: 'Algebra, geometry, statistics, and problem-solving'
  },
  reading: {
    name: 'Reading',
    icon: 'book',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400/50',
    description: 'Comprehension, analysis, and literary devices'
  },
  science: {
    name: 'Science',
    icon: 'flask',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/50',
    description: 'Biology, chemistry, physics, and earth science'
  },
  history: {
    name: 'History',
    icon: 'landmark',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-400/50',
    description: 'World history, US history, and civics'
  },
  language: {
    name: 'Language',
    icon: 'pen',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-400/50',
    description: 'Grammar, vocabulary, and writing skills'
  }
};

export type SubjectKey = keyof typeof subjectInfo;
