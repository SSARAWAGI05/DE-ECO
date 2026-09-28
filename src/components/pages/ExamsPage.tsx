import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookOpen,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  GraduationCap,
  MessageSquare,
  Star,
  ShieldAlert,
  ThumbsUp,
  Flame,
  UserCheck,
  Search
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeColors } from "../../styles/colors";

/* ================= TYPES ================= */

export type QuestionType = "mcq" | "descriptive";

export interface MCQOption {
  id: string; // e.g. "A", "B", "C", "D"
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  type: QuestionType;
  question: string;
  marks: number;
  options?: MCQOption[]; // For MCQs
  correctAnswer?: string; // For MCQs (e.g. "B")
  explanation?: string; // For MCQs
  modelAnswer?: string; // For Descriptive
  recommendedWords?: string; // For Descriptive
}

export interface Exam {
  id: string;
  title: string;
  course: string;
  instructor: string;
  status: "live" | "upcoming" | "practice";
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  mcqCount: number;
  descriptiveCount: number;
  syllabus: string[];
  instructions: string[];
  questions: ExamQuestion[];
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  course: string;
  instructor: string;
  submittedAt: string;
  status: "graded" | "under_evaluation";
  totalMarks: number;
  scoreObtained?: number;
  percentage?: number;
  grade?: string;
  isPassed?: boolean;
  timeSpentMinutes: number;
  teacherFeedback?: {
    overall: string;
    strengths: string[];
    improvements: string[];
    evaluatedAt: string;
  };
  answers: {
    questionId: string;
    questionNumber: number;
    type: QuestionType;
    question: string;
    marks: number;
    studentAnswer: string;
    correctAnswer?: string;
    explanation?: string;
    marksAwarded?: number;
    teacherComment?: string;
    isCorrect?: boolean;
  }[];
}

/* ================= MOCK DATA ================= */

