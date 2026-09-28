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
  ThumbsUp,
  Target,
  UserCheck,
  Search,
  FileText,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeColors } from "../../styles/colors";

/* ========================================================================= */
/* ================================ TYPES ================================== */
/* ========================================================================= */

export type QuestionType = "mcq" | "descriptive";

export interface MCQOption {
  id: string; // "A", "B", "C", "D"
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  type: QuestionType;
  question: string;
  marks: number;
  options?: MCQOption[];
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  recommendedWords?: string;
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

/* ========================================================================= */
/* ============================== MOCK DATA ================================ */
/* ========================================================================= */

const MOCK_EXAMS: Exam[] = [
  {
    id: "exam-macro-midterm",
    title: "Macroeconomics Mid-Term Examination 2026",
    course: "Macroeconomic Theory & Policy",
    instructor: "Rishika",
    status: "live",
    scheduledDate: "Active Today",
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
      "Section A: 4 Multiple Choice Questions (5 marks each = 20 marks).",
      "Section B: 2 Descriptive Essay Questions (15 marks each = 30 marks).",
      "Your written responses are auto-saved to your local session continuously.",
      "Navigate smoothly between questions using the Question Palette.",
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
          { id: "A", text: "Gross Private Domestic Investment (capital equipment and inventory changes)" },
          { id: "B", text: "Government transfer payments (e.g., social security and unemployment benefits)" },
          { id: "C", text: "Government consumption expenditures and gross public investment" },
          { id: "D", text: "Net Exports of goods and services (Exports minus Imports)" }
        ],
        correctAnswer: "B",
        explanation: "Government transfer payments are excluded from GDP because they do not reflect compensation for current productive economic activities or new output."
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
          { id: "A", text: "Commercial bank reserves decrease, constraining credit availability and elevating loan yields" },
          { id: "B", text: "Commercial bank excess reserves rise, credit availability expands, and short-term interest rates fall" },
          { id: "C", text: "The statutory reserve requirement ratio automatically quadruples" },
          { id: "D", text: "Inflation is instantaneously pegged to zero with no shift in balance sheets" }
        ],
        correctAnswer: "B",
        explanation: "Purchasing government securities injects liquidity directly into bank reserves, lowering interbank borrowing rates and commercial loan interest rates."
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
          { id: "C", text: "Nominal interest rates and capital account balance" },
          { id: "D", text: "The current account deficit and velocity of money" }
        ],
        correctAnswer: "B",
        explanation: "The short-run Phillips curve demonstrates that lower unemployment rates put upward pressure on nominal wages, driving higher price inflation."
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
    title: "Microeconomics & Market Structures Unit Assessment",
    course: "Foundations of Microeconomics",
    instructor: "Rishika",
    status: "upcoming",
    scheduledDate: "Wednesday, Oct 1",
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
      "Live exam window opens at 10:00 AM IST.",
      "Covers Chapters 3, 4 and 5 of Microeconomic Foundations.",
      "Ensure a reliable internet connection before commencing."
    ],
    questions: []
  },
  {
    id: "exam-intl-trade",
    title: "International Trade & Forex Diagnostic Test",
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
      "Tariffs, Quotas & Subsidies Welfare Analysis",
      "Floating vs Fixed Exchange Rate Systems",
      "Balance of Payments: Current vs Capital Account"
    ],
    instructions: [
      "This is an un-proctored diagnostic mock test.",
      "You may take this test as many times as you like to practice your speed.",
      "Immediate self-scoring and teacher model answers are provided."
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
      overall: "Outstanding performance! You scored a flawless 20/20 in the Multiple Choice Section, reflecting exceptional conceptual grasp of demand/supply shifters and elasticity. In Question 3 regarding price floors, your deadweight loss reasoning and welfare transfer explanations were stellar. Make sure to review the government budgetary burden in surplus acquisition for a perfect 50/50!",
      strengths: [
        "100% precision on elasticity formulas and midpoint calculation problems",
        "Clear, structured economic terminology throughout descriptive essay sections",
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

/* ========================================================================= */
/* ========================== MAIN COMPONENT =============================== */
/* ========================================================================= */

interface ExamsPageProps {
  onPageChange?: (page: string) => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ onPageChange }) => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  // Tab switch
  const [activeTab, setActiveTab] = useState<"catalog" | "results">("catalog");

  // Active exam taking portal state
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Pre-Exam instructions modal
  const [preExamModal, setPreExamModal] = useState<Exam | null>(null);

  // Selected Result for Detailed Scorecard Modal
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "practice">("all");

  const filteredExams = MOCK_EXAMS.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      className="min-h-screen pt-24 sm:pt-28 pb-16 transition-colors duration-200"
      style={{ backgroundColor: isDark ? "#0d0d0d" : "#fbfbfb" }}
    >
      {/* If taking an exam, show the full-screen portal */}
      {activeExam ? (
        <ExamTakingPortal
          exam={activeExam}
          onExit={() => setActiveExam(null)}
          onFinishExam={(result) => {
            setActiveExam(null);
            setSelectedResult(result);
            setActiveTab("results");
          }}
          isDark={isDark}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ================= CLEAN HEADER ================= */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/60">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
              Academic Assessments
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3">
              Examinations & Evaluations
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Complete timed tests, review detailed question breakdowns, and receive personalized feedback from Instructor Rishika.
            </p>
          </div>

          {/* ================= 4 CLEAN STATS CARDS ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
            <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Available Tests
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {MOCK_EXAMS.length}
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Curriculum Assessments</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Active Window
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                1 Live
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Mid-Term In Progress</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Average Score
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                86.0%
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">Across Completed Tests</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Recent Standing
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Grade A+
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                Top Distinction
              </span>
            </div>
          </div>

          {/* ================= MINIMALIST TAB SWITCHER ================= */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-5 sm:px-7 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "catalog"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <Calendar className="w-4 h-4 text-neutral-500" />
                Upcoming & Live Exams
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold">
                  {MOCK_EXAMS.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("results")}
                className={`px-5 sm:px-7 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "results"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <Award className="w-4 h-4 text-neutral-500" />
                Results & Mentor Feedback
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                  {MOCK_RESULTS.length}
                </span>
              </button>
            </div>
          </div>

          {/* ================= TAB 1: UPCOMING & LIVE EXAMS ================= */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {[
                    { id: "all", label: "All Exams" },
                    { id: "live", label: "Live Active" },
                    { id: "upcoming", label: "Scheduled" },
                    { id: "practice", label: "Practice Tests" }
                  ].map((filter) => {
                    const isSelected = statusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                            : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exam Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredExams.map((exam) => {
                  const isLive = exam.status === "live";
                  const isPractice = exam.status === "practice";

                  return (
                    <div
                      key={exam.id}
                      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col justify-between shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150"
                    >
                      <div>
                        {/* Top Meta Line */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                            {exam.course}
                          </span>

                          {/* Status Badge */}
                          {isLive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60 dark:border-red-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Active Window
                            </span>
                          )}
                          {isPractice && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                              Practice Mock
                            </span>
                          )}
                          {!isLive && !isPractice && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                              Scheduled
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 leading-snug">
                          {exam.title}
                        </h2>

                        <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                          Evaluated by Instructor {exam.instructor}
                        </p>

                        {/* Metrics Strip */}
                        <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 mb-4 text-center">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Duration</span>
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                              {exam.durationMinutes}m
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Total Marks</span>
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                              {exam.totalMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Passing</span>
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                              {exam.passingMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Format</span>
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                              {exam.mcqCount}M + {exam.descriptiveCount}E
                            </span>
                          </div>
                        </div>

                        {/* Syllabus Chips */}
                        <div className="mb-4">
                          <div className="text-[11px] font-medium text-neutral-400 mb-1.5">
                            Tested Topics:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {exam.syllabus.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md"
                              >
                                {item}
                              </span>
                            ))}
                            {exam.syllabus.length > 3 && (
                              <span className="text-[11px] text-neutral-400 px-1 py-0.5">
                                +{exam.syllabus.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                        <div className="text-xs text-neutral-500 font-medium">
                          {isLive ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Closes in 6 hours
                            </span>
                          ) : (
                            <span>{exam.scheduledDate}</span>
                          )}
                        </div>

                        {isLive ? (
                          <button
                            onClick={() => setPreExamModal(exam)}
                            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            Take Exam <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isPractice ? (
                          <button
                            onClick={() => setPreExamModal(exam)}
                            className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                          >
                            Start Practice <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs font-medium cursor-not-allowed"
                          >
                            Opens in 2 Days
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredExams.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-8">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    No assessments match your current filter.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: RESULTS & TEACHER FEEDBACK ================= */}
          {activeTab === "results" && (
            <div className="space-y-4">
              {/* Highlight Note */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  Instructor Rishika reviews every descriptive answer to give you granular scoring, conceptual guidance, and tips for upcoming evaluations.
                </p>
              </div>

              {/* Results List */}
              <div className="space-y-3.5">
                {MOCK_RESULTS.map((res) => {
                  const isGraded = res.status === "graded";

                  return (
                    <div
                      key={res.id}
                      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-neutral-300 dark:hover:border-neutral-700"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                            {res.course}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="text-xs text-neutral-500">{res.submittedAt}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {res.examTitle}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 pt-0.5">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated by {res.instructor}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pending Teacher Evaluation
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score Badge (if graded) */}
                      {isGraded && (
                        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 block uppercase font-medium">Score</span>
                            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                              {res.scoreObtained}
                              <span className="text-xs font-normal text-neutral-400">/{res.totalMarks}</span>
                            </span>
                          </div>
                          <div className="w-[1px] h-7 bg-neutral-200 dark:bg-neutral-700" />
                          <div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                              {res.percentage}%
                            </span>
                            <span className="text-[10px] font-semibold uppercase text-neutral-500">
                              {res.grade}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="shrink-0 w-full sm:w-auto">
                        {isGraded ? (
                          <button
                            onClick={() => setSelectedResult(res)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" /> View Feedback & Scorecard
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs font-medium cursor-not-allowed"
                          >
                            Evaluation in Progress
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PRE-EXAM INSTRUCTIONS MODAL ================= */}
      {preExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200/80 dark:border-neutral-800 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                  Exam Guidelines
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {preExamModal.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {preExamModal.course} • Instructor {preExamModal.instructor}
                </p>
              </div>
              <button
                onClick={() => setPreExamModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-center">
              <div>
                <span className="text-[10px] text-neutral-400 block">Duration</span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {preExamModal.durationMinutes} Minutes
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">Total Marks</span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {preExamModal.totalMarks} Marks
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">Questions</span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {preExamModal.mcqCount + preExamModal.descriptiveCount} Total
                </span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                Instructions before you begin:
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                {preExamModal.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setPreExamModal(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const examToStart = preExamModal;
                  setPreExamModal(null);
                  setActiveExam(examToStart);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                I'm Ready, Start Test <ArrowRight className="w-3.5 h-3.5" />
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
  isDark: boolean;
}

const ExamTakingPortal: React.FC<ExamTakingPortalProps> = ({
  exam,
  onExit,
  onFinishExam,
  isDark
}) => {
  const questions = exam.questions.length > 0 ? exam.questions : MOCK_EXAMS[0].questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Draft saved");

  // Timer
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

  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val
    }));
    setLastSaved(
      `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    );
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] && answers[k].trim() !== ""
  ).length;

  const handleSubmitFinal = () => {
    setShowSubmitModal(false);

    let mcqScore = 0;
    const compiledAnswers = questions.map((q) => {
      const studentAns = answers[q.id] || "";
      const isCorrect =
        q.type === "mcq" && studentAns.toUpperCase() === (q.correctAnswer || "").toUpperCase();
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
        teacherComment: q.type === "descriptive" ? "Pending instructor grading" : undefined,
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
  const currentText = answers[currentQ.id] || "";
  const wordCount = currentText.trim() === "" ? 0 : currentText.trim().split(/\s+/).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans">
      {/* ================= TOP CLEAN EXAM BAR ================= */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to leave the exam? Your current progress will be preserved.")) {
                onExit();
              }
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition font-medium flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
          <div>
            <h1 className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
              {exam.title}
            </h1>
            <p className="text-[11px] text-neutral-400">
              Question {currentIdx + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Center Timer */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
            isLowTime
              ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isLowTime ? "animate-pulse text-red-500" : "text-neutral-400"}`} />
          <span>{formatTimer(secondsLeft)}</span>
        </div>

        {/* Right Submit CTA */}
        <div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-medium transition cursor-pointer"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Thin Progress line */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1">
        <div
          className="h-full bg-neutral-900 dark:bg-white transition-all duration-200"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* ================= WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full p-4 sm:p-6 gap-6">
        {/* Main Workstation */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Meta */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-500">
                  Question {currentQ.number} of {questions.length}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="font-medium text-neutral-500">
                  {currentQ.marks} Marks
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-neutral-400 capitalize">
                  {currentQ.type === "mcq" ? "Multiple Choice" : "Descriptive Essay"}
                </span>
              </div>

              <button
                onClick={toggleFlag}
                className={`text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  flagged[currentQ.id]
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {flagged[currentQ.id] ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
              {currentQ.question}
            </div>

            {/* MCQ Options */}
            {currentQ.type === "mcq" && currentQ.options && (
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleAnswerChange(opt.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/80 shadow-xs"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border text-xs font-semibold flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent"
                            : "border-neutral-300 dark:border-neutral-700 text-neutral-500"
                        }`}
                      >
                        {opt.id}
                      </div>

                      <div className="text-xs sm:text-sm font-normal text-neutral-800 dark:text-neutral-200 flex-1 leading-normal">
                        {opt.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Descriptive Answer Box */}
            {currentQ.type === "descriptive" && (
              <div className="space-y-3 pt-2">
                <div className="text-xs text-neutral-500 flex items-center justify-between">
                  <span>Suggested length: <strong>{currentQ.recommendedWords || "150 - 250 words"}</strong></span>
                  <span className="text-neutral-400">Structure with economic definitions and policy implications</span>
                </div>

                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your essay response here. Define key concepts, illustrate behavior shifts, and evaluate policy mechanisms..."
                  className="w-full min-h-[260px] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 resize-y bg-neutral-50/50 dark:bg-neutral-800/20"
                />

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <span>{lastSaved}</span>
                  <span>{wordCount} words</span>
                </div>
              </div>
            )}
          </div>

          {/* Question Nav Bar */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <button
              onClick={() => {
                if (currentIdx < questions.length - 1) {
                  setCurrentIdx((p) => p + 1);
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              {currentIdx === questions.length - 1 ? (
                <>Finish & Review <Check className="w-3.5 h-3.5" /></>
              ) : (
                <>Next Question <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right Palette */}
        <div className="w-64 hidden lg:flex flex-col gap-4 shrink-0">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Candidate
              </span>
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                test@test.com
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2.5">
                Questions
              </span>

              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = answers[q.id] && answers[q.id].trim() !== "";
                  const isFlagged = flagged[q.id];

                  let style = "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700";

                  if (isAnswered) {
                    style = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
                  } else if (isFlagged) {
                    style = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
                  }

                  if (isCurrent) {
                    style += " ring-2 ring-neutral-900 dark:ring-white font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg border text-xs font-medium flex items-center justify-center transition cursor-pointer ${style}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Marked for review ({Object.keys(flagged).filter(k => flagged[k]).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Submit Assessment?
            </h3>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Once submitted, your answers will be finalized and sent for instructor review.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-400 block">Answered</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {answeredCount} of {questions.length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">Remaining</span>
                <span className="text-base font-bold text-neutral-700 dark:text-neutral-300">
                  {questions.length - answeredCount}
                </span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                You have {questions.length - answeredCount} unanswered questions!
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Back to Test
              </button>
              <button
                onClick={handleSubmitFinal}
                className="flex-1 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 transition shadow-xs cursor-pointer"
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
  isDark: boolean;
}

const DetailedReportCardModal: React.FC<DetailedReportCardModalProps> = ({
  result,
  onClose,
  isDark
}) => {
  const [filterType, setFilterType] = useState<"all" | "mcq" | "descriptive">("all");

  const displayedAnswers = result.answers.filter((a) => {
    if (filterType === "all") return true;
    return a.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs border-b border-neutral-200/80 dark:border-neutral-800 p-5 flex items-center justify-between z-10">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              Official Assessment Scorecard
            </span>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {result.examTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* ================= HERO SCORE BANNER ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Main Score Box */}
            <div className="p-5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
                  Total Score
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold">{result.scoreObtained}</span>
                  <span className="text-sm font-normal text-neutral-400">/{result.totalMarks}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800 dark:border-neutral-200 flex items-center justify-between text-xs font-medium">
                <span>{result.percentage}% Marks</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 dark:text-emerald-700 font-semibold text-[11px]">
                  {result.grade}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-medium">Course</span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate block mt-0.5">
                  {result.course}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-medium">Evaluated By</span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> {result.instructor}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-medium">Time Taken</span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5 block">
                  {result.timeSpentMinutes} Minutes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-medium">Result Status</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  Passed (Top Standing)
                </span>
              </div>
            </div>
          </div>

          {/* ================= INSTRUCTOR RISHIKA'S FEEDBACK ================= */}
          {result.teacherFeedback && (
            <div className="rounded-2xl p-5 sm:p-6 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Personal Feedback from Instructor Rishika
                </h4>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  {result.teacherFeedback.evaluatedAt}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed italic bg-white/70 dark:bg-neutral-900/60 p-3.5 rounded-xl border border-amber-200/40 dark:border-neutral-800">
                "{result.teacherFeedback.overall}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Strengths */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wide">
                    <ThumbsUp className="w-3 h-3" /> Key Strengths:
                  </span>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1 list-disc list-inside">
                    {result.teacherFeedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 uppercase tracking-wide">
                    <Target className="w-3 h-3" /> Action Items:
                  </span>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1 list-disc list-inside">
                    {result.teacherFeedback.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ================= QUESTION BREAKDOWN ================= */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Question Breakdown
              </h4>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === "all"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  All ({result.answers.length})
                </button>
                <button
                  onClick={() => setFilterType("mcq")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === "mcq"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  MCQs
                </button>
                <button
                  onClick={() => setFilterType("descriptive")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === "descriptive"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Descriptive
                </button>
              </div>
            </div>

            {displayedAnswers.map((ans) => (
              <div
                key={ans.questionId}
                className="p-4 sm:p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      Q{ans.questionNumber}
                    </span>
                    <span className="text-xs text-neutral-400 capitalize">
                      {ans.type === "mcq" ? "Multiple Choice" : "Descriptive Essay"}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800">
                    {ans.marksAwarded ?? 0} / {ans.marks} Marks
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-normal">
                  {ans.question}
                </p>

                {/* MCQ specific */}
                {ans.type === "mcq" && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">Your Answer:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Option {ans.studentAnswer}
                      </span>
                      {ans.isCorrect && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                    </div>

                    {ans.explanation && (
                      <p className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                        <strong className="text-neutral-700 dark:text-neutral-300">Explanation:</strong> {ans.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Descriptive specific */}
                {ans.type === "descriptive" && (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-400 font-medium block mb-1">
                        Your Written Answer:
                      </span>
                      <p className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed">
                        {ans.studentAnswer}
                      </p>
                    </div>

                    {ans.teacherComment && (
                      <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-xs space-y-1">
                        <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          Instructor Rishika's Annotation:
                        </span>
                        <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                          "{ans.teacherComment}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-medium transition cursor-pointer"
            >
              Close Scorecard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;
