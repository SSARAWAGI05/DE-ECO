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
  Search,
  FileText,
  Sparkles,
  HelpCircle,
  Send,
  Eye,
  CheckCheck
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
    title: "International Trade & Forex Mock Diagnostic",
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

  // Top level tabs: 'catalog' | 'results'
  const [activeTab, setActiveTab] = useState<"catalog" | "results">("catalog");

  // Active exam state (null when browsing, populated when taking test)
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Instructions modal before starting
  const [preExamModal, setPreExamModal] = useState<Exam | null>(null);

  // Selected Result for Detailed Report Card Modal
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
      className="min-h-screen pt-28 sm:pt-36 pb-16 transition-colors duration-300"
      style={{ backgroundColor: themeColors.primary.lightGray }}
    >
      {/* If an exam is active, show the full-screen examination portal */}
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
        <div className="container mx-auto px-4 sm:px-6">
          {/* ================= PAGE HEADER ================= */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 shadow-xs"
              style={{ backgroundColor: themeColors.accent.yellow, color: '#1a1a1a' }}
            >
              <GraduationCap className="w-4 h-4" /> Academic Examination Portal
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
              style={{ color: themeColors.text.primary }}
            >
              Assessments & Examinations
            </h1>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: themeColors.text.secondary }}
            >
              Timed conceptual tests, rigorous essay examinations, and personalized mentor evaluations by Instructor Rishika.
            </p>
          </div>

          {/* ================= DE-ECO 4 STATS BAR (SOFT & REFINED) ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Box 1: Scheduled Tests */}
            <div
              className="rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.blue }}
            >
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary.w2 }}>
                {MOCK_EXAMS.length}
              </div>
              <div className="text-xs sm:text-sm font-medium mt-1" style={{ color: themeColors.primary.w2 }}>
                Available Assessments
              </div>
            </div>

            {/* Box 2: Live Test Window */}
            <div
              className="rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.yellow }}
            >
              <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2" style={{ color: '#1a1a1a' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                1 Live
              </div>
              <div className="text-xs sm:text-sm font-medium mt-1" style={{ color: '#1a1a1a' }}>
                Active Mid-Term Window
              </div>
            </div>

            {/* Box 3: Average Score */}
            <div
              className="rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.green }}
            >
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#1a1a1a' }}>
                86.0%
              </div>
              <div className="text-xs sm:text-sm font-medium mt-1" style={{ color: '#1a1a1a' }}>
                Average Student Score
              </div>
            </div>

            {/* Box 4: Recent Standing */}
            <div
              className="rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.red }}
            >
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.primary.w2 }}>
                Grade A+
              </div>
              <div className="text-xs sm:text-sm font-medium mt-1" style={{ color: themeColors.primary.w2 }}>
                Recent Standing
              </div>
            </div>
          </div>

          {/* ================= SIGNATURE DE-ECO PILL TABS ================= */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex rounded-full p-1.5 shadow-sm border border-black/5 dark:border-white/10"
              style={{ backgroundColor: themeColors.primary.w }}
            >
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-6 sm:px-10 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "catalog" ? "shadow-md" : "opacity-60 hover:opacity-100"
                }`}
                style={
                  activeTab === "catalog"
                    ? { backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }
                    : { color: themeColors.text.primary }
                }
              >
                <Calendar className="w-4 h-4" />
                Upcoming & Live Exams
                <span
                  className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold"
                  style={
                    activeTab === "catalog"
                      ? { backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }
                      : { backgroundColor: themeColors.accent.blue, color: themeColors.primary.w2 }
                  }
                >
                  {MOCK_EXAMS.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("results")}
                className={`px-6 sm:px-10 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "results" ? "shadow-md" : "opacity-60 hover:opacity-100"
                }`}
                style={
                  activeTab === "results"
                    ? { backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }
                    : { color: themeColors.text.primary }
                }
              >
                <Award className="w-4 h-4" />
                Results & Teacher Feedback
                <span
                  className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold"
                  style={
                    activeTab === "results"
                      ? { backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }
                      : { backgroundColor: themeColors.accent.green, color: "#1a1a1a" }
                  }
                >
                  {MOCK_RESULTS.length}
                </span>
              </button>
            </div>
          </div>

          {/* ================= TAB 1: UPCOMING & LIVE EXAMS ================= */}
          {activeTab === "catalog" && (
            <div className="space-y-8">
              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search exams or courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 font-medium text-sm outline-none transition shadow-sm focus:border-gray-400"
                    style={{
                      backgroundColor: themeColors.background.white,
                      color: themeColors.text.primary
                    }}
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                  {[
                    { id: "all", label: "All Exams" },
                    { id: "live", label: "Live Active" },
                    { id: "upcoming", label: "Scheduled" },
                    { id: "practice", label: "Diagnostic Mocks" }
                  ].map((filter) => {
                    const isSelected = statusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                          isSelected ? "shadow-md scale-105" : "opacity-75 hover:opacity-100"
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }
                            : { backgroundColor: themeColors.background.white, color: themeColors.text.primary }
                        }
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EXAM CARDS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredExams.map((exam) => {
                  const isLive = exam.status === "live";
                  const isPractice = exam.status === "practice";

                  return (
                    <div
                      key={exam.id}
                      className="rounded-2xl p-6 sm:p-7 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                      style={{ backgroundColor: themeColors.background.white }}
                    >
                      {/* Top Header Row */}
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 uppercase tracking-wide"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {exam.course}
                          </span>

                          {/* Status Badge */}
                          {isLive && (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs"
                              style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
                            >
                              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                              LIVE NOW
                            </span>
                          )}
                          {isPractice && (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs"
                              style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                            >
                              PRACTICE MOCK
                            </span>
                          )}
                          {!isLive && !isPractice && (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs"
                              style={{ backgroundColor: themeColors.accent.blue, color: "#1a1a1a" }}
                            >
                              SCHEDULED
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2
                          className="text-xl sm:text-2xl font-bold mb-2"
                          style={{ color: themeColors.text.primary }}
                        >
                          {exam.title}
                        </h2>

                        {/* Instructor Info */}
                        <div className="flex items-center gap-2 text-xs font-medium mb-5" style={{ color: themeColors.text.secondary }}>
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Course Instructor: <strong style={{ color: themeColors.text.primary }}>{exam.instructor}</strong></span>
                        </div>

                        {/* 4 Soft Spec Blocks */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                          <div className="rounded-xl p-3 bg-gray-50/80 dark:bg-neutral-800/80 text-center">
                            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Duration</div>
                            <div className="text-sm font-bold" style={{ color: themeColors.text.primary }}>
                              {exam.durationMinutes} Mins
                            </div>
                          </div>

                          <div className="rounded-xl p-3 bg-gray-50/80 dark:bg-neutral-800/80 text-center">
                            <Award className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Total Marks</div>
                            <div className="text-sm font-bold" style={{ color: themeColors.text.primary }}>
                              {exam.totalMarks} Pts
                            </div>
                          </div>

                          <div className="rounded-xl p-3 bg-gray-50/80 dark:bg-neutral-800/80 text-center">
                            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Passing Marks</div>
                            <div className="text-sm font-bold" style={{ color: themeColors.text.primary }}>
                              {exam.passingMarks} Pts
                            </div>
                          </div>

                          <div className="rounded-xl p-3 bg-gray-50/80 dark:bg-neutral-800/80 text-center">
                            <FileText className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Format</div>
                            <div className="text-xs font-bold" style={{ color: themeColors.text.primary }}>
                              {exam.mcqCount} MCQ + {exam.descriptiveCount} Essay
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-4">
                        <div className="text-xs font-medium" style={{ color: themeColors.text.secondary }}>
                          {isLive ? (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                              <Clock className="w-3.5 h-3.5" /> Closes in 6 hours
                            </span>
                          ) : (
                            <span>{exam.scheduledDate} • {exam.scheduledTime}</span>
                          )}
                        </div>

                        {/* Action CTA */}
                        {isLive ? (
                          <button
                            onClick={() => setPreExamModal(exam)}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
                          >
                            Take Exam Now <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : isPractice ? (
                          <button
                            onClick={() => setPreExamModal(exam)}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                          >
                            Start Practice <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-5 py-2 rounded-xl font-medium text-xs bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed flex items-center gap-1.5"
                          >
                            Starts in 2 Days
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredExams.length === 0 && (
                <div className="text-center py-16 rounded-2xl shadow-sm bg-white dark:bg-black p-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    No assessments match your filter
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try switching filters or search keywords to view other examinations.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: RESULTS & TEACHER FEEDBACK ================= */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {/* Highlight Banner */}
              <div
                className="rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-xs">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Official Instructor Evaluation & Report System
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      Instructor Rishika evaluates descriptive questions, provides personalized guidance, and annotates key exam techniques.
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Cards List */}
              <div className="grid grid-cols-1 gap-5">
                {MOCK_RESULTS.map((res) => {
                  const isGraded = res.status === "graded";

                  return (
                    <div
                      key={res.id}
                      className="rounded-2xl p-6 sm:p-7 shadow-md transition-all hover:scale-[1.01] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                      style={{ backgroundColor: themeColors.background.white }}
                    >
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 uppercase tracking-wide"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {res.course}
                          </span>
                          <span className="text-xs text-gray-400">
                            Submitted: {res.submittedAt}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                          {res.examTitle}
                        </h3>

                        {isGraded ? (
                          <div className="flex items-center gap-3 pt-1">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
                              style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Evaluated & Released
                            </span>
                            <span className="text-xs font-medium" style={{ color: themeColors.text.secondary }}>
                              Evaluated by <strong style={{ color: themeColors.text.primary }}>{res.instructor}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 pt-1">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
                              style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
                            >
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-700" /> Under Evaluation
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              Instructor is grading descriptive essays
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Score Summary (if graded) */}
                      {isGraded && (
                        <div
                          className="flex items-center gap-4 px-6 py-3 rounded-xl shadow-xs shrink-0"
                          style={{ backgroundColor: themeColors.accent.orangeSection || "#f9f9f9" }}
                        >
                          <div className="text-right">
                            <span className="text-xs text-gray-500 font-medium block uppercase">Score</span>
                            <span className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                              {res.scoreObtained}
                              <span className="text-sm font-normal text-gray-500">/{res.totalMarks}</span>
                            </span>
                          </div>
                          <div className="w-[1px] h-9 bg-gray-300 dark:bg-neutral-700" />
                          <div>
                            <span className="text-xs font-bold block" style={{ color: themeColors.text.primary }}>
                              {res.percentage}%
                            </span>
                            <span
                              className="text-xs font-semibold uppercase px-2 py-0.5 rounded shadow-xs inline-block"
                              style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                            >
                              {res.grade}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Right: CTA button */}
                      <div className="shrink-0 w-full md:w-auto">
                        {isGraded ? (
                          <button
                            onClick={() => setSelectedResult(res)}
                            className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
                          >
                            <Award className="w-4 h-4 text-amber-300" />
                            View Full Report & Feedback
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full md:w-auto px-5 py-3 rounded-xl font-medium text-xs bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed text-center"
                          >
                            Results Releasing Soon
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6"
            style={{ backgroundColor: themeColors.background.white }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-xs font-bold uppercase px-2.5 py-0.5 rounded shadow-xs"
                  style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
                >
                  Candidate Instructions
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-2" style={{ color: themeColors.text.primary }}>
                  {preExamModal.title}
                </h3>
                <p className="text-xs font-medium mt-1" style={{ color: themeColors.text.secondary }}>
                  {preExamModal.course} • Instructor {preExamModal.instructor}
                </p>
              </div>
              <button
                onClick={() => setPreExamModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Rules Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Duration</span>
                <span className="font-bold text-sm" style={{ color: themeColors.text.primary }}>
                  {preExamModal.durationMinutes} Minutes
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Total Marks</span>
                <span className="font-bold text-sm" style={{ color: themeColors.text.primary }}>
                  {preExamModal.totalMarks} Marks
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Questions</span>
                <span className="font-bold text-sm" style={{ color: themeColors.text.primary }}>
                  {preExamModal.mcqCount + preExamModal.descriptiveCount} Total
                </span>
              </div>
            </div>

            {/* Instructions List */}
            <div
              className="p-4 rounded-xl space-y-2 text-xs"
              style={{ backgroundColor: themeColors.accent.orangeSection || "#f9f9f9" }}
            >
              <span className="font-bold uppercase tracking-wider block" style={{ color: themeColors.text.primary }}>
                Examination Protocol & Rules:
              </span>
              <ul className="space-y-1.5 font-medium" style={{ color: themeColors.text.secondary }}>
                {preExamModal.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreExamModal(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border border-gray-200 dark:border-neutral-700 transition hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                style={{ color: themeColors.text.primary }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const examToStart = preExamModal;
                  setPreExamModal(null);
                  setActiveExam(examToStart);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
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

  // Timer countdown in seconds
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
    setLastSaved(
      `Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
    );
  };

  // Toggle flag
  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  // Calculate answered count
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] && answers[k].trim() !== ""
  ).length;

  // Final submit handler
  const handleSubmitFinal = () => {
    setShowSubmitModal(false);

    // Auto-grade MCQs
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

  // Word count calculation for descriptive essays
  const currentText = answers[currentQ.id] || "";
  const wordCount = currentText.trim() === "" ? 0 : currentText.trim().split(/\s+/).length;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden font-sans transition-colors duration-300"
      style={{ backgroundColor: themeColors.primary.lightGray }}
    >
      {/* ================= TOP PERSISTENT EXAM NAVBAR ================= */}
      <header
        className="border-b border-gray-200 dark:border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between z-20 shadow-sm"
        style={{ backgroundColor: themeColors.background.white }}
      >
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
          >
            Q{currentIdx + 1}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold leading-tight" style={{ color: themeColors.text.primary }}>
              {exam.title}
            </h1>
            <p className="text-xs text-gray-500">
              {exam.course} • Question {currentIdx + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Center: Soft Timer */}
        <div
          className="flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-xl shadow-xs font-mono font-bold text-base sm:text-lg"
          style={{
            backgroundColor: isLowTime ? themeColors.accent.red : themeColors.accent.yellow,
            color: "#1a1a1a"
          }}
        >
          <Clock className={`w-4 h-4 ${isLowTime ? "animate-bounce text-red-700" : "text-gray-800"}`} />
          <span>{formatTimer(secondsLeft)}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Progress Bar under navbar */}
      <div className="w-full bg-gray-200 dark:bg-neutral-800 h-1">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((currentIdx + 1) / questions.length) * 100}%`,
            backgroundColor: themeColors.primary.w2
          }}
        />
      </div>

      {/* ================= WORKSPACE: 2-COLUMN VIEW ================= */}
      <div className="flex-1 flex overflow-hidden p-4 sm:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* LEFT WORKSPACE: QUESTION & INPUT */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
          {/* Main Question Card */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
            style={{ backgroundColor: themeColors.background.white }}
          >
            {/* Question Header Meta */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold uppercase px-3 py-1 rounded-full shadow-xs"
                  style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
                >
                  Question {currentQ.number} of {questions.length}
                </span>

                <span
                  className="text-xs font-bold uppercase px-3 py-1 rounded-full shadow-xs"
                  style={{ backgroundColor: themeColors.accent.blue, color: "#1a1a1a" }}
                >
                  {currentQ.marks} Marks
                </span>

                <span
                  className="text-xs font-medium uppercase px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                >
                  {currentQ.type === "mcq" ? "Multiple Choice Question" : "Descriptive Essay Response"}
                </span>
              </div>

              {/* Flag for Review button */}
              <button
                onClick={toggleFlag}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  flagged[currentQ.id] ? "shadow-sm scale-105" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: flagged[currentQ.id] ? themeColors.accent.yellow : themeColors.accent.orangeSection || "#f5f5f5",
                  color: "#1a1a1a"
                }}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {flagged[currentQ.id] ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            {/* Question Statement */}
            <div className="text-lg sm:text-xl font-semibold leading-relaxed" style={{ color: themeColors.text.primary }}>
              {currentQ.question}
            </div>

            {/* ================= IF MCQ: 4 OPTION CARDS ================= */}
            {currentQ.type === "mcq" && currentQ.options && (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((option) => {
                  const isSelected = answers[currentQ.id] === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleAnswerChange(option.id)}
                      className={`rounded-xl p-4 sm:p-5 transition-all cursor-pointer flex items-center gap-4 select-none ${
                        isSelected
                          ? "shadow-sm scale-[1.01]"
                          : "border border-gray-200 dark:border-neutral-700 hover:border-gray-300 opacity-95"
                      }`}
                      style={{
                        backgroundColor: isSelected ? themeColors.accent.yellow : themeColors.background.white,
                        color: isSelected ? "#1a1a1a" : themeColors.text.primary
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg font-bold flex items-center justify-center shrink-0 text-sm shadow-xs"
                        style={{
                          backgroundColor: isSelected ? "#1a1a1a" : "rgba(0,0,0,0.06)",
                          color: isSelected ? "#ffffff" : themeColors.text.primary
                        }}
                      >
                        {option.id}
                      </div>

                      <div className="font-medium text-sm sm:text-base flex-1">
                        {option.text}
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 font-bold" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= IF DESCRIPTIVE: RICH ESSAY TEXTAREA ================= */}
            {currentQ.type === "descriptive" && (
              <div className="space-y-3 pt-2">
                {/* Guidelines Banner */}
                <div
                  className="p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  style={{ backgroundColor: themeColors.accent.orangeSection || "#fdf7ee" }}
                >
                  <span className="font-semibold text-gray-800">
                    ✍️ Suggested length: <strong>{currentQ.recommendedWords || "150 - 250 words"}</strong>
                  </span>
                  <span className="font-medium text-gray-600">
                    Define assumptions, illustrate mechanisms, and cite policy trade-offs.
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your structured economic analysis here. Use paragraphs or numbered points for conceptual clarity..."
                  className="w-full min-h-[280px] p-5 rounded-2xl border border-gray-200 dark:border-neutral-700 text-base font-sans leading-relaxed outline-none focus:border-gray-400 resize-y shadow-inner"
                  style={{
                    backgroundColor: themeColors.primary.w,
                    color: themeColors.text.primary
                  }}
                />

                {/* Live Stats Bar */}
                <div className="flex items-center justify-between text-xs font-medium pt-1 text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {lastSaved}
                  </span>
                  <span className="px-3 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 font-semibold">
                    {wordCount} Words Written
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Question Controls Bar */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs"
              style={{ backgroundColor: themeColors.primary.w, color: themeColors.text.primary }}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="text-xs text-gray-400 hidden sm:block">
              Auto-saved draft in browser memory
            </div>

            <button
              onClick={() => {
                if (currentIdx < questions.length - 1) {
                  setCurrentIdx((prev) => prev + 1);
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
            >
              {currentIdx === questions.length - 1 ? (
                <>Finish & Review <Check className="w-4 h-4" /></>
              ) : (
                <>Next Question <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR: QUESTION PALETTE GRID */}
        <div className="w-72 hidden lg:flex flex-col gap-5 shrink-0">
          <div
            className="rounded-2xl p-5 shadow-sm space-y-5"
            style={{ backgroundColor: themeColors.background.white }}
          >
            {/* Candidate Card */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 text-xs font-medium space-y-1">
              <div className="text-gray-400 uppercase tracking-wider text-[10px]">Active Candidate</div>
              <div className="text-sm font-bold truncate" style={{ color: themeColors.text.primary }}>
                test@test.com
              </div>
              <div className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Examination Session Active
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div
                className="p-2.5 rounded-xl font-medium shadow-xs"
                style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
              >
                <span className="block text-lg font-bold">{answeredCount}</span>
                Answered
              </div>
              <div
                className="p-2.5 rounded-xl font-medium shadow-xs"
                style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
              >
                <span className="block text-lg font-bold">{Object.keys(flagged).filter(k => flagged[k]).length}</span>
                Flagged
              </div>
            </div>

            {/* Question Palette Number Grid */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500">
                Question Palette:
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = answers[q.id] && answers[q.id].trim() !== "";
                  const isFlagged = flagged[q.id];

                  let bg = "rgba(0,0,0,0.05)";
                  let textColor = themeColors.text.primary;
                  let ring = "";

                  if (isAnswered) {
                    bg = themeColors.accent.green;
                    textColor = "#1a1a1a";
                  } else if (isFlagged) {
                    bg = themeColors.accent.yellow;
                    textColor = "#1a1a1a";
                  }

                  if (isCurrent) {
                    ring = "ring-2 ring-black dark:ring-white scale-105 font-bold shadow-xs";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${ring}`}
                      style={{ backgroundColor: bg, color: textColor }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Palette Legend */}
            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-2 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-md"
                  style={{ backgroundColor: themeColors.accent.green }}
                />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-md"
                  style={{ backgroundColor: themeColors.accent.yellow }}
                />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-gray-200 dark:bg-neutral-700" />
                <span>Not Attempted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRE-SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5"
            style={{ backgroundColor: themeColors.background.white }}
          >
            <h3 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
              Ready to Submit Your Exam?
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Please review your question attempts before final submission. After submitting, your answers will be sent for evaluation.
            </p>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className="p-3.5 rounded-xl font-medium shadow-xs"
                style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
              >
                <span className="block text-gray-700">Answered Questions</span>
                <span className="text-2xl font-bold">{answeredCount} of {questions.length}</span>
              </div>

              <div
                className="p-3.5 rounded-xl font-medium shadow-xs"
                style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
              >
                <span className="block text-gray-700">Unanswered</span>
                <span className="text-2xl font-bold">{questions.length - answeredCount} Remaining</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You have {questions.length - answeredCount} unanswered questions!</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border border-gray-200 dark:border-neutral-700 transition hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                style={{ color: themeColors.text.primary }}
              >
                Back to Test
              </button>
              <button
                onClick={handleSubmitFinal}
                className="flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        style={{ backgroundColor: themeColors.background.white }}
      >
        {/* Sticky Header */}
        <div
          className="sticky top-0 border-b border-gray-100 dark:border-neutral-800 p-5 sm:p-6 flex items-center justify-between z-10 shadow-xs"
          style={{ backgroundColor: themeColors.background.white }}
        >
          <div>
            <span
              className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded shadow-xs"
              style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
            >
              Academic Assessment Report Card
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: themeColors.text.primary }}>
              {result.examTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* ================= HERO SCORE BANNER ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Massive Score Block */}
            <div
              className="md:col-span-1 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
              style={{ backgroundColor: themeColors.accent.blue, color: "#1a1a1a" }}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block text-gray-700">
                  Total Score Obtained
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-black">{result.scoreObtained}</span>
                  <span className="text-2xl font-bold text-gray-700">/{result.totalMarks}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-white/90 shadow-xs">
                  {result.percentage}% Marks
                </span>
                <span
                  className="px-3 py-1 rounded-full shadow-xs flex items-center gap-1"
                  style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                >
                  <Award className="w-3.5 h-3.5" /> {result.grade}
                </span>
              </div>
            </div>

            {/* 6 Quick Metrics */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Course</span>
                <span className="font-bold text-sm block truncate" style={{ color: themeColors.text.primary }}>
                  {result.course}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Evaluated By</span>
                <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: themeColors.text.primary }}>
                  <UserCheck className="w-4 h-4 text-emerald-600" /> {result.instructor}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Time Taken</span>
                <span className="font-bold text-sm flex items-center gap-1" style={{ color: themeColors.text.primary }}>
                  <Clock className="w-4 h-4 text-indigo-500" /> {result.timeSpentMinutes} Mins
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">MCQ Section</span>
                <span className="font-bold text-sm text-emerald-600">
                  100% Accuracy
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Descriptive Essays</span>
                <span className="font-bold text-sm text-indigo-600">
                  18 / 20 Marks
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800">
                <span className="text-xs text-gray-500 font-medium block">Final Status</span>
                <span className="font-bold text-sm text-emerald-600">
                  PASSED
                </span>
              </div>
            </div>
          </div>

          {/* ================= INSTRUCTOR RISHIKA'S HIGHLIGHTED FEEDBACK BOX ================= */}
          {result.teacherFeedback && (
            <div
              className="rounded-2xl p-6 sm:p-7 shadow-sm space-y-4"
              style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-black/10">
                <h4 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                  <MessageSquare className="w-5 h-5 text-gray-900" /> Personal Feedback from Instructor Rishika
                </h4>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/90 shadow-xs">
                  {result.teacherFeedback.evaluatedAt}
                </span>
              </div>

              {/* Overall Feedback Commentary Quote */}
              <div className="p-4 rounded-xl bg-white/95 text-gray-900 font-serif italic text-sm sm:text-base leading-relaxed shadow-xs">
                "{result.teacherFeedback.overall}"
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Strengths Card */}
                <div
                  className="p-4 rounded-xl shadow-xs space-y-2"
                  style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                >
                  <span className="text-xs font-bold uppercase flex items-center gap-1.5 text-gray-900">
                    <ThumbsUp className="w-4 h-4 text-gray-900" /> Key Strengths Noted:
                  </span>
                  <ul className="text-xs text-gray-800 font-medium space-y-1.5 list-disc list-inside">
                    {result.teacherFeedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements Card */}
                <div
                  className="p-4 rounded-xl shadow-xs space-y-2"
                  style={{ backgroundColor: themeColors.accent.red, color: "#1a1a1a" }}
                >
                  <span className="text-xs font-bold uppercase flex items-center gap-1.5 text-gray-900">
                    <Flame className="w-4 h-4 text-gray-900" /> High-Impact Action Items:
                  </span>
                  <ul className="text-xs text-gray-800 font-medium space-y-1.5 list-disc list-inside">
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
              <h4 className="font-bold text-xl" style={{ color: themeColors.text.primary }}>
                Question-by-Question Breakdown
              </h4>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-neutral-800 text-xs font-semibold">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === "all" ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold" : "text-gray-500"
                  }`}
                >
                  All Questions
                </button>
                <button
                  onClick={() => setFilterType("mcq")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === "mcq" ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold" : "text-gray-500"
                  }`}
                >
                  MCQs
                </button>
                <button
                  onClick={() => setFilterType("descriptive")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === "descriptive" ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold" : "text-gray-500"
                  }`}
                >
                  Descriptive
                </button>
              </div>
            </div>

            {/* Answer List */}
            {displayedAnswers.map((ans) => (
              <div
                key={ans.questionId}
                className="p-5 sm:p-6 rounded-2xl shadow-sm space-y-4"
                style={{ backgroundColor: themeColors.background.white }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded shadow-xs"
                      style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
                    >
                      Q{ans.questionNumber}
                    </span>
                    <span className="text-xs font-medium uppercase text-gray-400">
                      {ans.type === "mcq" ? "Multiple Choice" : "Descriptive Essay"}
                    </span>
                  </div>

                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full shadow-xs"
                    style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                  >
                    {ans.marksAwarded ?? 0} / {ans.marks} Marks
                  </span>
                </div>

                <p className="font-semibold text-sm sm:text-base" style={{ color: themeColors.text.primary }}>
                  {ans.question}
                </p>

                {/* For MCQ */}
                {ans.type === "mcq" && (
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Your Response:</span>
                      <span
                        className="font-bold px-2.5 py-0.5 rounded text-xs shadow-xs"
                        style={{ backgroundColor: themeColors.accent.green, color: "#1a1a1a" }}
                      >
                        Option {ans.studentAnswer}
                      </span>
                      {ans.isCorrect && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                          <Check className="w-3.5 h-3.5" /> Correct Answer
                        </span>
                      )}
                    </div>

                    {ans.explanation && (
                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <strong>Pedagogical Explanation:</strong> {ans.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* For Descriptive */}
                {ans.type === "descriptive" && (
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-400 text-xs font-medium block mb-1">
                        Your Submitted Written Essay:
                      </span>
                      <p className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 text-xs leading-relaxed" style={{ color: themeColors.text.primary }}>
                        {ans.studentAnswer}
                      </p>
                    </div>

                    {ans.teacherComment && (
                      <div
                        className="p-4 rounded-xl text-xs shadow-xs space-y-1"
                        style={{ backgroundColor: themeColors.accent.yellow, color: "#1a1a1a" }}
                      >
                        <strong className="block font-bold uppercase text-gray-900 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-gray-900" /> Instructor Rishika's Annotation:
                        </strong>
                        <p className="font-serif italic text-gray-900 leading-relaxed">
                          "{ans.teacherComment}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
              style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
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