const MOCK_EXAMS: Exam[] = [
  {
    id: "exam-macro-midterm",
    title: "Macroeconomics Mid-Term Examination 2026",
    course: "Macroeconomic Theory & Policy",
    instructor: "Rishika",
    status: "live",
    scheduledDate: "Active Now",
    scheduledTime: "Window closes in 6 hours",
    durationMinutes: 45,
    totalMarks: 50,
    passingMarks: 20,
    mcqCount: 4,
    descriptiveCount: 2,
    syllabus: [
      "National Income Accounting & GDP Deflator",
      "Keynesian Autonomous Investment Multiplier",
      "Open Market Operations & Reserve Requirements",
      "Short-run vs Long-run Phillips Curve",
      "Liquidity Trap & Monetary Policy Effectiveness"
    ],
    instructions: [
      "You have 45 minutes to complete all 6 questions.",
      "Section A consists of 4 Multiple Choice Questions (5 marks each = 20 marks).",
      "Section B consists of 2 Descriptive Essay Questions (15 marks each = 30 marks).",
      "Your descriptive answers will continuously auto-save as drafts in your browser.",
      "You can navigate freely between questions using the Question Palette.",
      "The exam will automatically submit when the timer expires."
    ],
    questions: [
      {
        id: "q1",
        number: 1,
        type: "mcq",
        question: "Which of the following is NOT included in the calculation of Gross Domestic Product (GDP) using the expenditure approach?",
        marks: 5,
        options: [
          { id: "A", text: "Gross Private Domestic Investment (capital goods & inventory changes)" },
          { id: "B", text: "Government transfer payments (e.g., social security and unemployment pensions)" },
          { id: "C", text: "Government consumption expenditures and gross public investment" },
          { id: "D", text: "Net Exports of goods and services (Exports minus Imports)" }
        ],
        correctAnswer: "B",
        explanation: "Government transfer payments are excluded from GDP because they do not reflect compensation for current productive activities or new output."
      },
      {
        id: "q2",
        number: 2,
        type: "mcq",
        question: "In a closed Keynesian macroeconomic model with no government sector, if the Marginal Propensity to Consume (MPC) is 0.8, what is the value of the autonomous investment multiplier?",
        marks: 5,
        options: [
          { id: "A", text: "2.5" },
          { id: "B", text: "4.0" },
          { id: "C", text: "5.0" },
          { id: "D", text: "8.0" }
        ],
        correctAnswer: "C",
        explanation: "The autonomous multiplier formula is k = 1 / (1 - MPC). Substituting 0.8: k = 1 / (1 - 0.8) = 1 / 0.2 = 5.0."
      },
      {
        id: "q3",
        number: 3,
        type: "mcq",
        question: "When the Central Bank conducts Open Market Operations by purchasing government bonds from commercial banks, what is the primary consequence on the banking system and market interest rates?",
        marks: 5,
        options: [
          { id: "A", text: "Commercial bank reserves decrease, constraining credit and elevating bond yields" },
          { id: "B", text: "Commercial bank excess reserves rise, credit availability expands, and short-term interest rates fall" },
          { id: "C", text: "The statutory reserve requirement ratio automatically quadruples" },
          { id: "D", text: "Inflation is instantaneously pegged to zero with no shift in bank balance sheets" }
        ],
        correctAnswer: "B",
        explanation: "Purchasing government securities injects fresh liquidity directly into commercial bank reserves, lowering interbank borrowing rates and loan interest rates."
      },
      {
        id: "q4",
        number: 4,
        type: "mcq",
        question: "The traditional short-run Phillips curve illustrates an inverse empirical trade-off between which pair of macroeconomic indicators?",
        marks: 5,
        options: [
          { id: "A", text: "Fiscal deficit and the foreign currency exchange rate" },
          { id: "B", text: "The inflation rate and the unemployment rate" },
          { id: "C", text: "Nominal interest rates and capital account surplus" },
          { id: "D", text: "The current account deficit and velocity of money" }
        ],
        correctAnswer: "B",
        explanation: "A.W. Phillips showed that lower unemployment in the short-run puts upward pressure on nominal wages, generating higher price inflation."
      },
      {
        id: "q5",
        number: 5,
        type: "descriptive",
        question: "Define the Keynesian concept of a 'Liquidity Trap'. Explain the precise economic conditions under which it develops, why conventional expansionary monetary policy becomes powerless, and what alternative policy measures Keynesian economists advocate to re-ignite aggregate demand.",
        marks: 15,
        recommendedWords: "150 - 250 words",
        modelAnswer: "A liquidity trap is a situation where nominal interest rates approach the zero lower bound, causing money demand to become infinitely elastic. People expect asset prices to fall, so any increase in the money supply is hoarded rather than invested. Conventional open market operations fail. Keynesians argue that direct expansionary fiscal policy (state infrastructure spending) is required to restore aggregate demand."
      },
      {
        id: "q6",
        number: 6,
        type: "descriptive",
        question: "Critically distinguish between Cost-Push Inflation and Demand-Pull Inflation. In your response, illustrate the shifting mechanisms in the Aggregate Demand (AD) and Short-Run Aggregate Supply (SRAS) framework, and evaluate the policy dilemma central banks face when confronting stagflation.",
        marks: 15,
        recommendedWords: "150 - 250 words",
        modelAnswer: "Demand-pull inflation occurs when aggregate spending outpaces aggregate productive capacity, shifting AD to the right. Cost-push inflation is caused by supply-side shocks (e.g. oil price surges) shifting SRAS to the left, causing prices to rise while GDP falls (stagflation). The central bank dilemma: hiking interest rates cools inflation but worsens unemployment; easing policy alleviates recession but fuels hyperinflation."
      }
    ]
  },
  {
    id: "exam-micro-structures",
    title: "Microeconomics & Market Structures Unit Test",
    course: "Foundations of Microeconomics",
    instructor: "Rishika",
    status: "upcoming",
    scheduledDate: "In 2 Days (Wednesday)",
    scheduledTime: "10:00 AM - 11:00 AM IST",
    durationMinutes: 60,
    totalMarks: 60,
    passingMarks: 24,
    mcqCount: 6,
    descriptiveCount: 2,
    syllabus: [
      "Consumer Equilibrium & Indifference Curves",
      "Price Elasticity of Demand & Supply",
      "Perfect Competition vs Pure Monopoly",
      "Deadweight Loss & Welfare Economics",
      "Price Discrimination & Consumer Surplus"
    ],
    instructions: [
      "Scheduled live exam window opens precisely at 10:00 AM IST.",
      "Covers Chapters 3, 4 and 5 of Microeconomic Foundations.",
      "Ensure a reliable internet connection before commencing."
    ],
    questions: []
  },
  {
    id: "exam-intl-trade",
    title: "International Trade & Currency Forex Mock Test",
    course: "Global Economics & Currency Markets",
    instructor: "Rishika",
    status: "practice",
    scheduledDate: "On-Demand Practice",
    scheduledTime: "Available anytime",
    durationMinutes: 30,
    totalMarks: 30,
    passingMarks: 12,
    mcqCount: 4,
    descriptiveCount: 1,
    syllabus: [
      "Ricardian Comparative Advantage",
      "Tariffs, Quotas & Subsidies Analysis",
      "Floating vs Fixed Exchange Rate Systems",
      "Balance of Payments: Current vs Capital Account"
    ],
    instructions: [
      "This is an un-proctored diagnostic mock test.",
      "You may take this test as many times as you like to practice your speed.",
      "Immediate self-scoring and teacher model answers will be provided."
    ],
    questions: []
  }
];

