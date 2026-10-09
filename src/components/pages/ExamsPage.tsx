import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Award,
  Download,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Bookmark,
  BookOpen,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  Star,
  ThumbsUp,
  Flame,
  UserCheck,
  Search,
  FileText,
  Pause,
  Play,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Table as TableIcon,
  Highlighter,
  Undo,
  Redo,
  Subscript,
  Superscript,
  Maximize2,
  Minimize2,
  Minus,
  Sparkles,
  Sun,
  Moon
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
}

export interface Exam {
  id: string;
  title: string;
  course: string;
  courseId?: string;
  assignedType?: 'course' | 'student';
  assignedStudentEmail?: string;
  assignedStudentName?: string;
  instructor: string;
  status: "live" | "upcoming" | "expired";
  scheduledDate: string;
  scheduledTime: string;
  expiredAt?: string;
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
  studentName?: string;
  studentEmail?: string;
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

export interface ExamSessionState {
  examId: string;
  secondsLeft: number;
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  currentIdx: number;
  lastSavedAt: string;
}

/* ========================================================================= */
/* ============================ UUID HELPERS =============================== */
/* ========================================================================= */

export const isValidUUID = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/* ========================================================================= */
/* ============================== MOCK DATA ================================ */
/* ========================================================================= */

const MOCK_EXAMS: Exam[] = [];

const MOCK_RESULTS: ExamResult[] = [];

/* ========================================================================= */
/* =========== DE-ECO OFFICIAL REPORT CARD & TRANSCRIPT DOWNLOADER ========= */
/* ========================================================================= */

const escapeHtml = (str: string = ''): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const stripHtmlTags = (html: string = ''): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

export const downloadReportCard = (
  data: any,
  options?: { studentName?: string; studentEmail?: string }
) => {
  const candidateName = options?.studentName || data.studentName || 'Student';
  const candidateEmail = options?.studentEmail || data.studentEmail || 'Registered Student';
  const examTitle = data.examTitle || 'Academic Examination';
  const rawCourse = (data.course || '').trim();
  let courseTitle = rawCourse || 'Economics & Finance Curriculum';
  let courseMetaLabel = 'Associated Course';
  if (/^1-on-1/i.test(rawCourse) || rawCourse.toLowerCase().includes('1-on-1')) {
    const match = rawCourse.match(/^1-on-1\s*[:\-–]?\s*(.*)$/i);
    const namePart = (match && match[1] ? match[1].trim() : '') || candidateName;
    courseTitle = namePart ? `Assessment #1: ${namePart}` : 'Assessment #1';
    courseMetaLabel = 'Academic Assessment';
  } else if (rawCourse.startsWith('Assessment #')) {
    courseMetaLabel = 'Academic Assessment';
  }
  const instructor = data.instructor || 'Instructor Rishika';
  const totalMarks = Number(data.totalMarks) || 100;
  const scoreObtained = data.scoreObtained !== undefined ? Number(data.scoreObtained) : 0;
  const percentage = data.percentage !== undefined ? Number(data.percentage) : Math.round((scoreObtained / (totalMarks || 1)) * 100);
  const grade = data.grade || 'Completed';
  const isPassed = data.isPassed !== undefined ? Boolean(data.isPassed) : percentage >= 40;
  const timeSpent = Number(data.timeSpentMinutes) || 0;
  const submittedAt = data.submittedAt || new Date().toLocaleDateString('en-US');
  const feedback = data.teacherFeedback;
  const transcriptCode = 'DEECO-' + (data.id ? String(data.id).slice(0, 8).toUpperCase() : 'TRANSCRIPT');

  const answersList: any[] = Array.isArray(data.answers) ? data.answers : [];
  const mcqQuestions = answersList.filter((a) => a.type === 'mcq');
  const descriptiveQuestions = answersList.filter((a) => a.type === 'descriptive');

  const mcqTotal = mcqQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
  const mcqAwarded = mcqQuestions.reduce(
    (acc, q) => acc + (q.marksAwarded !== undefined ? Number(q.marksAwarded) : (q.isCorrect ? Number(q.marks) : 0)),
    0
  );

  const descTotal = descriptiveQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
  const descAwarded = descriptiveQuestions.reduce((acc, q) => acc + (q.marksAwarded !== undefined ? Number(q.marksAwarded) : 0), 0);

  const issueDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>DE-ECO Official Report Card - ' + escapeHtml(examTitle) + '</title>' +
'  <style>' +
'    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap");' +
'    @page {' +
'      size: A4;' +
'      margin: 10mm 12mm;' +
'    }' +
'    * {' +
'      box-sizing: border-box;' +
'      margin: 0;' +
'      padding: 0;' +
'      -webkit-print-color-adjust: exact !important;' +
'      print-color-adjust: exact !important;' +
'    }' +
'    body {' +
'      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
'      background-color: #f8fafc;' +
'      color: #0f172a;' +
'      line-height: 1.45;' +
'      padding: 20px;' +
'    }' +
'    .report-card-wrapper {' +
'      max-width: 860px;' +
'      margin: 0 auto;' +
'      background: #ffffff;' +
'      border: 1px solid #e2e8f0;' +
'      border-radius: 16px;' +
'      box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08);' +
'      overflow: hidden;' +
'      position: relative;' +
'    }' +
'    .action-bar {' +
'      position: sticky;' +
'      top: 0;' +
'      z-index: 100;' +
'      display: flex;' +
'      justify-content: space-between;' +
'      align-items: center;' +
'      background: #0f172a;' +
'      color: #ffffff;' +
'      padding: 12px 24px;' +
'      border-radius: 12px;' +
'      margin-bottom: 20px;' +
'      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);' +
'    }' +
'    .action-bar h3 {' +
'      font-size: 14px;' +
'      font-weight: 700;' +
'      display: flex;' +
'      align-items: center;' +
'      gap: 8px;' +
'    }' +
'    .action-btns {' +
'      display: flex;' +
'      gap: 10px;' +
'    }' +
'    .btn {' +
'      cursor: pointer;' +
'      border: none;' +
'      border-radius: 8px;' +
'      padding: 8px 16px;' +
'      font-size: 13px;' +
'      font-weight: 700;' +
'      display: inline-flex;' +
'      align-items: center;' +
'      gap: 6px;' +
'      text-decoration: none;' +
'    }' +
'    .btn-primary {' +
'      background: #10b981;' +
'      color: #ffffff;' +
'    }' +
'    .btn-primary:hover {' +
'      background: #059669;' +
'    }' +
'    .btn-secondary {' +
'      background: #334155;' +
'      color: #ffffff;' +
'    }' +
'    .btn-secondary:hover {' +
'      background: #475569;' +
'    }' +
'    @media print {' +
'      body {' +
'        background: #ffffff;' +
'        padding: 0;' +
'      }' +
'      .action-bar {' +
'        display: none !important;' +
'      }' +
'      .report-card-wrapper {' +
'        border: none;' +
'        box-shadow: none;' +
'        max-width: 100%;' +
'        border-radius: 0;' +
'      }' +
'      .keep-together {' +
'        break-inside: avoid;' +
'        page-break-inside: avoid;' +
'      }' +
'    }' +
'    .header-banner {' +
'      background: linear-gradient(135deg, #0b1329 0%, #172554 100%);' +
'      color: #ffffff;' +
'      padding: 28px 36px;' +
'      border-bottom: 4px solid #10b981;' +
'    }' +
'    .header-top {' +
'      display: flex;' +
'      justify-content: space-between;' +
'      align-items: center;' +
'      margin-bottom: 18px;' +
'    }' +
'    .brand-group {' +
'      display: flex;' +
'      align-items: center;' +
'      gap: 14px;' +
'    }' +
'    .brand-logo-img {' +
'      height: 44px;' +
'      width: auto;' +
'      object-fit: contain;' +
'      background: #ffffff;' +
'      padding: 4px 8px;' +
'      border-radius: 8px;' +
'    }' +
'    .brand-text-name {' +
'      font-size: 24px;' +
'      font-weight: 900;' +
'      letter-spacing: -0.5px;' +
'      color: #ffffff;' +
'      line-height: 1.1;' +
'    }' +
'    .brand-text-sub {' +
'      font-size: 10px;' +
'      font-weight: 700;' +
'      letter-spacing: 1.5px;' +
'      text-transform: uppercase;' +
'      color: #94a3b8;' +
'    }' +
'    .header-doc-meta {' +
'      text-align: right;' +
'    }' +
'    .doc-badge {' +
'      display: inline-block;' +
'      background: rgba(16, 185, 129, 0.2);' +
'      color: #34d399;' +
'      border: 1px solid rgba(52, 211, 153, 0.4);' +
'      font-size: 10px;' +
'      font-weight: 800;' +
'      letter-spacing: 1px;' +
'      text-transform: uppercase;' +
'      padding: 4px 10px;' +
'      border-radius: 20px;' +
'      margin-bottom: 4px;' +
'    }' +
'    .doc-code {' +
'      font-size: 12px;' +
'      font-weight: 600;' +
'      color: #cbd5e1;' +
'    }' +
'    .header-title-box h1 {' +
'      font-size: 22px;' +
'      font-weight: 900;' +
'      color: #ffffff;' +
'      margin-bottom: 4px;' +
'      letter-spacing: -0.3px;' +
'    }' +
'    .header-title-box p {' +
'      font-size: 13px;' +
'      color: #cbd5e1;' +
'      font-weight: 500;' +
'    }' +
'    .card-content {' +
'      padding: 28px 36px;' +
'    }' +
'    .meta-grid {' +
'      display: grid;' +
'      grid-template-columns: repeat(2, 1fr);' +
'      gap: 12px;' +
'      background: #f8fafc;' +
'      border: 1px solid #e2e8f0;' +
'      border-radius: 12px;' +
'      padding: 16px 20px;' +
'      margin-bottom: 24px;' +
'    }' +
'    .meta-item {' +
'      display: flex;' +
'      flex-direction: column;' +
'    }' +
'    .meta-label {' +
'      font-size: 10px;' +
'      font-weight: 700;' +
'      text-transform: uppercase;' +
'      letter-spacing: 0.8px;' +
'      color: #64748b;' +
'      margin-bottom: 2px;' +
'    }' +
'    .meta-val {' +
'      font-size: 13px;' +
'      font-weight: 700;' +
'      color: #0f172a;' +
'    }' +
'    .score-summary-grid {' +
'      display: grid;' +
'      grid-template-columns: repeat(4, 1fr);' +
'      gap: 12px;' +
'      margin-bottom: 24px;' +
'    }' +
'    .score-box {' +
'      border: 1px solid #e2e8f0;' +
'      background: #ffffff;' +
'      border-radius: 12px;' +
'      padding: 14px;' +
'      text-align: center;' +
'    }' +
'    .score-box-primary {' +
'      background: #f0fdf4;' +
'      border-color: #bbf7d0;' +
'    }' +
'    .score-box-accent {' +
'      background: #eff6ff;' +
'      border-color: #bfdbfe;' +
'    }' +
'    .score-box-label {' +
'      font-size: 10px;' +
'      font-weight: 800;' +
'      text-transform: uppercase;' +
'      letter-spacing: 0.6px;' +
'      color: #64748b;' +
'      margin-bottom: 4px;' +
'    }' +
'    .score-box-val {' +
'      font-size: 26px;' +
'      font-weight: 900;' +
'      color: #0f172a;' +
'      line-height: 1.1;' +
'    }' +
'    .score-box-sub {' +
'      font-size: 11px;' +
'      font-weight: 600;' +
'      color: #64748b;' +
'      margin-top: 2px;' +
'    }' +
'    .status-badge-pass {' +
'      display: inline-block;' +
'      background: #059669;' +
'      color: #ffffff;' +
'      font-size: 11px;' +
'      font-weight: 800;' +
'      letter-spacing: 0.5px;' +
'      padding: 3px 10px;' +
'      border-radius: 6px;' +
'    }' +
'    .status-badge-fail {' +
'      display: inline-block;' +
'      background: #dc2626;' +
'      color: #ffffff;' +
'      font-size: 11px;' +
'      font-weight: 800;' +
'      letter-spacing: 0.5px;' +
'      padding: 3px 10px;' +
'      border-radius: 6px;' +
'    }' +
'    .breakdown-table {' +
'      width: 100%;' +
'      border-collapse: collapse;' +
'      margin-bottom: 24px;' +
'      border-radius: 8px;' +
'      overflow: hidden;' +
'      border: 1px solid #e2e8f0;' +
'    }' +
'    .breakdown-table th {' +
'      background: #f1f5f9;' +
'      font-size: 11px;' +
'      font-weight: 800;' +
'      text-transform: uppercase;' +
'      letter-spacing: 0.6px;' +
'      color: #475569;' +
'      padding: 10px 14px;' +
'      text-align: left;' +
'      border-bottom: 1px solid #e2e8f0;' +
'    }' +
'    .breakdown-table td {' +
'      font-size: 12px;' +
'      padding: 10px 14px;' +
'      border-bottom: 1px solid #f1f5f9;' +
'      color: #1e293b;' +
'    }' +
'    .breakdown-table tr:last-child td {' +
'      border-bottom: none;' +
'      font-weight: 700;' +
'      background: #f8fafc;' +
'    }' +
'    .section-title {' +
'      font-size: 13px;' +
'      font-weight: 800;' +
'      text-transform: uppercase;' +
'      letter-spacing: 0.5px;' +
'      color: #0f172a;' +
'      margin-bottom: 12px;' +
'      padding-bottom: 6px;' +
'      border-bottom: 2px solid #e2e8f0;' +
'    }' +
'    .feedback-box {' +
'      background: #fffbeb;' +
'      border: 1px solid #fde68a;' +
'      border-left: 4px solid #f59e0b;' +
'      border-radius: 10px;' +
'      padding: 16px 20px;' +
'      margin-bottom: 24px;' +
'    }' +
'    .feedback-header {' +
'      display: flex;' +
'      justify-content: space-between;' +
'      align-items: center;' +
'      margin-bottom: 6px;' +
'    }' +
'    .feedback-header h4 {' +
'      font-size: 13px;' +
'      font-weight: 800;' +
'      color: #92400e;' +
'    }' +
'    .feedback-eval-meta {' +
'      font-size: 11px;' +
'      font-weight: 600;' +
'      color: #b45309;' +
'    }' +
'    .feedback-body {' +
'      font-size: 12.5px;' +
'      color: #78350f;' +
'      line-height: 1.5;' +
'      font-style: italic;' +
'      margin-bottom: 10px;' +
'    }' +
'    .feedback-pillars {' +
'      display: grid;' +
'      grid-template-columns: 1fr 1fr;' +
'      gap: 12px;' +
'      padding-top: 10px;' +
'      border-top: 1px dashed rgba(245, 158, 11, 0.4);' +
'    }' +
'    .pillar-col h5 {' +
'      font-size: 11px;' +
'      font-weight: 800;' +
'      text-transform: uppercase;' +
'      letter-spacing: 0.5px;' +
'      margin-bottom: 4px;' +
'    }' +
'    .pillar-col.strengths h5 { color: #047857; }' +
'    .pillar-col.improvements h5 { color: #b45309; }' +
'    .pillar-col ul { list-style-type: none; padding-left: 0; }' +
'    .pillar-col li {' +
'      font-size: 11.5px;' +
'      line-height: 1.4;' +
'      margin-bottom: 3px;' +
'      padding-left: 14px;' +
'      position: relative;' +
'    }' +
'    .pillar-col.strengths li::before {' +
'      content: "✓";' +
'      position: absolute;' +
'      left: 0;' +
'      color: #059669;' +
'      font-weight: 900;' +
'    }' +
'    .pillar-col.improvements li::before {' +
'      content: "•";' +
'      position: absolute;' +
'      left: 0;' +
'      color: #d97706;' +
'      font-weight: 900;' +
'    }' +
'    .question-list {' +
'      display: flex;' +
'      flex-direction: column;' +
'      gap: 10px;' +
'      margin-bottom: 24px;' +
'    }' +
'    .q-card {' +
'      border: 1px solid #e2e8f0;' +
'      border-radius: 10px;' +
'      padding: 12px 14px;' +
'      background: #ffffff;' +
'      break-inside: avoid;' +
'    }' +
'    .q-card-head {' +
'      display: flex;' +
'      justify-content: space-between;' +
'      align-items: center;' +
'      margin-bottom: 4px;' +
'    }' +
'    .q-badge-row {' +
'      display: flex;' +
'      align-items: center;' +
'      gap: 8px;' +
'    }' +
'    .q-num {' +
'      font-size: 11px;' +
'      font-weight: 800;' +
'      background: #0f172a;' +
'      color: #ffffff;' +
'      padding: 2px 7px;' +
'      border-radius: 4px;' +
'    }' +
'    .q-type {' +
'      font-size: 10px;' +
'      font-weight: 700;' +
'      text-transform: uppercase;' +
'      color: #64748b;' +
'    }' +
'    .q-marks {' +
'      font-size: 12px;' +
'      font-weight: 800;' +
'      color: #0f172a;' +
'    }' +
'    .q-text {' +
'      font-size: 12px;' +
'      font-weight: 600;' +
'      color: #1e293b;' +
'      margin-bottom: 6px;' +
'    }' +
'    .q-answer-box {' +
'      background: #f8fafc;' +
'      border-left: 3px solid #cbd5e1;' +
'      padding: 6px 10px;' +
'      font-size: 11.5px;' +
'      color: #334155;' +
'      margin-bottom: 4px;' +
'      border-radius: 0 6px 6px 0;' +
'    }' +
'    .q-teacher-remark {' +
'      background: #fefce8;' +
'      border-left: 3px solid #facc15;' +
'      padding: 6px 10px;' +
'      font-size: 11.5px;' +
'      color: #854d0e;' +
'      border-radius: 0 6px 6px 0;' +
'      font-style: italic;' +
'    }' +
'    .auth-footer {' +
'      border-top: 2px solid #e2e8f0;' +
'      padding-top: 20px;' +
'      margin-top: 16px;' +
'      display: flex;' +
'      justify-content: space-between;' +
'      align-items: flex-end;' +
'      break-inside: avoid;' +
'    }' +
'    .auth-seal-block {' +
'      display: flex;' +
'      align-items: center;' +
'      gap: 12px;' +
'    }' +
'    .seal-badge {' +
'      width: 58px;' +
'      height: 58px;' +
'      border: 3px double #0f172a;' +
'      border-radius: 50%;' +
'      display: flex;' +
'      flex-direction: column;' +
'      align-items: center;' +
'      justify-content: center;' +
'      text-align: center;' +
'      background: #f8fafc;' +
'    }' +
'    .seal-text-top { font-size: 6px; font-weight: 900; letter-spacing: 0.5px; color: #0f172a; }' +
'    .seal-icon { font-size: 13px; line-height: 1; color: #059669; margin: 1px 0; }' +
'    .seal-text-bot { font-size: 5.5px; font-weight: 800; color: #64748b; }' +
'    .auth-meta-text {' +
'      font-size: 10.5px;' +
'      color: #64748b;' +
'      line-height: 1.4;' +
'    }' +
'    .sig-block { text-align: right; }' +
'    .sig-name {' +
'      font-family: "Playfair Display", Georgia, serif;' +
'      font-size: 19px;' +
'      font-style: italic;' +
'      color: #0f172a;' +
'      font-weight: 700;' +
'      margin-bottom: 2px;' +
'    }' +
'    .sig-line {' +
'      width: 150px;' +
'      height: 1px;' +
'      background: #cbd5e1;' +
'      margin-left: auto;' +
'      margin-bottom: 4px;' +
'    }' +
'    .sig-title { font-size: 11px; font-weight: 800; color: #1e293b; }' +
'    .sig-org { font-size: 10px; color: #64748b; font-weight: 600; }' +
'    .doc-legal-note {' +
'      text-align: center;' +
'      font-size: 9.5px;' +
'      color: #94a3b8;' +
'      margin-top: 16px;' +
'      padding-top: 10px;' +
'      border-top: 1px solid #f1f5f9;' +
'    }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="action-bar">' +
'    <h3>🎓 DE-ECO Official Academic Report Card</h3>' +
'    <div class="action-btns">' +
'      <button onclick="window.print()" class="btn btn-primary">🖨️ Save as PDF / Print</button>' +
'      <button onclick="window.close()" class="btn btn-secondary">✕ Close</button>' +
'    </div>' +
'  </div>' +
'  <div class="report-card-wrapper">' +
'    <header class="header-banner">' +
'      <div class="header-top">' +
'        <div class="brand-group">' +
'          <img src="/logo/De-Eco-logo.png" alt="DE-ECO" class="brand-logo-img" onerror="this.style.display=\'none\'" />' +
'          <div>' +
'            <div class="brand-text-name">DE-ECO</div>' +
'            <div class="brand-text-sub">Academic Assessment & Evaluation</div>' +
'          </div>' +
'        </div>' +
'        <div class="header-doc-meta">' +
'          <span class="doc-badge">Verified Performance Record</span>' +
'          <div class="doc-code">Transcript ID: ' + escapeHtml(transcriptCode) + '</div>' +
'          <div class="doc-code">Issue Date: ' + escapeHtml(issueDate) + '</div>' +
'        </div>' +
'      </div>' +
'      <div class="header-title-box">' +
'        <h1>' + escapeHtml(examTitle) + '</h1>' +
'        <p>Comprehensive Academic Evaluation & Performance Transcript</p>' +
'      </div>' +
'    </header>' +
'    <div class="card-content">' +
'      <div class="meta-grid">' +
'        <div class="meta-item"><span class="meta-label">Candidate Name</span><span class="meta-val">' + escapeHtml(candidateName) + '</span></div>' +
'        <div class="meta-item"><span class="meta-label">' + courseMetaLabel + '</span><span class="meta-val">' + escapeHtml(courseTitle) + '</span></div>' +
'        <div class="meta-item"><span class="meta-label">Candidate Email</span><span class="meta-val">' + escapeHtml(candidateEmail) + '</span></div>' +
'        <div class="meta-item"><span class="meta-label">Evaluating Faculty</span><span class="meta-val">' + escapeHtml(instructor) + '</span></div>' +
'        <div class="meta-item"><span class="meta-label">Submission Date</span><span class="meta-val">' + escapeHtml(submittedAt) + '</span></div>' +
'        <div class="meta-item"><span class="meta-label">Time Spent</span><span class="meta-val">' + (timeSpent <= 0 ? '< 1 Minute' : timeSpent === 1 ? '1 Minute' : timeSpent + ' Minutes') + '</span></div>' +
'      </div>' +
'      <div class="score-summary-grid keep-together">' +
'        <div class="score-box score-box-primary">' +
'          <div class="score-box-label">Total Score Secured</div>' +
'          <div class="score-box-val" style="color: #047857;">' + scoreObtained + ' <span style="font-size: 15px; color: #64748b; font-weight: 600;">/ ' + totalMarks + '</span></div>' +
'          <div class="score-box-sub">Aggregate Marks</div>' +
'        </div>' +
'        <div class="score-box score-box-accent">' +
'          <div class="score-box-label">Percentage</div>' +
'          <div class="score-box-val" style="color: #1d4ed8;">' + percentage + '%</div>' +
'          <div class="score-box-sub">Overall Proficiency</div>' +
'        </div>' +
'        <div class="score-box">' +
'          <div class="score-box-label">Academic Grade</div>' +
'          <div class="score-box-val" style="font-size: 18px; color: #0f172a;">' + escapeHtml(grade) + '</div>' +
'          <div class="score-box-sub">Evaluation Tier</div>' +
'        </div>' +
'        <div class="score-box">' +
'          <div class="score-box-label">Evaluation Status</div>' +
'          <div style="margin-top: 6px;"><span class="status-badge-pass">✓ EVALUATED</span></div>' +
'          <div class="score-box-sub" style="margin-top: 6px;">Official Verification</div>' +
'        </div>' +
'      </div>' +
'      <table class="breakdown-table keep-together">' +
'        <thead><tr><th>Assessment Component</th><th>Questions</th><th>Max Marks</th><th>Marks Awarded</th><th>Accuracy</th></tr></thead>' +
'        <tbody>' +
          (mcqQuestions.length > 0 ? '<tr><td><strong>Section A: Multiple Choice Questions</strong></td><td>' + mcqQuestions.length + '</td><td>' + mcqTotal + '</td><td>' + mcqAwarded + '</td><td>' + (mcqTotal > 0 ? Math.round((mcqAwarded / mcqTotal) * 100) : 0) + '%</td></tr>' : '') +
          (descriptiveQuestions.length > 0 ? '<tr><td><strong>' + (mcqQuestions.length > 0 ? 'Section B: Descriptive Responses' : 'Descriptive Responses') + '</strong></td><td>' + descriptiveQuestions.length + '</td><td>' + descTotal + '</td><td>' + descAwarded + '</td><td>' + (descTotal > 0 ? Math.round((descAwarded / descTotal) * 100) : 0) + '%</td></tr>' : '') +
'          <tr><td>TOTAL PERFORMANCE</td><td>' + answersList.length + '</td><td>' + totalMarks + '</td><td>' + scoreObtained + '</td><td>' + percentage + '%</td></tr>' +
'        </tbody>' +
'      </table>' +
      (feedback && (
        (feedback.overall && feedback.overall.trim() !== '' && feedback.overall !== 'Good attempt on the paper.') ||
        (Array.isArray(feedback.strengths) && feedback.strengths.filter((s: string) => s && s !== 'Demonstrated understanding of key concepts').length > 0) ||
        (Array.isArray(feedback.improvements) && feedback.improvements.filter((i: string) => i && i !== 'Review questions where marks were deducted').length > 0)
      ) ?
'      <div class="feedback-box keep-together">' +
'        <div class="feedback-header"><h4><span>✍️</span> Official Faculty Evaluation & Commentary</h4><span class="feedback-eval-meta">' + escapeHtml(feedback.evaluatedAt || ('Evaluated by ' + instructor)) + '</span></div>' +
        (feedback.overall && feedback.overall.trim() !== '' && feedback.overall !== 'Good attempt on the paper.' ? '<p class="feedback-body">"' + escapeHtml(feedback.overall) + '"</p>' : '') +
        ((Array.isArray(feedback.strengths) && feedback.strengths.filter((s: string) => s && s !== 'Demonstrated understanding of key concepts').length > 0) || (Array.isArray(feedback.improvements) && feedback.improvements.filter((i: string) => i && i !== 'Review questions where marks were deducted').length > 0) ?
'        <div class="feedback-pillars">' +
          (Array.isArray(feedback.strengths) && feedback.strengths.filter((s: string) => s && s !== 'Demonstrated understanding of key concepts').length > 0 ? '<div class="pillar-col strengths"><h5>Key Strengths</h5><ul>' + feedback.strengths.filter((s: string) => s && s !== 'Demonstrated understanding of key concepts').map((s: string) => '<li>' + escapeHtml(s) + '</li>').join('') + '</ul></div>' : '') +
          (Array.isArray(feedback.improvements) && feedback.improvements.filter((i: string) => i && i !== 'Review questions where marks were deducted').length > 0 ? '<div class="pillar-col improvements"><h5>Areas for Growth</h5><ul>' + feedback.improvements.filter((i: string) => i && i !== 'Review questions where marks were deducted').map((i: string) => '<li>' + escapeHtml(i) + '</li>').join('') + '</ul></div>' : '') +
'        </div>' : '') +
'      </div>' : '') +
'      <h3 class="section-title">Itemized Assessment Details</h3>' +
'      <div class="question-list">' +
        answersList.map((ans, idx) => {
          const isMcq = ans.type === 'mcq';
          const marksAwarded = ans.marksAwarded !== undefined ? Number(ans.marksAwarded) : (isMcq && ans.isCorrect ? ans.marks : 0);
          const studentAnsText = stripHtmlTags(ans.studentAnswer || '');
          return '<div class="q-card keep-together">' +
            '<div class="q-card-head">' +
              '<div class="q-badge-row"><span class="q-num">Q' + (ans.questionNumber || idx + 1) + '</span><span class="q-type">' + (isMcq ? 'Multiple Choice' : 'Descriptive Response') + '</span></div>' +
              '<div class="q-marks"><span style="color: ' + (marksAwarded >= ans.marks ? '#059669' : marksAwarded > 0 ? '#d97706' : '#dc2626') + '">' + marksAwarded + '</span> / ' + ans.marks + ' Marks</div>' +
            '</div>' +
            '<div class="q-text">' + escapeHtml(ans.question) + '</div>' +
            '<div class="q-answer-box"><strong>Candidate Response:</strong> ' +
              (isMcq ? 'Option ' + escapeHtml(ans.studentAnswer || 'Unanswered') + (ans.isCorrect ? ' <span style="color:#059669; font-weight:800;">(Correct)</span>' : ' <span style="color:#dc2626; font-weight:800;">(Incorrect)</span>') : escapeHtml(studentAnsText || '(No response recorded)')) +
              (isMcq && ans.correctAnswer ? '<div style="margin-top: 4px; color: #475569;"><strong>Correct Key:</strong> Option ' + escapeHtml(ans.correctAnswer) + '</div>' : '') +
            '</div>' +
            (ans.teacherComment ? '<div class="q-teacher-remark"><strong>Feedback:</strong> "' + escapeHtml(ans.teacherComment) + '"</div>' : '') +
          '</div>';
        }).join('') +
'      </div>' +
'      <footer class="auth-footer keep-together">' +
'        <div class="auth-seal-block">' +
'          <div class="seal-badge">' +
'            <span class="seal-text-top">DE-ECO</span>' +
'            <span class="seal-icon">★</span>' +
'            <span class="seal-text-bot">VERIFIED</span>' +
'          </div>' +
'          <div class="auth-meta-text">' +
'            <strong>Certified Academic Document</strong><br>' +
'            Digitally authenticated via DE-ECO Assessment Engine.<br>' +
'            Verify certificate at <span style="color:#0284c7;">https://deeco.in</span>' +
'          </div>' +
'        </div>' +
'        <div class="sig-block">' +
'          <div class="sig-name">Rishika</div>' +
'          <div class="sig-line"></div>' +
'          <div class="sig-title">Instructor Rishika</div>' +
'          <div class="sig-org">Lead Faculty, DE-ECO Academy</div>' +
'        </div>' +
'      </footer>' +
'      <div class="doc-legal-note">© ' + new Date().getFullYear() + ' DE-ECO. All rights reserved. Official examination transcript.</div>' +
'    </div>' +
'  </div>' +
'  <script>' +
'    function triggerReportPrint() {' +
'      try {' +
'        window.focus();' +
'        window.print();' +
'      } catch(e) { console.warn(e); }' +
'    }' +
'    if (document.readyState === "complete" || document.readyState === "interactive") {' +
'      setTimeout(triggerReportPrint, 350);' +
'    } else {' +
'      window.addEventListener("DOMContentLoaded", function() { setTimeout(triggerReportPrint, 350); });' +
'      window.addEventListener("load", function() { setTimeout(triggerReportPrint, 350); });' +
'      setTimeout(triggerReportPrint, 1000);' +
'    }' +
'  <\/script>' +
'</body>' +
'</html>';

  // 1. Create a Blob URL so the report opens as a legitimate document
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  // 2. Open in a new tab without restrictive window dimensions (prevents popup blocker)
  let printWindow: Window | null = null;
  try {
    printWindow = window.open(blobUrl, '_blank');
  } catch (err) {
    console.warn('Window open error:', err);
  }

  // 3. Robust fallback if popup is blocked: use visible-dimension transparent iframe
  if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.opacity = '0.01';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print failed', e);
        }
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          } catch (e) {}
        }, 3000);
      }, 400);
    };
  }
};