const MOCK_RESULTS: ExamResult[] = [
  {
    id: "res-1",
    examId: "exam-micro-foundations",
    examTitle: "Foundations of Economics & Market Equilibria",
    course: "Principles of Microeconomics",
    instructor: "Rishika",
    submittedAt: "Sep 24, 2026 • 11:42 AM",
    status: "graded",
    totalMarks: 50,
    scoreObtained: 43,
    percentage: 86,
    grade: "A+ Distinction",
    isPassed: true,
    timeSpentMinutes: 38,
    teacherFeedback: {
      evaluatedAt: "Sep 25, 2026 by Instructor Rishika",
      overall: "Outstanding performance! You scored a flawless 20/20 in the Multiple Choice Section, reflecting exceptional conceptual grasp of demand/supply shifters and elasticity. In Question 5 regarding price floors, your deadweight loss diagrams and welfare explanations were stellar. Make sure to review the government budgetary burden in surplus acquisition for a perfect 50/50!",
      strengths: [
        "100% precision on elasticity formulas and calculation questions",
        "Clear, structured economic terminology throughout descriptive answers",
        "Accurate identification of deadweight loss and consumer surplus transfer"
      ],
      improvements: [
        "Remember to quantify government budgetary cost when analyzing agricultural price support systems",
        "Use bullet points for policy trade-offs to make your essay layout even crisper"
      ]
    },
    answers: [
      {
        questionId: "q1",
        questionNumber: 1,
        type: "mcq",
        question: "When price of a commodity increases from $10 to $12 and quantity demanded falls from 100 units to 70 units, the price elasticity of demand using the midpoint formula is:",
        marks: 5,
        studentAnswer: "B",
        correctAnswer: "B",
        isCorrect: true,
        marksAwarded: 5,
        explanation: "Midpoint % change in quantity = -35.29%, % change in price = +18.18%. Elasticity = -1.94 (Elastic demand)."
      },
      {
        questionId: "q2",
        questionNumber: 2,
        type: "mcq",
        question: "Which condition holds true for a profit-maximizing firm operating under Perfect Competition in the short-run?",
        marks: 5,
        studentAnswer: "C",
        correctAnswer: "C",
        isCorrect: true,
        marksAwarded: 5,
        explanation: "Firms maximize profits where Marginal Revenue (MR) equals Marginal Cost (MC), and in perfect competition MR = Price."
      },
      {
        questionId: "q3",
        questionNumber: 3,
        type: "descriptive",
        question: "Explain the economic welfare consequences of imposing a binding Price Floor on essential agricultural goods. Detail who benefits, who loses, and why deadweight loss arises.",
        marks: 20,
        marksAwarded: 18,
        studentAnswer: "A binding price floor is set above the free-market equilibrium price. When enacted on agricultural commodities, producers who successfully sell at the higher floor price receive producer surplus gains. However, consumers suffer through reduced consumer surplus as quantity demanded contracts. A market surplus (excess supply) occurs because quantity supplied exceeds quantity demanded at the legal floor price. Deadweight loss is created because mutually beneficial transactions between willing buyers and sellers are blocked.",
        teacherComment: "Brilliant explanation of the consumer and producer welfare transfer. You accurately identified deadweight loss. To achieve 20/20, note that if the government buys the surplus to sustain the price floor, taxpayers bear the budgetary purchase cost."
      }
    ]
  },
  {
    id: "res-2",
    examId: "exam-stat-quiz2",
    examTitle: "Applied Economic Statistics - Unit Quiz 2",
    course: "Quantitative Economics & Data Analysis",
    instructor: "Rishika",
    submittedAt: "Today • 2:15 PM",
    status: "under_evaluation",
    totalMarks: 40,
    timeSpentMinutes: 28,
    answers: []
  }
];

/* ================= MAIN COMPONENT ================= */

interface ExamsPageProps {
  onPageChange?: (page: string) => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ onPageChange }) => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  // Top level tabs: 'catalog' | 'results'
  const [activeTab, setActiveTab] = useState<"catalog" | "results">("catalog");

  // Active exam state (null when browsing, populated when taking test)
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Instructions modal before starting
  const [preExamModal, setPreExamModal] = useState<Exam | null>(null);

  // Selected Result for Detailed Report Card
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "practice">("all");

  // Filtered exams
  const filteredExams = MOCK_EXAMS.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ backgroundColor: themeColors.primary.lightGray }}
    >
      {/* If an exam is currently being taken, render the full-screen interactive exam portal */}
      {activeExam ? (
        <ExamTakingPortal
          exam={activeExam}
          onExit={() => setActiveExam(null)}
          onFinishExam={(result) => {
            setActiveExam(null);
            setSelectedResult(result);
            setActiveTab("results");
          }}
          themeColors={themeColors}
          isDark={isDark}
        />
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* ================= HERO HEADER ================= */}
          <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-300 dark:border-neutral-700/60">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                <GraduationCap className="w-4 h-4" /> Academic Assessment Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: themeColors.text.primary }}>
                Examinations & Evaluations
              </h1>
              <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: themeColors.text.secondary }}>
                Track upcoming assessments, complete timed conceptual tests (MCQs & Essays), and review comprehensive feedback from Instructor Rishika.
              </p>
            </div>

            {/* QUICK STATS PILL */}
            <div className="flex items-center gap-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-3 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <div className="text-center px-3 py-1">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Exams Taken</p>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">2</p>
              </div>
              <div className="w-[1px] h-8 bg-gray-200 dark:bg-neutral-800" />
              <div className="text-center px-3 py-1">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">86%</p>
              </div>
              <div className="w-[1px] h-8 bg-gray-200 dark:bg-neutral-800" />
              <div className="text-center px-3 py-1">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Pending Review</p>
                <p className="text-xl font-black text-amber-500 dark:text-amber-400">1</p>
              </div>
            </div>
          </div>

          {/* ================= SECTION TABS ================= */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-gray-200 dark:border-neutral-800 shadow-sm">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "catalog"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Upcoming & Live Exams
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  {MOCK_EXAMS.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("results")}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "results"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                }`}
              >
                <Award className="w-4 h-4" />
                Results & Teacher Feedback
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  {MOCK_RESULTS.length}
                </span>
              </button>
            </div>

            {/* SEARCH INPUT */}
            {activeTab === "catalog" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exams or courses..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= TAB 1: UPCOMING & LIVE EXAMS ================= */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { id: "all", label: "All Tests" },
                  { id: "live", label: "Live Active (1)" },
                  { id: "upcoming", label: "Scheduled (1)" },
                  { id: "practice", label: "Practice Mocks (1)" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setStatusFilter(cat.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      statusFilter === cat.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white/60 dark:bg-neutral-900/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Exam Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/90 dark:border-neutral-800 p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top status banner */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {exam.course}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {exam.title}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      {exam.status === "live" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse shrink-0">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          LIVE NOW
                        </div>
                      )}
                      {exam.status === "upcoming" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          UPCOMING
                        </div>
                      )}
                      {exam.status === "practice" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                          MOCK
                        </div>
                      )}
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-y border-gray-100 dark:border-neutral-800/80 text-xs">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40">
                        <span className="text-gray-400 block font-medium">Duration</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> {exam.durationMinutes} Mins
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40">
                        <span className="text-gray-400 block font-medium">Total Marks</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-amber-500" /> {exam.totalMarks} Marks
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40">
                        <span className="text-gray-400 block font-medium">Format</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                          {exam.mcqCount} MCQ + {exam.descriptiveCount} Essay
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40">
                        <span className="text-gray-400 block font-medium">Instructor</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                          {exam.instructor}
                        </span>
                      </div>
                    </div>

                    {/* Syllabus Tags */}
                    <div className="mt-4 mb-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Topics Covered:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {exam.syllabus.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
                          >
                            {item}
                          </span>
                        ))}
                        {exam.syllabus.length > 3 && (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-400">
                            +{exam.syllabus.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 flex items-center justify-between gap-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {exam.status === "live" ? (
                          <span className="text-rose-500 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Closes today
                          </span>
                        ) : (
                          <span>{exam.scheduledTime}</span>
                        )}
                      </div>

                      {exam.status === "live" ? (
                        <button
                          onClick={() => setPreExamModal(exam)}
                          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Take Exam Now <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : exam.status === "practice" ? (
                        <button
                          onClick={() => setPreExamModal(exam)}
                          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 font-bold text-sm flex items-center gap-2 transition-all"
                        >
                          Start Practice Test <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800/60 text-gray-400 font-bold text-sm cursor-not-allowed flex items-center gap-1.5"
                        >
                          Starts in 2 Days
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: RESULTS & TEACHER FEEDBACK ================= */}
          {activeTab === "results" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 rounded-3xl p-6 border border-amber-500/20 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Instructor Evaluation & Feedback System
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Instructor Rishika personally evaluates all descriptive questions, grades your reasoning, and leaves guidance notes to optimize your exam technique.
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Cards List */}
              <div className="grid grid-cols-1 gap-5">
                {MOCK_RESULTS.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    {/* Left: Exam Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {res.course}
                        </span>
                        <span className="text-xs text-gray-400">• Submitted {res.submittedAt}</span>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        {res.examTitle}
                      </h3>

                      {res.status === "graded" ? (
                        <div className="flex items-center gap-4 pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated & Released
                          </span>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Evaluated by <strong className="text-gray-800 dark:text-gray-200">{res.instructor}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Under Evaluation
                          </span>
                          <span className="text-xs text-gray-500">Instructor is grading descriptive essays</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Score Summary (if graded) */}
                    {res.status === "graded" && (
                      <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block font-semibold">Total Score</span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {res.scoreObtained}
                            <span className="text-sm font-normal text-gray-400">/{res.totalMarks}</span>
                          </span>
                        </div>
                        <div className="w-[1px] h-9 bg-gray-200 dark:bg-neutral-700" />
                        <div>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">{res.percentage}%</span>
                          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {res.grade}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Right: CTA button */}
                    <div className="shrink-0 w-full md:w-auto">
                      {res.status === "graded" ? (
                        <button
                          onClick={() => setSelectedResult(res)}
                          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4 text-amber-400" />
                          View Detailed Report Card & Feedback
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gray-100 dark:bg-neutral-800 text-gray-400 font-semibold text-xs cursor-not-allowed text-center"
                        >
                          Results Releasing Soon
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PRE-EXAM INSTRUCTIONS MODAL ================= */}
      {preExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Official Examination
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {preExamModal.title}
                </h2>
              </div>
              <button
                onClick={() => setPreExamModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test rules & structure */}
            <div className="space-y-3 bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 text-xs sm:text-sm">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Examination Rules & Guidelines:
              </h4>
              <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                {preExamModal.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* Timing & marks grid */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-neutral-800 border border-indigo-100 dark:border-neutral-700">
                <span className="text-gray-400 block font-medium">Duration</span>
                <span className="font-black text-base text-indigo-600 dark:text-indigo-400">{preExamModal.durationMinutes} Mins</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-neutral-800 border border-indigo-100 dark:border-neutral-700">
                <span className="text-gray-400 block font-medium">Questions</span>
                <span className="font-black text-base text-gray-800 dark:text-gray-200">{preExamModal.questions.length || 6} Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-neutral-800 border border-indigo-100 dark:border-neutral-700">
                <span className="text-gray-400 block font-medium">Total Marks</span>
                <span className="font-black text-base text-amber-500">{preExamModal.totalMarks} Marks</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreExamModal(null)}
                className="flex-1 py-3.5 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const examToStart = preExamModal;
                  setPreExamModal(null);
                  setActiveExam(examToStart);
                }}
                className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                I am Ready, Start Exam <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAILED REPORT CARD & TEACHER FEEDBACK MODAL ================= */}
      {selectedResult && (
        <DetailedReportCardModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          themeColors={themeColors}
          isDark={isDark}
        />
      )}
    </div>
  );
};

/* ========================================================================= */
/* ================= VIEW: INTERACTIVE EXAM TAKING PORTAL ================== */
/* ========================================================================= */

interface ExamTakingPortalProps {
  exam: Exam;
  onExit: () => void;
  onFinishExam: (result: ExamResult) => void;
  themeColors: any;
  isDark: boolean;
}

const ExamTakingPortal: React.FC<ExamTakingPortalProps> = ({
  exam,
  onExit,
  onFinishExam,
  themeColors,
  isDark
}) => {
  // Use questions from the exam, or fallback
  const questions = exam.questions.length > 0 ? exam.questions : MOCK_EXAMS[0].questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Draft auto-saved");

  // Timer: 45 minutes countdown in seconds
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currentQ = questions[currentIdx];

  // Answer handler
  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val
    }));
    setLastSaved(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`);
  };

  // Toggle flag
  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  // Calculate answered count
  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim() !== "").length;

  // Final submit handler
  const handleSubmitFinal = () => {
    setShowSubmitModal(false);

    // Auto-grade MCQs
    let mcqScore = 0;
    const compiledAnswers = questions.map((q) => {
      const studentAns = answers[q.id] || "";
      const isCorrect = q.type === "mcq" && studentAns.toUpperCase() === (q.correctAnswer || "").toUpperCase();
      if (isCorrect) mcqScore += q.marks;

      return {
        questionId: q.id,
        questionNumber: q.number,
        type: q.type,
        question: q.question,
        marks: q.marks,
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marksAwarded: q.type === "mcq" ? (isCorrect ? q.marks : 0) : undefined,
        teacherComment: q.type === "descriptive" ? "Pending teacher grading" : undefined,
        isCorrect
      };
    });

    const newResult: ExamResult = {
      id: "res-new-" + Date.now(),
      examId: exam.id,
      examTitle: exam.title,
      course: exam.course,
      instructor: exam.instructor,
      submittedAt: "Just now",
      status: "under_evaluation",
      totalMarks: exam.totalMarks,
      timeSpentMinutes: Math.round((exam.durationMinutes * 60 - secondsLeft) / 60) || 1,
      answers: compiledAnswers
    };

    onFinishExam(newResult);
  };

  const isLowTime = secondsLeft < 300; // < 5 mins

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#080d19] flex flex-col overflow-hidden font-sans">
      {/* ================= TOP PERSISTENT EXAM NAVBAR ================= */}
      <header className="h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {exam.title}
            </h2>
            <span className="text-xs font-semibold text-gray-400">
              {exam.course} • Section {currentQ.type === "mcq" ? "A (MCQ)" : "B (Descriptive)"}
            </span>
          </div>
        </div>

        {/* Center / Right: Live Countdown & Finish CTA */}
        <div className="flex items-center gap-4">
          {/* TIMER */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-sm sm:text-base font-bold transition-all shadow-sm ${
              isLowTime
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700"
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? "text-rose-500" : "text-indigo-500"}`} />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 sm:px-6 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT SPLIT ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: Active Question View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 flex flex-col justify-between max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase">
                  Question {currentQ.number} of {questions.length}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                  {currentQ.marks} Marks
                </span>
                {currentQ.type === "descriptive" && (
                  <span className="text-xs font-semibold text-indigo-500">
                    {currentQ.recommendedWords}
                  </span>
                )}
              </div>

              {/* Mark for review button */}
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  flagged[currentQ.id]
                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? "fill-current" : ""}`} />
                {flagged[currentQ.id] ? "Flagged for Review" : "Mark for Review"}
              </button>
            </div>

            {/* Question Stem */}
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* MCQ Options Form */}
            {currentQ.type === "mcq" && currentQ.options && (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswerChange(opt.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-sm"
                          : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/60"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className={`text-sm sm:text-base font-semibold leading-relaxed ${
                        isSelected ? "text-indigo-950 dark:text-indigo-100 font-bold" : "text-gray-800 dark:text-gray-200"
                      }`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Descriptive / Long Form Essay Form */}
            {currentQ.type === "descriptive" && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
                  <span>Your Written Response:</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {lastSaved}
                  </span>
                </div>

                <textarea
                  rows={9}
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your in-depth economic analysis and reasoning here... Define terms, outline theoretical mechanisms, and substantiate your points with equations or graphical context."
                  className="w-full p-4 sm:p-5 text-sm sm:text-base rounded-2xl border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-600 transition-colors leading-relaxed resize-y custom-scrollbar"
                />

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1 pt-1">
                  <span>
                    Word Count: <strong>{(answers[currentQ.id] || "").trim() ? (answers[currentQ.id] || "").trim().split(/\s+/).length : 0}</strong> words
                  </span>
                  <span>{currentQ.recommendedWords}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Question Action Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-4 mt-8">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                currentIdx === 0
                  ? "opacity-30 cursor-not-allowed text-gray-400"
                  : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs font-semibold text-gray-400 hidden sm:inline">
              Answered {answeredCount} of {questions.length} Questions
            </span>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Next Question <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm shadow-md transition-all"
              >
                Review & Submit <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* RIGHT: QUESTION NAVIGATOR PALETTE */}
        <aside className="w-64 lg:w-72 border-l border-gray-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 p-6 hidden md:flex flex-col justify-between shrink-0">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
              Question Palette
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-500 mb-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-neutral-700" /> Unanswered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-500 bg-white dark:bg-neutral-900" /> Current
              </span>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {questions.map((q, idx) => {
                const hasAnswer = answers[q.id] && answers[q.id].trim() !== "";
                const isFlagged = flagged[q.id];
                const isCurrent = idx === currentIdx;

                let bgClass = "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300";
                if (hasAnswer) {
                  bgClass = "bg-emerald-500 text-white font-bold";
                }
                if (isFlagged) {
                  bgClass = "bg-amber-400 text-black font-bold ring-2 ring-amber-500";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${bgClass} ${
                      isCurrent ? "ring-2 ring-offset-2 ring-indigo-600" : ""
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom palette summary */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 text-xs space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Answered:</span>
              <strong className="text-emerald-600">{answeredCount}/{questions.length}</strong>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Flagged:</span>
              <strong className="text-amber-500">{Object.values(flagged).filter(Boolean).length}</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= PRE-SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-5">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Ready to Submit Your Exam?
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Please double-check your progress before final submission. Once submitted, your answers cannot be altered.
            </p>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-emerald-700 dark:text-emerald-300 block font-semibold">Answered</span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-200">{answeredCount} Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                <span className="text-amber-700 dark:text-amber-300 block font-semibold">Unanswered</span>
                <span className="text-xl font-black text-amber-800 dark:text-amber-200">{questions.length - answeredCount} Questions</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Warning: You have {questions.length - answeredCount} unanswered questions!
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                Back to Exam
              </button>
              <button
                onClick={handleSubmitFinal}
                className="flex-1 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm shadow-md"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* ============= VIEW: DETAILED REPORT CARD & TEACHER FEEDBACK ============= */
/* ========================================================================= */

interface DetailedReportCardModalProps {
  result: ExamResult;
  onClose: () => void;
  themeColors: any;
  isDark: boolean;
}

const DetailedReportCardModal: React.FC<DetailedReportCardModalProps> = ({
  result,
  onClose,
  themeColors,
  isDark
}) => {
  const [filterType, setFilterType] = useState<"all" | "mcq" | "descriptive">("all");

  const displayedAnswers = result.answers.filter((a) => {
    if (filterType === "all") return true;
    return a.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col custom-scrollbar">
        {/* Modal Sticky Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-gray-200 dark:border-neutral-800 p-5 sm:p-6 flex items-center justify-between z-10">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Official Assessment Scorecard
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {result.examTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* ================= SCORECARD SUMMARY HERO ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col justify-between shadow-xl shadow-indigo-600/20">
              <div>
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Final Score</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black">{result.scoreObtained}</span>
                  <span className="text-xl text-indigo-200 font-medium">/{result.totalMarks}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-500/40 flex items-center justify-between text-xs font-bold">
                <span className="px-2.5 py-1 rounded-full bg-white/20">{result.percentage}% Marks</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-black flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {result.grade}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-400 block font-medium">Course</span>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-1 block truncate">
                  {result.course}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-400 block font-medium">Evaluated By</span>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-1 block flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-500" /> {result.instructor}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-400 block font-medium">Time Taken</span>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-1 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> {result.timeSpentMinutes} mins
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-400 block font-medium">MCQ Section</span>
                <span className="font-black text-sm text-emerald-600 mt-1 block">
                  100% Accuracy
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-400 block font-medium">Descriptive Section</span>
                <span className="font-black text-sm text-indigo-600 mt-1 block">
                  18 / 20 Marks
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-400 block font-medium">Assessment Status</span>
                <span className="font-black text-sm text-emerald-600 mt-1 block">
                  PASSED
                </span>
              </div>
            </div>
          </div>

          {/* ================= TEACHER HIGHLIGHTED FEEDBACK BOX ================= */}
          {result.teacherFeedback && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl p-6 sm:p-7 border border-amber-500/30 dark:border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" /> Personalized Teacher Feedback
                </h4>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                  {result.teacherFeedback.evaluatedAt}
                </span>
              </div>

              {/* Overall feedback commentary */}
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-serif italic bg-white/60 dark:bg-neutral-900/60 p-4 rounded-2xl border border-amber-200/50 dark:border-neutral-800">
                "{result.teacherFeedback.overall}"
              </p>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths Noted:
                  </span>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    {result.teacherFeedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <span className="text-xs font-black uppercase text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> High-Impact Action Items:
                  </span>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    {result.teacherFeedback.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ================= QUESTION-BY-QUESTION BREAKDOWN ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-xl text-gray-900 dark:text-white">
                Detailed Answer Breakdown
              </h4>

              {/* Filters */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-neutral-800 text-xs font-bold">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === "all" ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  All Questions
                </button>
                <button
                  onClick={() => setFilterType("mcq")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === "mcq" ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  MCQs
                </button>
                <button
                  onClick={() => setFilterType("descriptive")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === "descriptive" ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Descriptive
                </button>
              </div>
            </div>

            {displayedAnswers.map((ans) => (
              <div
                key={ans.questionId}
                className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-800/30 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                      Q{ans.questionNumber}
                    </span>
                    <span className="text-xs font-bold uppercase text-gray-400">
                      {ans.type === "mcq" ? "Multiple Choice" : "Descriptive Essay"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {ans.marksAwarded ?? 0} / {ans.marks} Marks
                    </span>
                  </div>
                </div>

                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  {ans.question}
                </p>

                {/* For MCQ */}
                {ans.type === "mcq" && (
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">Your Pick:</span>
                      <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Option {ans.studentAnswer}
                      </span>
                      {ans.isCorrect && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                    </div>

                    {ans.explanation && (
                      <p className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/40 text-gray-600 dark:text-gray-300 text-xs">
                        <strong>Explanation:</strong> {ans.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* For Descriptive */}
                {ans.type === "descriptive" && (
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-400 text-xs font-bold block mb-1">Your Written Answer:</span>
                      <p className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 text-gray-800 dark:text-gray-200 text-xs leading-relaxed border border-gray-100 dark:border-neutral-800">
                        {ans.studentAnswer}
                      </p>
                    </div>

                    {ans.teacherComment && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-gray-800 dark:text-gray-200">
                        <strong className="text-amber-600 dark:text-amber-400 block mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Teacher's Specific Remark:
                        </strong>
                        {ans.teacherComment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-sm"
            >
              Close Report Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;