/* ========================================================================= */
/* ========================== MAIN COMPONENT =============================== */
/* ========================================================================= */

const formatExamDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

interface ExamsPageProps {
  onPageChange?: (page: string) => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ onPageChange }) => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  // Top level tabs: 'catalog' | 'results'
  const [activeTab, setActiveTab] = useState<"catalog" | "results">("catalog");

  // Helper to filter out legacy mock IDs
  const isMockId = (id: string) =>
    /^(a1111111|a2222222|a3333333|a4444444|b1111111|b2222222|exam-|res-)/i.test(id || "");

  // Dynamic exams list for Tab 1 (Upcoming & Live Exams)
  const [examsList, setExamsList] = useState<Exam[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("deeco_admin_exams");
        if (saved) {
          const parsed: Exam[] = JSON.parse(saved);
          const filtered = parsed.filter((e) => !isMockId(e.id));
          if (filtered.length !== parsed.length) {
            localStorage.setItem("deeco_admin_exams", JSON.stringify(filtered));
          }
          return filtered;
        }
      }
    } catch (e) {}
    return [];
  });

  // Dynamic results list for Tab 2 (Results & Teacher Feedback)
  const [resultsList, setResultsList] = useState<ExamResult[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("deeco_exam_results");
        if (saved) {
          const parsed: ExamResult[] = JSON.parse(saved);
          const filtered = parsed.filter((r) => !isMockId(r.id));
          if (filtered.length !== parsed.length) {
            localStorage.setItem("deeco_exam_results", JSON.stringify(filtered));
          }
          return filtered;
        }
      }
    } catch (e) {}
    return [];
  });

  // Persistent paused/active exam sessions by examId (timer, answers, currentIdx preserved)
  const [examSessions, setExamSessions] = useState<Record<string, ExamSessionState>>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("de_eco_exam_sessions");
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return {};
  });

  // Active exam state (null when browsing, populated when taking test)
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Instructions modal before starting
  const [preExamModal, setPreExamModal] = useState<Exam | null>(null);

  // Selected Result for Detailed Report Card Modal
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "expired">("all");

  // Current logged in student & active course enrollments
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [enrolledCourseTitles, setEnrolledCourseTitles] = useState<Set<string>>(new Set());

  // Helper to format course name: converts "1-on-1: Name" to "Assessment #X: Name"
  const getFormattedCourseTitle = (
    courseName: string | undefined,
    targetId?: string,
    studentName?: string
  ): { label: string; title: string } => {
    const raw = (courseName || "").trim();
    const is1on1 = /^1-on-1/i.test(raw) || raw.toLowerCase().includes("1-on-1");

    if (!is1on1) {
      return {
        label: raw.startsWith("Assessment #") ? "Assessment" : "Course",
        title: raw || "General Examination"
      };
    }

    // Determine chronological assessment number X for this student
    const allAssessments: { id: string; date: number }[] = [];

    // Submitted results
    resultsList.forEach((r, idx) => {
      const d = r.submittedAt ? new Date(r.submittedAt).getTime() : 0;
      const t = isNaN(d) || d === 0 ? idx : d;
      allAssessments.push({ id: r.id, date: t });
      if (r.examId && r.examId !== r.id) {
        allAssessments.push({ id: r.examId, date: t });
      }
    });

    // Active exams
    examsList.forEach((e, idx) => {
      allAssessments.push({ id: e.id, date: Date.now() + idx });
    });

    allAssessments.sort((a, b) => a.date - b.date);

    let assessmentNum = 1;
    if (targetId) {
      const matchIdx = allAssessments.findIndex((item) => item.id === targetId);
      if (matchIdx >= 0) {
        assessmentNum = matchIdx + 1;
      }
    }

    // Extract student name from "1-on-1: Name"
    let studentPortion = "";
    const match = raw.match(/^1-on-1\s*[:\-–]?\s*(.*)$/i);
    if (match && match[1] && match[1].trim()) {
      studentPortion = match[1].trim();
    } else if (studentName && studentName.trim()) {
      studentPortion = studentName.trim();
    } else if (currentUserName && currentUserName.trim()) {
      studentPortion = currentUserName.trim();
    }

    const formatted = studentPortion
      ? `Assessment #${assessmentNum}: ${studentPortion}`
      : `Assessment #${assessmentNum}`;

    return {
      label: "Assessment",
      title: formatted
    };
  };

  useEffect(() => {
    const fetchUserAndEnrollments = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        if (user.email) {
          setCurrentUserEmail(user.email.toLowerCase().trim());
        }
        const uName = (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || user.email?.split("@")[0] || "Student";
        setCurrentUserName(uName);

        // 1. Fetch course enrollments
        const { data: enrollments, error: enrollError } = await supabase
          .from("course_enrollments")
          .select("course_id, status, courses(id, title)")
          .eq("user_id", user.id);

        if (!enrollError && enrollments) {
          const ids = new Set<string>();
          const titles = new Set<string>();
          for (const item of enrollments) {
            if (item.course_id) ids.add(String(item.course_id));
            const cTitle = (item as any)?.courses?.title;
            if (cTitle) titles.add(String(cTitle).toLowerCase().trim());
          }
          setEnrolledCourseIds(ids);
          setEnrolledCourseTitles(titles);
        }

        // 2. Fetch student's submitted exams from public.exam_submissions
        const submittedExamIds = new Set<string>();
        const { data: submissionsData, error: subError } = await supabase
          .from("exam_submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false });

        if (!subError && submissionsData) {
          const mappedResults: ExamResult[] = submissionsData.map((d: any) => ({
            id: d.id,
            examId: d.exam_id,
            examTitle: d.exam_title,
            course: d.course_title || "",
            instructor: d.instructor_name || "Rishika",
            studentName: d.student_name || uName,
            studentEmail: d.student_email || (user.email ? user.email.toLowerCase().trim() : undefined),
            submittedAt: d.submitted_at
              ? new Date(d.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Recently",
            status: d.status || "under_evaluation",
            totalMarks: Number(d.total_marks) || 100,
            scoreObtained:
              d.score_obtained !== null && d.score_obtained !== undefined
                ? Number(d.score_obtained)
                : undefined,
            percentage:
              d.percentage !== null && d.percentage !== undefined
                ? Number(d.percentage)
                : undefined,
            grade: d.grade || undefined,
            isPassed:
              d.is_passed !== null && d.is_passed !== undefined
                ? Boolean(d.is_passed)
                : undefined,
            timeSpentMinutes: Number(d.time_spent_minutes) || 0,
            teacherFeedback: (() => {
              const tf = d.teacher_feedback;
              if (!tf) return undefined;
              const cleanOverall = tf.overall && tf.overall !== 'Good attempt on the paper.' ? String(tf.overall).trim() : '';
              const cleanStrengths = Array.isArray(tf.strengths)
                ? tf.strengths.filter((s: string) => s && s !== 'Demonstrated understanding of key concepts')
                : [];
              const cleanImprovements = Array.isArray(tf.improvements)
                ? tf.improvements.filter((i: string) => i && i !== 'Review questions where marks were deducted')
                : [];
              if (!cleanOverall && cleanStrengths.length === 0 && cleanImprovements.length === 0) return undefined;
              return { ...tf, overall: cleanOverall, strengths: cleanStrengths, improvements: cleanImprovements };
            })(),
            answers: Array.isArray(d.answers) ? d.answers : []
          }));
          setResultsList(mappedResults);
          try {
            localStorage.setItem("deeco_exam_results", JSON.stringify(mappedResults));
          } catch (e) {}
          submissionsData.forEach((s: any) => {
            if (s.exam_id) submittedExamIds.add(String(s.exam_id));
          });
        }

        // 3. Fetch active live exams from public.exams
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!examsError && examsData) {
          const mappedExams: Exam[] = examsData
            .map((d: any) => ({
              id: d.id,
              title: d.title,
              course: d.course_title || "General Examination",
              courseId: d.course_id || undefined,
              assignedType: d.assigned_type || "course",
              assignedStudentEmail: d.assigned_student_email || undefined,
              assignedStudentName: d.assigned_student_name || undefined,
              instructor: d.instructor_name || "Rishika",
              status: d.status || "live",
              scheduledDate: d.scheduled_date || "Anytime / Self-Paced",
              scheduledTime: d.scheduled_time || "Flexible",
              durationMinutes: Number(d.duration_minutes) || 60,
              totalMarks: Number(d.total_marks) || 100,
              passingMarks: Number(d.passing_marks) || 40,
              mcqCount: Number(d.mcq_count) || 0,
              descriptiveCount: Number(d.descriptive_count) || 0,
              syllabus: Array.isArray(d.syllabus) ? d.syllabus : [],
              instructions: Array.isArray(d.instructions) ? d.instructions : [],
              questions: Array.isArray(d.questions) ? d.questions : []
            }))
            // Filter out exams student has already submitted
            .filter((e: Exam) => !submittedExamIds.has(e.id));

          setExamsList(mappedExams);
          try {
            localStorage.setItem("deeco_admin_exams", JSON.stringify(mappedExams));
          } catch (e) {}
        }
      } catch (err) {
        console.warn("Error fetching user, exams, or enrollments:", err);
      }
    };

    fetchUserAndEnrollments();

    // Realtime subscriptions for exams and exam_submissions
    const subChannel = supabase
      .channel("student_exam_submissions_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "exam_submissions" }, () => {
        fetchUserAndEnrollments();
      })
      .subscribe();

    const examsChannel = supabase
      .channel("student_exams_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "exams" }, () => {
        fetchUserAndEnrollments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subChannel);
      supabase.removeChannel(examsChannel);
    };
  }, []);

  // Filtered exams for Tab 1 (strictly student-level)
  const filteredExams = examsList.filter((exam) => {
    // 1. If assigned to specific students: check if logged-in student's email is in the list
    if (exam.assignedType === "student") {
      if (!currentUserEmail) return false;
      const assignedEmails = (exam.assignedStudentEmail || "")
        .toLowerCase()
        .split(",")
        .map((e) => e.trim());
      if (!assignedEmails.includes(currentUserEmail.toLowerCase().trim())) {
        return false;
      }
    }

    // 2. Search & Status filter
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handler when student pauses and exits an exam
  const handlePauseAndExit = (session: ExamSessionState) => {
    setExamSessions((prev) => {
      const updated = { ...prev, [session.examId]: session };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("de_eco_exam_sessions", JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    setActiveExam(null);
  };

  // Handler when student completes an exam:
  // 1. Remove any paused session
  // 2. Remove exam from Tab 1 (Upcoming & Live)
  // 3. Add to Tab 2 (Results & Teacher Feedback) with "under_evaluation"
  // 4. Switch to Tab 2
  // 5. Persist submission to Supabase public.exam_submissions
  const handleFinishExam = async (newResult: ExamResult) => {
    setExamSessions((prev) => {
      const updated = { ...prev };
      delete updated[newResult.examId];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("de_eco_exam_sessions", JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    setExamsList((prev) => prev.filter((e) => e.id !== newResult.examId));
    setResultsList((prev) => {
      const updated = [newResult, ...prev];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("deeco_exam_results", JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    setActiveExam(null);
    setSelectedResult(newResult);
    setActiveTab("results");

    // Persist to Supabase public.exam_submissions
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (user) {
        const totalAwarded = newResult.answers.reduce(
          (acc, a) => acc + (a.marksAwarded !== undefined ? a.marksAwarded : 0),
          0
        );
        const hasDescriptive = newResult.answers.some((a) => a.type === "descriptive");

        const submissionId = isValidUUID(newResult.id) ? newResult.id : generateUUID();
        const examId = isValidUUID(newResult.examId) ? newResult.examId : null;

        if (examId) {
          const submissionPayload = {
            id: submissionId,
            exam_id: examId,
            user_id: user.id,
            exam_title: newResult.examTitle,
            course_title: newResult.course,
            student_email: user.email || currentUserEmail || "",
            student_name:
              (user.user_metadata as any)?.full_name ||
              (user.user_metadata as any)?.name ||
              user.email?.split("@")[0] ||
              "Student",
            instructor_name: newResult.instructor || "Rishika",
            status: hasDescriptive ? "under_evaluation" : "graded",
            submitted_at: new Date().toISOString(),
            total_marks: newResult.totalMarks,
            score_obtained: hasDescriptive ? null : totalAwarded,
            percentage: hasDescriptive
              ? null
              : Math.round((totalAwarded / (newResult.totalMarks || 1)) * 100),
            grade: hasDescriptive
              ? null
              : (Math.round((totalAwarded / (newResult.totalMarks || 1)) * 100) >= 80 ? "A Distinction" : "Completed"),
            is_passed: true,
            time_spent_minutes: newResult.timeSpentMinutes !== undefined ? newResult.timeSpentMinutes : 0,
            answers: newResult.answers,
            teacher_feedback: newResult.teacherFeedback || null
          };

          const { error: insertError } = await supabase
            .from("exam_submissions")
            .insert(submissionPayload);

          if (insertError) {
            console.error("Error inserting exam submission into Supabase:", insertError);
          } else {
            // Increment exams_completed in user_class_stats
            try {
              const { data: stats } = await supabase
                .from("user_class_stats")
                .select("exams_completed, average_exam_score")
                .eq("user_id", user.id)
                .maybeSingle();

              if (stats) {
                const currentCount = Number(stats.exams_completed) || 0;
                await supabase
                  .from("user_class_stats")
                  .update({
                    exams_completed: currentCount + 1,
                    updated_at: new Date().toISOString()
                  })
                  .eq("user_id", user.id);
              }
            } catch (statsErr) {
              console.warn("Could not update user_class_stats:", statsErr);
            }
          }
        }
      }
    } catch (dbErr) {
      console.error("Error in Supabase exam submission persist:", dbErr);
    }
  };

  // Demo simulator to evaluate an un-graded submission
  const handleSimulateTeacherReview = (resultId: string) => {
    const applyGrading = (r: ExamResult): ExamResult => {
      if (r.id !== resultId) return r;
      return {
        ...r,
        status: "graded" as const,
        scoreObtained: 46,
        percentage: 92,
        grade: "A+ Distinction",
        isPassed: true,
        teacherFeedback: {
          evaluatedAt: "Just now",
          overall: "Magnificent work! Your analysis of the Keynesian liquidity trap and macroeconomic shifters was structured with immense clarity. Great improvement on addressing open-economy nuances!",
          strengths: [
            "Flawless conceptual clarity on monetary transmission",
            "Effective use of economic diagram references in descriptive answers",
            "High analytical rigor and concise writing"
          ],
          improvements: [
            "Could also mention asset market expectations in the zero lower bound context"
          ]
        },
        answers: r.answers.map((ans) => ({
          ...ans,
          marksAwarded: ans.type === "mcq" ? ans.marks : ans.marks - 2,
          teacherComment: ans.type === "descriptive" ? "Excellent depth of argument and synthesis of economic variables!" : undefined
        }))
      };
    };

    setResultsList((prev) => prev.map(applyGrading));
    setSelectedResult((prev) => (prev && prev.id === resultId ? applyGrading(prev) : prev));
  };

  return (
    <div
      className="min-h-screen pt-28 sm:pt-36 pb-16 transition-colors duration-300"
      style={{ backgroundColor: themeColors.primary.lightGray }}
    >
      {/* If an exam is active, show the full-screen examination portal */}
      {activeExam ? (
        <ExamTakingPortal
          exam={activeExam}
          initialSession={examSessions[activeExam.id] || null}
          onExit={() => setActiveExam(null)}
          onPauseAndExit={handlePauseAndExit}
          onFinishExam={handleFinishExam}
          themeColors={themeColors}
          isDark={isDark}
        />
      ) : (
        <div className="container mx-auto px-4 sm:px-6">
          {/* ================= PAGE HEADER ================= */}
          <div className="text-center mb-10">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 tracking-tight"
              style={{ color: themeColors.text.primary }}
            >
              Assessments & Examinations
            </h1>
          </div>

          {/* ================= CLEAN PASTEL 4 STATS BAR (NO HARSH BORDERS) ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Box 1: Count of scheduled exams */}
            <div
              className="rounded-2xl p-4 sm:p-5 text-center shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.blue }}
            >
              <div
                className="text-2xl sm:text-3xl font-black dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {examsList.filter((e) => e.status !== "expired").length}
              </div>
              <div
                className="text-xs sm:text-sm font-bold mt-1 dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Scheduled Exams
              </div>
            </div>

            {/* Box 2: Count of Exams given */}
            <div
              className="rounded-2xl p-4 sm:p-5 text-center shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.yellow }}
            >
              <div
                className="text-2xl sm:text-3xl font-black dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {resultsList.length}
              </div>
              <div
                className="text-xs sm:text-sm font-bold mt-1 dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Exams Given
              </div>
            </div>

            {/* Box 3: Count of exams waiting for review */}
            <div
              className="rounded-2xl p-4 sm:p-5 text-center shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.green }}
            >
              <div
                className="text-2xl sm:text-3xl font-black dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {resultsList.filter((r) => r.status === "under_evaluation").length}
              </div>
              <div
                className="text-xs sm:text-sm font-bold mt-1 dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Waiting for Review
              </div>
            </div>

            {/* Box 4: Count of exams reviewed */}
            <div
              className="rounded-2xl p-4 sm:p-5 text-center shadow-md transition hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.accent.red }}
            >
              <div
                className="text-2xl sm:text-3xl font-black dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {resultsList.filter((r) => r.status === "graded").length}
              </div>
              <div
                className="text-xs sm:text-sm font-bold mt-1 dark:text-white"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Exams Reviewed
              </div>
            </div>
          </div>

          {/* ================= SIGNATURE DE-ECO PILL TABS ================= */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex rounded-full p-1 border-2 shadow-sm"
              style={{ backgroundColor: themeColors.primary.w, borderColor: themeColors.primary.w2 }}
            >
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-6 sm:px-10 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
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
                      ? { backgroundColor: themeColors.accent.yellow, color: "#000000" }
                      : { backgroundColor: themeColors.accent.blue, color: themeColors.primary.w2 }
                  }
                >
                  {examsList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("results")}
                className={`px-6 sm:px-10 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
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
                      ? { backgroundColor: themeColors.accent.yellow, color: "#000000" }
                      : { backgroundColor: themeColors.accent.green, color: "#000000" }
                  }
                >
                  {resultsList.length}
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
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 font-medium text-sm outline-none transition shadow-sm focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white"
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
                    { id: "expired", label: "Expired Today" }
                  ].map((filter) => {
                    const isSelected = statusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isSelected ? "scale-105 shadow-md" : "opacity-75 hover:opacity-100"
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
                  const isExpired = exam.status === "expired";
                  const savedSession = examSessions[exam.id];
                  const isPausedSession = !!savedSession;
                  const isAnytime =
                    !exam.scheduledDate ||
                    exam.scheduledDate.toLowerCase().includes("anytime") ||
                    exam.scheduledDate.toLowerCase().includes("self-paced") ||
                    exam.scheduledDate.toLowerCase().includes("flexible") ||
                    exam.scheduledTime?.toLowerCase().includes("flexible");

                  return (
                    <div
                      key={exam.id}
                      className="rounded-2xl p-6 sm:p-7 shadow-lg border border-gray-100 dark:border-neutral-800 transition-all hover:scale-[1.01] hover:shadow-xl flex flex-col justify-between"
                      style={{ backgroundColor: themeColors.background.white }}
                    >
                      {/* Top Header Row */}
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          {(() => {
                            const info = getFormattedCourseTitle(exam.course, exam.id, exam.assignedStudentName);
                            if (!info.title || info.title.toLowerCase().includes("all students")) return <span />;
                            return (
                              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 truncate">
                                {info.title}
                              </span>
                            );
                          })()}

                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            {isPausedSession ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              >
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                PAUSED IN PROGRESS
                              </span>
                            ) : isLive ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs"
                                style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
                              >
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                                LIVE NOW
                              </span>
                            ) : isExpired ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                EXPIRED TODAY
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-xs"
                                style={{ backgroundColor: themeColors.accent.blue, color: "#000000" }}
                              >
                                SCHEDULED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h2
                          className="text-xl sm:text-2xl font-black mb-2"
                          style={{ color: themeColors.text.primary }}
                        >
                          {exam.title}
                        </h2>

                        {/* Instructor Info */}
                        <div className="flex items-center gap-2 text-xs font-semibold mb-5" style={{ color: themeColors.text.secondary }}>
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Course Instructor: <strong style={{ color: themeColors.text.primary }}>{exam.instructor}</strong></span>
                        </div>

                        {/* 4 Clean Spec Blocks */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                          <div className="rounded-xl p-3 bg-gray-50 dark:bg-neutral-800/80 text-center border border-gray-100 dark:border-neutral-700/60">
                            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Duration</div>
                            <div className="text-sm font-black" style={{ color: themeColors.text.primary }}>
                              {exam.durationMinutes} Mins
                            </div>
                          </div>

                          <div className="rounded-xl p-3 bg-gray-50 dark:bg-neutral-800/80 text-center border border-gray-100 dark:border-neutral-700/60">
                            <Award className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Total Marks</div>
                            <div className="text-sm font-black" style={{ color: themeColors.text.primary }}>
                              {exam.totalMarks} Pts
                            </div>
                          </div>

                          <div className="rounded-xl p-3 bg-gray-50 dark:bg-neutral-800/80 text-center border border-gray-100 dark:border-neutral-700/60">
                            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Passing Marks</div>
                            <div className="text-sm font-black" style={{ color: themeColors.text.primary }}>
                              {exam.passingMarks} Pts
                            </div>
                          </div>

                          <div className="rounded-xl p-3 bg-gray-50 dark:bg-neutral-800/80 text-center border border-gray-100 dark:border-neutral-700/60">
                            <FileText className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="text-xs text-gray-500 font-medium">Format</div>
                            <div className="text-xs font-black" style={{ color: themeColors.text.primary }}>
                              {exam.mcqCount} MCQ + {exam.descriptiveCount} Descriptive
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-4">
                        <div className="text-xs font-bold" style={{ color: themeColors.text.secondary }}>
                          {isPausedSession ? (
                            <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5" /> Paused ({formatExamDuration(savedSession.secondsLeft)} remaining • {Object.keys(savedSession.answers).filter((k) => savedSession.answers[k]?.trim()).length} answered)
                            </span>
                          ) : isExpired ? (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                              <AlertCircle className="w-3.5 h-3.5" /> Closed at {exam.expiredAt || "11:30 AM"} • Visible till midnight
                            </span>
                          ) : isAnytime ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Anytime / Self-Paced
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-neutral-400 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5" /> {exam.scheduledDate} {exam.scheduledTime && exam.scheduledTime !== "Flexible" ? `• ${exam.scheduledTime}` : ""}
                            </span>
                          )}
                        </div>

                        {/* Action CTA */}
                        {isPausedSession ? (
                          <button
                            onClick={() => setActiveExam(exam)}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
                          >
                            <Play className="w-4 h-4 fill-current" />
                            Resume Exam <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : isExpired ? (
                          <button
                            disabled
                            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed flex items-center gap-1.5"
                          >
                            Expired (Not Attempted)
                          </button>
                        ) : isLive ? (
                          <button
                            onClick={() => setPreExamModal(exam)}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
                          >
                            Take Exam Now <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed flex items-center gap-1.5"
                          >
                            Opens {exam.scheduledDate}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredExams.length === 0 && (
                <div className="text-center py-16 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black p-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {examsList.length === 0 ? "No Exams Scheduled Yet" : "No Exams Match Your Filter"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {examsList.length === 0
                      ? "There are no upcoming or active examinations scheduled for you right now. Please check back later."
                      : "Try switching filters or search keywords to view other examinations."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: RESULTS & TEACHER FEEDBACK ================= */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {/* Results Cards List */}
              <div className="grid grid-cols-1 gap-5">
                {resultsList.length === 0 ? (
                  <div
                    className="rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-neutral-700 space-y-3"
                    style={{ backgroundColor: themeColors.background.white }}
                  >
                    <Award className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                      No Exam Submissions Yet
                    </h3>
                    <p className="text-sm text-gray-500">
                      Completed exams and teacher evaluations will appear here as soon as you submit a test.
                    </p>
                  </div>
                ) : (
                  resultsList.map((res) => {
                    const isGraded = res.status === "graded";

                    return (
                      <div
                        key={res.id}
                        className="rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 sm:p-7 shadow-lg transition-all hover:scale-[1.01] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                        style={{ backgroundColor: themeColors.background.white }}
                      >
                        {/* Left: Info */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500">
                              Submitted: {res.submittedAt}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black" style={{ color: themeColors.text.primary }}>
                            {res.examTitle}
                          </h3>

                          {isGraded ? (
                            <div className="flex items-center gap-3 pt-1">
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
                                style={{ backgroundColor: themeColors.accent.green, color: "#000000" }}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated & Released
                              </span>
                              <span className="text-xs font-bold" style={{ color: themeColors.text.secondary }}>
                                Evaluated by <strong style={{ color: themeColors.text.primary }}>{res.instructor}</strong>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 pt-1">
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
                                style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
                              >
                                <Clock className="w-3.5 h-3.5" /> Waiting for Teacher's Feedback
                              </span>
                              <span className="text-xs font-bold text-gray-500">
                                {res.instructor || 'Teacher'} is evaluating your descriptive responses
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Middle: Score Summary (if graded) */}
                        {isGraded && (
                          <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 shadow-xs shrink-0">
                            <div className="text-right">
                              <span className="text-xs text-gray-500 font-bold block uppercase">Score</span>
                              <span className="text-2xl font-black" style={{ color: themeColors.text.primary }}>
                                {res.scoreObtained}
                                <span className="text-sm font-normal text-gray-500">/{res.totalMarks}</span>
                              </span>
                            </div>
                            <div className="w-[1px] h-9 bg-gray-200 dark:bg-neutral-700" />
                            <div>
                              <span className="text-xs text-gray-500 font-bold block uppercase">Percentage</span>
                              <span className="text-xl font-black block" style={{ color: themeColors.text.primary }}>
                                {res.percentage}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Right: CTA buttons */}
                        <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
                          {isGraded ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const cInfo = getFormattedCourseTitle(res.course, res.id || res.examId, res.studentName || currentUserName);
                                  downloadReportCard({ ...res, course: cInfo.title }, { studentName: currentUserName, studentEmail: currentUserEmail });
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                                title="Download Official DE-ECO Report Card"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download Report
                              </button>
                              <button
                                onClick={() => setSelectedResult(res)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                                style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
                              >
                                <Award className="w-4 h-4 text-yellow-400" />
                                View Full Report
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedResult(res)}
                              className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                              style={{ color: themeColors.text.primary }}
                            >
                              <Eye className="w-4 h-4" />
                              View Submitted Test
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PRE-EXAM INSTRUCTIONS MODAL ================= */}
      {preExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-6"
            style={{ backgroundColor: themeColors.background.white }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-xs font-bold uppercase px-2.5 py-0.5 rounded shadow-xs"
                  style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
                >
                  Candidate Instructions
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-2" style={{ color: themeColors.text.primary }}>
                  {preExamModal.title}
                </h3>
                <p className="text-xs font-bold mt-1" style={{ color: themeColors.text.secondary }}>
                  {getFormattedCourseTitle(preExamModal.course, preExamModal.id, preExamModal.assignedStudentName).title} • Instructor {preExamModal.instructor}
                </p>
              </div>
              <button
                onClick={() => setPreExamModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                style={{ color: themeColors.text.primary }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Rules Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">Duration</span>
                <span className="font-black text-sm" style={{ color: themeColors.text.primary }}>
                  {preExamModal.durationMinutes} Minutes
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">Total Marks</span>
                <span className="font-black text-sm" style={{ color: themeColors.text.primary }}>
                  {preExamModal.totalMarks} Marks
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">Questions</span>
                <span className="font-black text-sm" style={{ color: themeColors.text.primary }}>
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
                className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-300 dark:border-neutral-700 transition hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
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
          onSimulateReview={handleSimulateTeacherReview}
          themeColors={themeColors}
          isDark={isDark}
          studentName={currentUserName}
          studentEmail={currentUserEmail}
          getFormattedCourseTitle={getFormattedCourseTitle}
        />
      )}
    </div>
  );
};

/* ========================================================================= */
/* =================== VIEW: MS WORD DOCUMENT EDITOR ======================= */
/* ========================================================================= */

interface WordAnswerEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  lastSavedText?: string;
  isDark?: boolean;
}

const WordAnswerEditor: React.FC<WordAnswerEditorProps> = ({
  value,
  onChange,
  placeholder = "Type your answer here...",
  lastSavedText = "Draft auto-saved",
  isDark = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>(value || "");
  const savedRangeRef = useRef<Range | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showEquationMenu, setShowEquationMenu] = useState(false);

  // Active formatting state for live button indicators
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    subscript: false,
    superscript: false,
    unorderedList: false,
    orderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false
  });
  const [currentBlockStyle, setCurrentBlockStyle] = useState("Normal");

  // Initial load
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
        lastHtmlRef.current = value || "";
      }
    }
  }, []);

  // Update only if value changes externally (not from user typing inside)
  useEffect(() => {
    if (
      editorRef.current &&
      value !== lastHtmlRef.current &&
      document.activeElement !== editorRef.current
    ) {
      editorRef.current.innerHTML = value || "";
      lastHtmlRef.current = value || "";
    }
  }, [value]);

  // Clean word and character count
  const getCounts = (html: string) => {
    if (!html) return { words: 0, chars: 0 };
    const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
    const words = text === "" ? 0 : text.split(/\s+/).filter(Boolean).length;
    const chars = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").length;
    return { words, chars };
  };

  const { words, chars } = getCounts(value);

  // Save selection before clicking dropdown menus or on mouseup/keyup
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const updateActiveFormats = () => {
    saveSelection();
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        subscript: document.queryCommandState("subscript"),
        superscript: document.queryCommandState("superscript"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull")
      });

      const blockVal = document.queryCommandValue("formatBlock");
      const tag = (blockVal || "").toLowerCase();
      if (tag === "h2") setCurrentBlockStyle("Heading 1");
      else if (tag === "h3") setCurrentBlockStyle("Heading 2");
      else if (tag === "blockquote") setCurrentBlockStyle("Quote");
      else setCurrentBlockStyle("Normal");
    } catch (e) {
      // ignore
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtmlRef.current = html;
      onChange(html);
      updateActiveFormats();
    }
  };

  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const applyFormatBlock = (tag: string, label: string) => {
    setShowStyleMenu(false);
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }
    try {
      document.execCommand("formatBlock", false, tag);
    } catch (e) {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    setCurrentBlockStyle(label);
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      execCmd("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  };

  const insertTable = (rows: number, cols: number) => {
    setShowTableMenu(false);
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }

    const borderColor = isDark ? "#404040" : "#cbd5e1";
    const headerBg = isDark ? "#262626" : "#f8fafc";
    const textColor = isDark ? "#f5f5f5" : "#0f172a";
    const cellColor = isDark ? "#d4d4d4" : "#334155";

    let html = `<table style="width:100%; border-collapse:collapse; margin:14px 0; border:1px solid ${borderColor}; font-size:13px; text-align:left;">`;
    html += `<thead><tr style="background:${headerBg};">`;
    for (let c = 0; c < cols; c++) {
      html += `<th style="border:1px solid ${borderColor}; padding:8px 12px; font-weight:600; color:${textColor};">Column ${c + 1}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (let r = 0; r < rows - 1; r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        html += `<td style="border:1px solid ${borderColor}; padding:8px 12px; color:${cellColor};">&nbsp;</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;

    document.execCommand("insertHTML", false, html);
    handleInput();
  };

  const insertFormula = (formula: string, label: string) => {
    setShowEquationMenu(false);
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }

    const bg = isDark ? "#1e1e2e" : "#f0f4ff";
    const border = isDark ? "#818cf8" : "#4f46e5";
    const labelColor = isDark ? "#a5b4fc" : "#4338ca";
    const formulaColor = isDark ? "#ffffff" : "#0f172a";

    const html = `<div style="background:${bg}; border-left:3px solid ${border}; padding:10px 14px; margin:12px 0; border-radius:6px; font-family:monospace; font-size:14px;"><span style="font-size:10px; font-weight:bold; color:${labelColor}; text-transform:uppercase; display:block; margin-bottom:4px; letter-spacing:0.05em;">${label}</span><strong style="color:${formulaColor};">${formula}</strong></div><p><br></p>`;

    document.execCommand("insertHTML", false, html);
    handleInput();
  };

  const toggleHighlight = () => {
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const color = isDark ? "#854d0e" : "#fef08a";
    try {
      document.execCommand("hiliteColor", false, color);
    } catch (e) {
      document.execCommand("backColor", false, color);
    }
    handleInput();
  };

  // Helper for button classes with active highlights
  const btnClass = (isActive: boolean) =>
    `p-1.5 rounded-lg transition cursor-pointer shrink-0 ${
      isActive
        ? "bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white font-bold shadow-xs"
        : "text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
    }`;

  return (
    <div
      className={`transition-all flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none bg-white dark:bg-neutral-950"
          : isDark
          ? "rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xs"
          : "rounded-2xl border border-gray-200 bg-white shadow-xs"
      }`}
    >
      {/* ================= FUNCTIONAL MINIMALIST TOOLBAR ================= */}
      <div
        className={`px-3 sm:px-4 py-2 border-b flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar select-none text-xs rounded-t-2xl ${
          isDark
            ? "border-neutral-800 bg-neutral-900 text-neutral-300"
            : "border-gray-100 bg-white text-gray-700"
        }`}
      >
        {/* Undo / Redo */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("undo");
          }}
          className={btnClass(false)}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("redo");
          }}
          className={btnClass(false)}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800 mx-0.5 shrink-0" />

        {/* Style Dropdown (Selection Preserved) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowStyleMenu(!showStyleMenu);
              setShowTableMenu(false);
              setShowEquationMenu(false);
            }}
            className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 flex items-center gap-1 font-medium transition cursor-pointer border border-gray-200 dark:border-neutral-700 text-xs"
            title="Paragraph Style"
          >
            <span>{currentBlockStyle}</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showStyleMenu && (
            <div className="absolute top-8 left-0 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl p-1.5 w-36 space-y-0.5 animate-in fade-in slide-in-from-top-1">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormatBlock("p", "Normal");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                Normal text
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormatBlock("h2", "Heading 1");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-900 dark:text-neutral-100 cursor-pointer"
              >
                Heading 1
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormatBlock("h3", "Heading 2");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-neutral-200 cursor-pointer"
              >
                Heading 2
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormatBlock("blockquote", "Quote");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs italic hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                Quote Block
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800 mx-0.5 shrink-0" />

        {/* Text Formatting: Bold, Italic, Underline, Strike */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("bold");
          }}
          className={btnClass(activeFormats.bold)}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("italic");
          }}
          className={btnClass(activeFormats.italic)}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("underline");
          }}
          className={btnClass(activeFormats.underline)}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("strikeThrough");
          }}
          className={btnClass(activeFormats.strikeThrough)}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        {/* Subscript & Superscript (Crucial for Economics!) */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("subscript");
          }}
          className={btnClass(activeFormats.subscript)}
          title="Subscript (e.g. Qd, P1)"
        >
          <Subscript className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("superscript");
          }}
          className={btnClass(activeFormats.superscript)}
          title="Superscript (e.g. R², K^α)"
        >
          <Superscript className="w-3.5 h-3.5" />
        </button>

        {/* Highlighter Tool */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleHighlight();
          }}
          className={btnClass(false)}
          title="Highlight Key Points"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-500" />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800 mx-0.5 shrink-0" />

        {/* Alignment Controls */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("justifyLeft");
          }}
          className={btnClass(activeFormats.justifyLeft)}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("justifyCenter");
          }}
          className={btnClass(activeFormats.justifyCenter)}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("justifyRight");
          }}
          className={btnClass(activeFormats.justifyRight)}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("justifyFull");
          }}
          className={btnClass(activeFormats.justifyFull)}
          title="Justify Text"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800 mx-0.5 shrink-0" />

        {/* Bullet and Numbered Lists */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertUnorderedList");
          }}
          className={btnClass(activeFormats.unorderedList)}
          title="Bulleted List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertOrderedList");
          }}
          className={btnClass(activeFormats.orderedList)}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800 mx-0.5 shrink-0" />

        {/* Insert Table Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowTableMenu(!showTableMenu);
              setShowEquationMenu(false);
              setShowStyleMenu(false);
            }}
            className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
            title="Insert Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Table</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showTableMenu && (
            <div className="absolute top-8 left-0 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl p-1.5 w-44 space-y-0.5 animate-in fade-in slide-in-from-top-1">
              <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase px-2 py-1">Grid Size</div>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertTable(2, 2);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                2 × 2 Comparison
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertTable(3, 3);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                3 × 3 Data Matrix
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertTable(4, 3);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                4 × 3 Table
              </button>
            </div>
          )}
        </div>

        {/* Insert Formula Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setShowEquationMenu(!showEquationMenu);
              setShowTableMenu(false);
              setShowStyleMenu(false);
            }}
            className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
            title="Insert Economic Formula"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-xs">Formula</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showEquationMenu && (
            <div className="absolute top-8 left-0 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl p-1.5 w-64 space-y-0.5 animate-in fade-in slide-in-from-top-1">
              <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase px-2 py-1">Economic Models</div>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertFormula("Y = C + I + G + NX", "Macro Equilibrium");
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                Macro: Y = C + I + G + NX
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertFormula("M · V = P · Y", "Equation of Exchange");
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                Monetary: M · V = P · Y
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertFormula("Ed = (%ΔQd) / (%ΔP) = (dQ/dP) · (P/Q)", "Price Elasticity");
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                Micro: Elasticity of Demand
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertFormula("MUx / Px = MUy / Py", "Consumer Optimum");
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 cursor-pointer"
              >
                Micro: Consumer Equilibrium
              </button>
            </div>
          )}
        </div>

        {/* Divider Rule */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertHorizontalRule");
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer hidden md:flex shrink-0"
          title="Insert Horizontal Divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1" />

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer shrink-0"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ================= CLEAN WRITING CANVAS ================= */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir="auto"
        spellCheck={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        onBlur={saveSelection}
        className={`p-5 sm:p-7 flex-1 outline-none text-sm sm:text-base leading-relaxed focus:outline-none overflow-y-auto prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 dark:empty:before:text-neutral-500 empty:before:pointer-events-none ${
          isFullscreen ? "min-h-[75vh]" : "min-h-[260px]"
        }`}
        style={{
          fontFamily: "inherit",
          lineHeight: "1.75"
        }}
        data-placeholder={placeholder}
      />

      {/* ================= QUIET MINIMAL FOOTER ================= */}
      <div
        className={`px-4 py-2 border-t flex items-center justify-between text-xs text-gray-400 select-none rounded-b-2xl ${
          isDark ? "border-neutral-800 bg-neutral-900/60" : "border-gray-100 bg-gray-50/50"
        }`}
      >
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {lastSavedText}
        </span>
        <span className="text-[11px]">
          {words} {words === 1 ? "word" : "words"} • {chars} {chars === 1 ? "char" : "chars"}
        </span>
      </div>
    </div>
  );
};
/* ========================================================================= */
/* ================= VIEW: INTERACTIVE EXAM TAKING PORTAL ================== */
/* ========================================================================= */

interface ExamTakingPortalProps {
  exam: Exam;
  initialSession?: ExamSessionState | null;
  onExit: () => void;
  onPauseAndExit: (session: ExamSessionState) => void;
  onFinishExam: (result: ExamResult) => void;
  themeColors: any;
  isDark: boolean;
}

const ExamTakingPortal: React.FC<ExamTakingPortalProps> = ({
  exam,
  initialSession,
  onExit,
  onPauseAndExit,
  onFinishExam,
  themeColors,
  isDark
}) => {
  // Use questions from the exam, or empty array
  const questions = exam.questions && exam.questions.length > 0 ? exam.questions : [];
  const { toggleTheme } = useTheme();

  const [currentIdx, setCurrentIdx] = useState(initialSession ? initialSession.currentIdx : 0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialSession ? initialSession.answers : {});
  const [flagged, setFlagged] = useState<Record<string, boolean>>(initialSession ? initialSession.flagged : {});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTimerText, setShowTimerText] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>(
    initialSession ? `Resumed (${initialSession.lastSavedAt})` : "Draft auto-saved"
  );

  // Timer countdown in seconds (from saved session or full duration)
  const [secondsLeft, setSecondsLeft] = useState(
    initialSession && initialSession.secondsLeft > 0
      ? initialSession.secondsLeft
      : exam.durationMinutes * 60
  );

  // Suppress floating docks on document.body during examination
  useEffect(() => {
    document.body.classList.add("in-exam-session");
    return () => {
      document.body.classList.remove("in-exam-session");
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isPaused || showBackModal || showSubmitModal) return;

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
  }, [isPaused, showBackModal, showSubmitModal]);

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] text-center">
        <div className="max-w-md p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Questions Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            This examination paper currently has no questions configured. Please check back later or contact your instructor.
          </p>
          <button
            onClick={onExit}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  const handlePauseAndExit = () => {
    setShowBackModal(false);
    setIsPaused(false);
    const sessionData: ExamSessionState = {
      examId: exam.id,
      secondsLeft,
      answers,
      flagged,
      currentIdx,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    onPauseAndExit(sessionData);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Answer handler
  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val
    }));
    setLastSaved(
      `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
    );
  };

  // Toggle flag
  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] && answers[k].trim() !== ""
  ).length;

  const markedCount = Object.keys(flagged).filter((k) => flagged[k]).length;
  const remainingCount = questions.length - answeredCount;

  // Keyboard navigation shortcuts (A, B, C, D, ArrowLeft, ArrowRight, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (showSubmitModal || showBackModal || isPaused) return;

      const key = e.key.toUpperCase();

      // MCQ selection via keys A, B, C, D
      if (currentQ.type === "mcq" && currentQ.options && ["A", "B", "C", "D"].includes(key)) {
        const matching = currentQ.options.find((o) => o.id === key);
        if (matching) {
          e.preventDefault();
          handleAnswerChange(key);
        }
      }

      // Mark for review toggle via 'M'
      if (key === "M") {
        e.preventDefault();
        toggleFlag();
      }

      // Previous via ArrowLeft
      if (e.key === "ArrowLeft" && currentIdx > 0) {
        e.preventDefault();
        setCurrentIdx((p) => p - 1);
      }

      // Next via ArrowRight
      if (e.key === "ArrowRight" && currentIdx < questions.length - 1) {
        e.preventDefault();
        setCurrentIdx((p) => p + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIdx, currentQ, showSubmitModal, showBackModal, isPaused, questions.length]);

  // Final submit handler
  const handleSubmitFinal = () => {
    setShowSubmitModal(false);
    setShowBackModal(false);

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
        teacherComment: undefined,
        isCorrect
      };
    });

    const newResult: ExamResult = {
      id: generateUUID(),
      examId: exam.id,
      examTitle: exam.title,
      course: exam.course,
      instructor: exam.instructor,
      submittedAt: "Just now",
      status: "under_evaluation",
      totalMarks: exam.totalMarks,
      timeSpentMinutes: Math.max(0, Math.round(((Number(exam.durationMinutes) || 0) * 60 - secondsLeft) / 60)),
      answers: compiledAnswers
    };

    onFinishExam(newResult);
  };

  const isLowTime = secondsLeft < 300; // < 5 mins

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans exam-portal-root select-none">
      {/* ================= 1. PEARSON VUE TOP WORKSTATION APP BAR ================= */}
      <header className="h-14 border-b border-slate-200 dark:border-neutral-800 px-6 flex items-center justify-between bg-white dark:bg-neutral-900 z-20 shrink-0">
        {/* Left: Exit Button + Exam Identification */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowBackModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700/80 transition cursor-pointer shrink-0 shadow-2xs"
            title="Exit examination (Pause or Submit)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Test</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-neutral-800 shrink-0 mx-1" />

          <div className="min-w-0 flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {exam.title}
            </h1>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200/60 dark:border-neutral-700/60 shrink-0">
              {exam.course}
            </span>
          </div>
        </div>

        {/* Center: Monospace Countdown Timer with Pearson VUE Hide/Show toggle */}
        <div className="flex items-center justify-center shrink-0">
          <div
            className={`flex items-center gap-2 px-3.5 py-1 rounded-full font-mono text-xs font-semibold border transition-all ${
              isLowTime
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 animate-pulse shadow-xs"
                : "bg-slate-50 dark:bg-neutral-800/90 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isLowTime ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-neutral-400"}`} />
            
            <span>{showTimerText || isLowTime ? formatTimer(secondsLeft) : "Timer Hidden"}</span>

            {!isLowTime && (
              <button
                type="button"
                onClick={() => setShowTimerText(!showTimerText)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-0.5 cursor-pointer ml-0.5"
                title={showTimerText ? "Hide timer (reduce stress)" : "Show timer"}
              >
                {showTimerText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Pause Test, Submit Examination */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Pause exam & freeze timer"
          >
            <Pause className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
            <span className="hidden sm:inline">Pause</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 shadow-sm transition active:scale-95 cursor-pointer"
          >
            Submit Examination
          </button>
        </div>
      </header>

      {/* Hairline 2px Progress Line */}
      <div className="w-full bg-slate-200 dark:bg-neutral-800 h-0.5 shrink-0">
        <div
          className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
          style={{
            width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`
          }}
        />
      </div>

      {/* ================= 2. MAIN 2-COLUMN WORKSTATION (ZERO DEAD MARGINS) ================= */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* ================= LEFT COLUMN: QUESTION & ANSWER CANVAS (68%) ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800">
          
          {/* Question Subheader Bar */}
          <div className="px-8 py-3.5 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Question {currentQ.number} of {questions.length}
              </span>
              <span className="text-slate-300 dark:text-neutral-700">•</span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                {currentQ.marks} {currentQ.marks === 1 ? "Mark" : "Marks"}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-50 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-slate-200/60 dark:border-neutral-700">
                {currentQ.type === "mcq" ? "Multiple Choice" : "Descriptive Response"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {currentQ.type === "mcq" && answers[currentQ.id] && (
                <button
                  type="button"
                  onClick={() => handleAnswerChange("")}
                  className="text-xs font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                >
                  Clear response
                </button>
              )}

              <button
                type="button"
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer select-none ${
                  flagged[currentQ.id]
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 border border-transparent"
                }`}
                title="Mark for later review (Press 'M')"
              >
                <Bookmark className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{flagged[currentQ.id] ? "Marked for Review" : "Mark for Review"}</span>
                <span className="hidden lg:inline text-[10px] opacity-40 font-mono">(M)</span>
              </button>
            </div>
          </div>

          {/* Answering Canvas (Centered reading column, no dead space) */}
          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full space-y-7">
              
              {/* Question Statement */}
              <div className="text-lg sm:text-[19px] font-medium leading-relaxed text-slate-900 dark:text-neutral-100 tracking-tight select-text">
                {currentQ.question}
              </div>

              {/* MCQ Options with Tactile Key Badges & Keyboard Shortcuts */}
              {currentQ.type === "mcq" && currentQ.options && (
                <div className="space-y-3 pt-1">
                  {currentQ.options.map((option) => {
                    const isSelected = answers[currentQ.id] === option.id;

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleAnswerChange(option.id)}
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? "border-slate-900 dark:border-white bg-slate-50/90 dark:bg-neutral-800/80 shadow-xs ring-1 ring-slate-900/10 dark:ring-white/20"
                            : "border-slate-200/90 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 hover:bg-slate-50/40 dark:hover:bg-neutral-800/30 bg-white dark:bg-neutral-900"
                        }`}
                      >
                        {/* Tactile Keyboard Key Badge */}
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white dark:bg-white dark:text-neutral-900 border-slate-900 dark:border-white shadow-xs"
                              : "border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 group-hover:bg-slate-100 dark:group-hover:bg-neutral-750"
                          }`}
                        >
                          {option.id}
                        </div>

                        {/* Option Text */}
                        <div className={`text-[15px] sm:text-base leading-normal flex-1 ${
                          isSelected
                            ? "font-semibold text-slate-900 dark:text-white"
                            : "font-normal text-slate-800 dark:text-neutral-200"
                        }`}>
                          {option.text}
                        </div>

                        {/* Radio Selector */}
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-2 border-slate-900 dark:border-white"
                              : "border border-slate-300 dark:border-neutral-600"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Descriptive Answer Word Editor */}
              {currentQ.type === "descriptive" && (
                <div className="pt-1">
                  <WordAnswerEditor
                    key={currentQ.id}
                    value={answers[currentQ.id] || ""}
                    onChange={(newVal) => handleAnswerChange(newVal)}
                    lastSavedText={lastSaved}
                    isDark={isDark}
                  />
                </div>
              )}

            </div>
          </div>

          {/* Integrated Bottom Dock */}
          <div className="px-8 py-3.5 border-t border-slate-200/90 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/70 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-750 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <div className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
              Question {currentIdx + 1} of {questions.length}
            </div>

            <button
              type="button"
              onClick={() => {
                if (currentIdx < questions.length - 1) {
                  setCurrentIdx((prev) => prev + 1);
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                currentIdx === questions.length - 1
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900"
              }`}
            >
              <span>{currentIdx === questions.length - 1 ? "Submit Examination" : "Next Question"}</span>
              {currentIdx === questions.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: CONTINUOUS WORKSTATION SIDEBAR (32%) ================= */}
        <div className="w-84 sm:w-88 shrink-0 bg-slate-50 dark:bg-neutral-950 flex flex-col justify-between overflow-y-auto custom-scrollbar border-l border-slate-200/80 dark:border-neutral-800/80">
          
          {/* Top Half of Sidebar: Progress + Matrix */}
          <div className="flex flex-col">
            
            {/* 1. Assessment Overview */}
            <div className="p-5 border-b border-slate-200/80 dark:border-neutral-800/80 space-y-3.5 bg-white/40 dark:bg-neutral-900/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-neutral-200">Assessment Progress</span>
                <span className="font-semibold text-slate-500 dark:text-neutral-400">
                  {answeredCount} of {questions.length} ({Math.round(questions.length > 0 ? (answeredCount / questions.length) * 100 : 0)}%)
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="block text-base font-black text-emerald-700 dark:text-emerald-400">{answeredCount}</span>
                  <span className="text-[10px] font-semibold text-emerald-600/90 dark:text-emerald-400/90 uppercase tracking-wider">Answered</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                  <span className="block text-base font-black text-amber-700 dark:text-amber-400">{markedCount}</span>
                  <span className="text-[10px] font-semibold text-amber-600/90 dark:text-amber-400/90 uppercase tracking-wider">Review</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                  <span className="block text-base font-black text-slate-500 dark:text-neutral-400">{remainingCount}</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Remaining</span>
                </div>
              </div>
            </div>

            {/* 2. Question Palette Grid */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  Question Palette
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {questions.length} Questions
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = answers[q.id] && answers[q.id].trim() !== "";
                  const isFlagged = flagged[q.id];

                  let btnClass = "border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-700";

                  if (isCurrent) {
                    btnClass = "bg-slate-900 text-white dark:bg-white dark:text-neutral-900 font-black ring-2 ring-slate-900/20 dark:ring-white/20 shadow-xs";
                  } else if (isAnswered) {
                    btnClass = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative h-11 rounded-xl text-xs transition cursor-pointer flex items-center justify-center select-none active:scale-95 ${btnClass}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="pt-3 border-t border-slate-200/70 dark:border-neutral-800/80 grid grid-cols-2 gap-2.5 text-[11px] text-slate-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 dark:bg-white" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900" />
                  <span>Unattempted</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Specifications (Anchored) */}
          <div className="p-4 border-t border-slate-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 text-xs text-slate-500 dark:text-neutral-400 space-y-1 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Active
              </span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
              test@test.com
            </div>
            <div className="text-[11px] text-slate-400 dark:text-neutral-500 pt-0.5">
              Passing Benchmark: {exam.passingMarks}/{exam.totalMarks} Marks ({Math.round((exam.passingMarks / exam.totalMarks) * 100)}%)
            </div>
          </div>

        </div>

      </div>

      {/* ================= PRE-SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="rounded-3xl max-w-md w-full p-6 sm:p-7 bg-white dark:bg-neutral-900 shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Submit Examination?
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Please verify your responses before final submission. Once confirmed, your answers will be locked and sent for evaluation.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <span className="block font-medium text-emerald-700 dark:text-emerald-300">Answered</span>
                <span className="text-2xl font-black mt-0.5 block">{answeredCount} of {questions.length}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200">
                <span className="block font-medium text-slate-500 dark:text-neutral-400">Unanswered</span>
                <span className="text-2xl font-black mt-0.5 block">{remainingCount} Remaining</span>
              </div>
            </div>

            {remainingCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 border border-amber-200 dark:border-amber-900/50">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>You have {remainingCount} unanswered questions remaining.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 shadow-md transition active:scale-95 cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LEAVE EXAM (BACK BUTTON) MODAL ================= */}
      {showBackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="rounded-3xl max-w-sm w-full p-6 bg-white dark:bg-neutral-900 shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Exit Examination?
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Choose how you would like to proceed:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBackModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePauseAndExit}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-black dark:hover:bg-neutral-100 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause & Resume Later</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBackModal(false);
                  handleSubmitFinal();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit & End Test Now</span>
              </button>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowBackModal(false)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Cancel and return to exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXAM PAUSED OVERLAY MODAL ================= */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="rounded-3xl max-w-md w-full p-6 sm:p-7 bg-white dark:bg-neutral-900 shadow-2xl border border-slate-200 dark:border-neutral-800 text-center space-y-5">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300">
              <Pause className="w-5 h-5 fill-current" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Examination Paused
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Your countdown timer is paused and all responses are preserved in memory.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700/60">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">Frozen Timer</span>
                <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {formatTimer(secondsLeft)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700/60">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">Attempted</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {answeredCount} / {questions.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePauseAndExit}
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition cursor-pointer"
              >
                Pause & Exit to Catalog
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume Exam
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
  onSimulateReview?: (resultId: string) => void;
  themeColors: any;
  isDark: boolean;
  studentName?: string;
  studentEmail?: string;
  getFormattedCourseTitle?: (courseName?: string, targetId?: string, studentName?: string) => { label: string; title: string };
}

const DetailedReportCardModal: React.FC<DetailedReportCardModalProps> = ({
  result,
  onClose,
  onSimulateReview,
  themeColors,
  isDark,
  studentName,
  studentEmail,
  getFormattedCourseTitle
}) => {
  const courseInfo = getFormattedCourseTitle
    ? getFormattedCourseTitle(result.course, result.id || result.examId, result.studentName || studentName)
    : (() => {
        const raw = (result.course || "").trim();
        if (/^1-on-1/i.test(raw) || raw.toLowerCase().includes("1-on-1")) {
          const match = raw.match(/^1-on-1\s*[:\-–]?\s*(.*)$/i);
          const namePart = (match && match[1] ? match[1].trim() : "") || (result.studentName || studentName || "");
          return { label: "Assessment", title: namePart ? `Assessment #1: ${namePart}` : "Assessment #1" };
        }
        return { label: raw.startsWith("Assessment #") ? "Assessment" : "Course", title: raw || "General Examination" };
      })();
  const [filterType, setFilterType] = useState<"all" | "mcq" | "descriptive">("all");
  const isUnderEvaluation = result.status === "under_evaluation";

  const answersList = result.answers || [];
  const mcqQuestions = answersList.filter((a) => a.type === "mcq");
  const descriptiveQuestions = answersList.filter((a) => a.type === "descriptive");

  const hasMcqs = mcqQuestions.length > 0;
  const hasDescriptive = descriptiveQuestions.length > 0;

  const mcqTotal = mcqQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
  const mcqAwarded = mcqQuestions.reduce((acc, q) => {
    if (q.marksAwarded !== undefined) return acc + Number(q.marksAwarded);
    return acc + (q.isCorrect ? (Number(q.marks) || 0) : 0);
  }, 0);
  const mcqAccuracy = mcqTotal > 0 ? Math.round((mcqAwarded / mcqTotal) * 100) : 0;

  const descTotal = descriptiveQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
  const descAwarded = descriptiveQuestions.reduce((acc, q) => acc + (Number(q.marksAwarded) || 0), 0);

  const displayedAnswers = answersList.filter((a) => {
    if (filterType === "all") return true;
    return a.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col"
        style={{ backgroundColor: themeColors.background.white }}
      >
        {/* Sticky Header */}
        <div
          className="sticky top-0 border-b border-gray-100 dark:border-neutral-800 p-5 sm:p-6 flex items-center justify-between z-10 shadow-sm"
          style={{ backgroundColor: themeColors.background.white }}
        >
          <div>
            <span
              className="text-xs font-bold uppercase px-2.5 py-0.5 rounded shadow-xs"
              style={{
                backgroundColor: isUnderEvaluation ? themeColors.accent.yellow : themeColors.accent.green,
                color: "#000000"
              }}
            >
              {isUnderEvaluation ? "Waiting for Teacher's Feedback" : "Academic Assessment Report Card"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1" style={{ color: themeColors.text.primary }}>
              {result.examTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isUnderEvaluation && (
              <button
                type="button"
                onClick={() => downloadReportCard({ ...result, course: courseInfo.title }, { studentName: result.studentName || studentName, studentEmail: result.studentEmail || studentEmail })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                title="Download / Print Official DE-ECO Report Card"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
                <span className="sm:hidden">Download Report</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              style={{ color: themeColors.text.primary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* ================= HERO SCORE BANNER ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Massive Score Block / Under Evaluation Block */}
            {isUnderEvaluation ? (
              <div
                className="md:col-span-1 p-6 rounded-2xl shadow-md flex flex-col justify-between"
                style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block text-gray-900">
                    Evaluation Status
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-7 h-7 text-black shrink-0" />
                    <span className="text-2xl font-black text-black">Awaiting Review</span>
                  </div>
                  <p className="text-xs text-gray-800 mt-2 font-medium leading-relaxed">
                    {result.instructor || 'Teacher'} is evaluating your descriptive responses.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-black/15 flex items-center justify-between text-xs font-bold">
                  <span className="px-3 py-1 rounded-full bg-white shadow-xs text-black">
                    Submitted: {result.submittedAt}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="md:col-span-1 p-6 rounded-2xl shadow-md flex flex-col justify-between"
                style={{ backgroundColor: themeColors.accent.blue, color: "#000000" }}
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block text-gray-800">
                    Total Score Obtained
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-5xl font-black">{result.scoreObtained}</span>
                    <span className="text-2xl font-bold text-gray-700">/{result.totalMarks}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/15 flex items-center justify-between text-xs font-bold">
                  <span className="px-3 py-1 rounded-full bg-white shadow-xs">
                    {result.percentage}% Marks
                  </span>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">{courseInfo.label}</span>
                <span className="font-bold text-sm block truncate" style={{ color: themeColors.text.primary }}>
                  {courseInfo.title}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">Evaluated By</span>
                <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: themeColors.text.primary }}>
                  <UserCheck className="w-4 h-4 text-emerald-600" /> {result.instructor || 'Faculty'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">Time Taken</span>
                <span className="font-bold text-sm flex items-center gap-1" style={{ color: themeColors.text.primary }}>
                  <Clock className="w-4 h-4 text-indigo-500" /> {
                    result.timeSpentMinutes > 1
                      ? `${result.timeSpentMinutes} Mins`
                      : result.timeSpentMinutes === 1
                      ? '1 Min'
                      : '< 1 Min'
                  }
                </span>
              </div>

              {hasMcqs && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60">
                  <span className="text-xs text-gray-500 font-bold block">MCQ Section</span>
                  <span className="font-bold text-sm text-emerald-600">
                    {isUnderEvaluation ? "Submitted" : `${mcqAccuracy}% Accuracy (${mcqAwarded}/${mcqTotal} Marks)`}
                  </span>
                </div>
              )}

              {hasDescriptive && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60">
                  <span className="text-xs text-gray-500 font-bold block">Descriptive Responses</span>
                  <span className="font-bold text-sm text-indigo-600">
                    {isUnderEvaluation ? "Under Review" : `${descAwarded} / ${descTotal} Marks`}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700/60">
                <span className="text-xs text-gray-500 font-bold block">Total Questions</span>
                <span className="font-bold text-sm" style={{ color: themeColors.text.primary }}>
                  {answersList.length} Questions
                </span>
              </div>
            </div>
          </div>

          {/* ================= INSTRUCTOR RISHIKA'S HIGHLIGHTED FEEDBACK BOX ================= */}
          {isUnderEvaluation ? (
            <div
              className="rounded-2xl p-6 sm:p-7 shadow-md space-y-3"
              style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-black/15">
                <h4 className="font-bold text-lg flex items-center gap-2 text-black">
                  <Clock className="w-5 h-5 text-black" /> Waiting for Teacher's Feedback
                </h4>
              </div>
              <p className="text-sm font-medium leading-relaxed text-gray-900">
                Descriptive responses are evaluated with personalized feedback. Once grading completes, your full report card, marks breakdown, and personalized feedback will be published here.
              </p>
            </div>
          ) : (result.teacherFeedback && (
            (result.teacherFeedback.overall && result.teacherFeedback.overall.trim() !== '') ||
            (Array.isArray(result.teacherFeedback.strengths) && result.teacherFeedback.strengths.length > 0) ||
            (Array.isArray(result.teacherFeedback.improvements) && result.teacherFeedback.improvements.length > 0)
          )) && (
            <div
              className="rounded-2xl p-6 sm:p-7 shadow-md space-y-4"
              style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-black/15">
                <h4 className="font-bold text-lg flex items-center gap-2 text-black">
                  <MessageSquare className="w-5 h-5 text-black" /> Feedback
                </h4>
                {result.teacherFeedback.evaluatedAt && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white shadow-xs">
                    {result.teacherFeedback.evaluatedAt}
                  </span>
                )}
              </div>

              {/* Overall Feedback Commentary Quote */}
              {result.teacherFeedback.overall && result.teacherFeedback.overall.trim() !== '' && (
                <div className="p-4 rounded-xl bg-white text-black font-serif italic text-sm sm:text-base leading-relaxed shadow-xs">
                  "{result.teacherFeedback.overall}"
                </div>
              )}

              {/* Strengths & Improvements */}
              {((Array.isArray(result.teacherFeedback.strengths) && result.teacherFeedback.strengths.length > 0) ||
                (Array.isArray(result.teacherFeedback.improvements) && result.teacherFeedback.improvements.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Strengths Card */}
                  {Array.isArray(result.teacherFeedback.strengths) && result.teacherFeedback.strengths.length > 0 && (
                    <div
                      className="p-4 rounded-xl shadow-xs space-y-2"
                      style={{ backgroundColor: themeColors.accent.green, color: "#000000" }}
                    >
                      <span className="text-xs font-bold uppercase flex items-center gap-1.5 text-black">
                        <ThumbsUp className="w-4 h-4 text-black" /> Key Strengths Noted:
                      </span>
                      <ul className="text-xs text-black font-medium space-y-1.5 list-disc list-inside">
                        {result.teacherFeedback.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements Card */}
                  {Array.isArray(result.teacherFeedback.improvements) && result.teacherFeedback.improvements.length > 0 && (
                    <div
                      className="p-4 rounded-xl shadow-xs space-y-2"
                      style={{ backgroundColor: themeColors.accent.red, color: "#000000" }}
                    >
                      <span className="text-xs font-bold uppercase flex items-center gap-1.5 text-black">
                        <Flame className="w-4 h-4 text-black" /> High-Impact Action Items:
                      </span>
                      <ul className="text-xs text-black font-medium space-y-1.5 list-disc list-inside">
                        {result.teacherFeedback.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= QUESTION-BY-QUESTION BREAKDOWN ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-xl" style={{ color: themeColors.text.primary }}>
                Question-by-Question Breakdown
              </h4>

              {/* Filter Tabs - Only show when both types exist */}
              {hasMcqs && hasDescriptive && (
                <div className="flex items-center gap-1.5 p-1 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-bold bg-white dark:bg-black">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterType === "all" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500"
                    }`}
                  >
                    All ({answersList.length})
                  </button>
                  <button
                    onClick={() => setFilterType("mcq")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterType === "mcq" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500"
                    }`}
                  >
                    MCQs ({mcqQuestions.length})
                  </button>
                  <button
                    onClick={() => setFilterType("descriptive")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterType === "descriptive" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500"
                    }`}
                  >
                    Descriptive ({descriptiveQuestions.length})
                  </button>
                </div>
              )}
            </div>

            {/* Answer List */}
            {displayedAnswers.map((ans) => (
              <div
                key={ans.questionId}
                className="p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4"
                style={{ backgroundColor: themeColors.background.white }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded shadow-xs"
                      style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
                    >
                      Q{ans.questionNumber}
                    </span>
                    <span className="text-xs font-medium uppercase text-gray-500">
                      {ans.type === "mcq" ? "Multiple Choice" : "Descriptive Response"}
                    </span>
                  </div>

                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full shadow-xs"
                    style={{
                      backgroundColor:
                        isUnderEvaluation && ans.type === "descriptive"
                          ? themeColors.accent.yellow
                          : themeColors.accent.green,
                      color: "#000000"
                    }}
                  >
                    {isUnderEvaluation && ans.type === "descriptive"
                      ? "Pending Evaluation"
                      : `${ans.marksAwarded ?? 0} / ${ans.marks} Marks`}
                  </span>
                </div>

                <p className="font-bold text-sm sm:text-base" style={{ color: themeColors.text.primary }}>
                  {ans.question}
                </p>

                {/* For MCQ */}
                {ans.type === "mcq" && (
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Your Response:</span>
                      <span
                        className="font-bold px-2.5 py-0.5 rounded text-xs shadow-xs"
                        style={{ backgroundColor: themeColors.accent.green, color: "#000000" }}
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
                      <span className="text-gray-500 text-xs font-bold block mb-1">
                        Your Submitted Response:
                      </span>
                      {ans.studentAnswer ? (
                        <div
                          className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 text-xs leading-relaxed prose dark:prose-invert max-w-none overflow-x-auto"
                          style={{ color: themeColors.text.primary }}
                          dangerouslySetInnerHTML={{ __html: ans.studentAnswer }}
                        />
                      ) : (
                        <p
                          className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 text-xs leading-relaxed italic text-gray-400"
                          style={{ color: themeColors.text.secondary }}
                        >
                          (No answer submitted)
                        </p>
                      )}
                    </div>

                    {isUnderEvaluation ? (
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Feedback & marks will be published upon review.</span>
                      </div>
                    ) : ans.teacherComment && (
                      <div
                        className="p-4 rounded-xl text-xs shadow-xs space-y-1"
                        style={{ backgroundColor: themeColors.accent.yellow, color: "#000000" }}
                      >
                        <strong className="block font-bold uppercase text-black flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-black" /> Feedback:
                        </strong>
                        <p className="font-serif italic text-black leading-relaxed">
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
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            {!isUnderEvaluation ? (
              <button
                type="button"
                onClick={() => downloadReportCard({ ...result, course: courseInfo.title }, { studentName: result.studentName || studentName, studentEmail: result.studentEmail || studentEmail })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            ) : <div />}
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
