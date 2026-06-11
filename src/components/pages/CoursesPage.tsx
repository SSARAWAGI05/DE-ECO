import React, { useEffect, useState } from 'react';
import {
  Star,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Eye,
  Calendar,
  Phone,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../styles/colors';
import { supabase } from "../../lib/supabaseClient";

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  duration_weeks: number | null;
  thumbnail_url: string | null;
  enrollment_deadline?: string;

  // NEW (jsonb)
  what_you_learn?: unknown;
  prerequisites?: unknown;

  // NEW
  price?: number;
  instructor_name?: string;
}

interface CoursesPageProps {
  onPageChange: (page: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onPageChange }) => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isComingSoon, setIsComingSoon] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'explore' | 'my-learning'>('explore');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const coursesPerPage = 6;
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  
  const enrolledCoursesList = courses.filter(c => enrolledCourseIds.has(c.id));

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedLevel]);

  useEffect(() => {
    const savedCourseId = localStorage.getItem('selectedCourseId');
    if (savedCourseId) {
      setSelectedCourseId(savedCourseId);
      localStorage.removeItem('selectedCourseId');
    }

    const savedTab = localStorage.getItem('coursesTab');
    if (savedTab === 'my-learning') {
      setActiveTab('my-learning');
      localStorage.removeItem('coursesTab');
    }
  }, []);

  // Helper function to format deadline
  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to check if enrollment is still open
  const isEnrollmentOpen = (deadline: string | undefined) => {
    if (!deadline) return true;
    return new Date(deadline) > new Date();
  };

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      // select specific columns instead of '*' for safety
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          level,
          duration_weeks,
          thumbnail_url,
          enrollment_deadline,
          what_you_learn,
          prerequisites,
          price,
          instructor_name,
          is_active,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    };

    const fetchEnrollments = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', authData.user.id);

      if (!error && data) {
        const ids = new Set(data.map((d: any) => d.course_id));
        setEnrolledCourseIds(ids as Set<string>);
      }
    };

    fetchCourses();
    fetchEnrollments();
  }, []);

  /* ================= ENROLL ================= */
  const enrollInCourse = async (courseId: string) => {
    // Show contact information instead of direct enrollment
    const phoneNumber = '+91 9903996663';
    const message = `To enroll in this course, please contact us at:\n\n📞 ${phoneNumber}\n\nClick OK to copy the number to your clipboard.`;
    
    // Insert a lightweight enrollment/contact record when possible (keeps backend aware)
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        // best-effort insert (if DB has constraint to prevent duplicates, DB will handle it)
        await supabase.from('course_enrollments').insert({
          course_id: courseId,
          user_id: user.id,
          status: 'contacted',
          enrolled_at: new Date().toISOString()
        });
      }
    } catch (e) {
      // silent - keep UX identical even if DB write fails
      // console.warn('enroll record failed', e);
    }

    if (window.confirm(message)) {
      // Copy phone number to clipboard
      navigator.clipboard.writeText(phoneNumber).then(() => {
        alert('Phone number copied to clipboard!');
      }).catch(() => {
        alert(`Please contact: ${phoneNumber}`);
      });
    }
  };

  /* ================= VIEW DETAILS ================= */
  const viewCourseDetails = (courseId: string) => {
    // Navigate to course detail page
    // Option 1: Using state (if you want to show details in the same component)
    setSelectedCourseId(courseId);
    
    // Option 2: Using React Router (if you have it set up)
    // navigate(`/courses/${courseId}`);
    
    // Option 3: Open in new window
    // window.open(`/courses/${courseId}`, '_blank');
  };

  const getCurrentCourses = () => {
    const start = currentPage * coursesPerPage;
    return filteredCourses.slice(start, start + coursesPerPage);
  };

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return themeColors.accent.green;
      case 'intermediate':
        return themeColors.accent.yellow;
      case 'advanced':
        return themeColors.accent.red;
      default:
        return themeColors.accent.orange;
    }
  };

  // If a course is selected, show the detail page
  // If a course is selected, show the detail page
  if (selectedCourseId) {
    return (
      <CourseDetailPage
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
        formatDeadline={formatDeadline}
        isEnrollmentOpen={isEnrollmentOpen}
        onPageChange={onPageChange}   // 👈 ADD HERE
      />
    );
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div
        style={{ backgroundColor: themeColors.primary.lightGray }}
        className="min-h-screen"
      >
        <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-8 sm:pb-12">

          {/* HEADER */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
              Explore Our Courses
            </h1>
            <p className="text-base" style={{ color: themeColors.text.secondary }}>
              Learn industry-ready skills from expert-designed programs
            </p>
          </div>

          {/* STATS BAR */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: themeColors.accent.blue }}>
              <div className="text-2xl font-bold" style={{ color: themeColors.primary.w2 }}>{courses.length}</div>
              <div className="text-sm" style={{ color: themeColors.primary.w2 }}>Courses Available</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: themeColors.accent.yellow }}>
              <div 
                className="text-2xl font-bold"
                style={{ color: themeColors.primary.w2 }} 
              >Live</div>
              <div className="text-sm" style={{ color: themeColors.primary.w2 }}>Expert Led</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: themeColors.accent.red }}>
              <div className="text-2xl font-bold" style={{ color: themeColors.primary.w2 }}>4.8</div>
              <div className="text-sm" style={{ color: themeColors.primary.w2 }}>Avg Rating</div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-full p-1 border-2 shadow-sm" style={{ backgroundColor: themeColors.primary.w, borderColor: themeColors.primary.w2 }}>
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-6 sm:px-10 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'explore' ? 'shadow-md' : 'opacity-60 hover:opacity-100'}`}
                style={activeTab === 'explore' ? { backgroundColor: themeColors.primary.w2, color: themeColors.primary.w } : { color: themeColors.text.primary }}
              >
                Explore Courses
              </button>
              <button
                onClick={() => setActiveTab('my-learning')}
                className={`px-6 sm:px-10 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'my-learning' ? 'shadow-md' : 'opacity-60 hover:opacity-100'}`}
                style={activeTab === 'my-learning' ? { backgroundColor: themeColors.primary.w2, color: themeColors.primary.w } : { color: themeColors.text.primary }}
              >
                My Learning
              </button>
            </div>
          </div>

          {activeTab === 'explore' ? (
            <>
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition focus:ring-2"
                style={{ 
                  backgroundColor: themeColors.background.white,
                  borderColor: themeColors.primary.black,
                  color: themeColors.text.primary,
                }}
              />
            </div>
            
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3 rounded-xl border-2 outline-none transition focus:ring-2 cursor-pointer font-semibold"
                style={{ 
                  backgroundColor: themeColors.background.white,
                  borderColor: themeColors.primary.black,
                  color: themeColors.text.primary,
                }}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* COURSE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentCourses().map(course => (
            <div
              key={course.id}
              className="rounded-2xl p-4 shadow-lg hover:scale-105 transition flex flex-col"
              style={{ backgroundColor: themeColors.background.white }}
            >
              {/* IMAGE (no fixed height - image defines height) */}
              <div
                className="h-48 rounded-xl relative cursor-pointer overflow-hidden bg-slate-100 flex items-center justify-center"
                onClick={() => viewCourseDetails(course.id)}
              >
                <img
                  src={course.thumbnail_url || "/logo/De-Eco-logo.png"}
                  alt={course.title}
                  className={course.thumbnail_url ? "w-full h-full object-cover" : "w-1/2 h-1/2 object-contain"}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/De-Eco-logo.png'; (e.currentTarget as HTMLImageElement).className = "w-1/2 h-1/2 object-contain"; }}
                />
              </div>

              {/* CONTENT - make this grow so buttons sit at bottom */}
              <div className="mt-4 flex-1 flex flex-col">
                <div>
                  <h3 className="font-bold mb-2" style={{ color: themeColors.text.primary }}>
                    {course.title}
                  </h3>

                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration_weeks ? `${course.duration_weeks} weeks` : 'Flexible'}
                    </span>
                    {enrolledCourseIds.has(course.id) && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: themeColors.status.success + '20', color: themeColors.status.success }}>
                        <CheckCircle className="w-3 h-3" /> ENROLLED
                      </span>
                    )}
                  </div>

                  {/* ENROLLMENT DEADLINE */}
                  {course.enrollment_deadline && (
                    <div 
                      className="mb-3 p-2 rounded-lg text-xs font-semibold flex items-center gap-2"
                      style={{ 
                        backgroundColor: isEnrollmentOpen(course.enrollment_deadline) 
                          ? themeColors.accent.yellow + '20' 
                          : themeColors.accent.red + '20',
                        color: isEnrollmentOpen(course.enrollment_deadline)
                          ? themeColors.accent.yellow
                          : themeColors.accent.red
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      {isEnrollmentOpen(course.enrollment_deadline) 
                        ? `Deadline: ${formatDeadline(course.enrollment_deadline)}`
                        : 'Enrollment Closed'}
                    </div>
                  )}
                </div>

                {/* TWO BUTTONS — pinned at the bottom of the card */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => viewCourseDetails(course.id)}
                    className="flex-1 py-2 rounded-lg font-bold transition hover:scale-105 flex items-center justify-center gap-2"
                    style={{ 
                      backgroundColor: themeColors.primary.w, 
                      color: themeColors.primary.w2,
                      border: `2px solid ${themeColors.primary.w2}`
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {enrolledCourseIds.has(course.id) ? (
                    <button
                      onClick={() => viewCourseDetails(course.id)}
                      className="flex-1 py-2 rounded-lg font-bold transition hover:scale-105 flex items-center justify-center gap-1"
                      style={{ 
                        backgroundColor: themeColors.status.success, 
                        color: '#ffffff' 
                      }}
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={() => enrollInCourse(course.id)}
                      disabled={!isEnrollmentOpen(course.enrollment_deadline)}
                      className="flex-1 py-2 rounded-lg font-bold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      style={{ 
                        backgroundColor: themeColors.primary.w2, 
                        color: themeColors.primary.w 
                      }}
                    >
                      <Phone className="w-3 h-3" />
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-bold mb-2" style={{ color: themeColors.text.primary }}>No courses found</h3>
              <p style={{ color: themeColors.text.secondary }}>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}

          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: themeColors.accent.blue }}
              >
                <ChevronLeft />
              </button>

              <span className="flex items-center font-semibold">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: themeColors.accent.blue }}
              >
                <ChevronRight />
              </button>
            </div>
          )}
            </>
          ) : (
            <>
              {/* MY LEARNING GRID */}
              {enrolledCoursesList.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border-2 border-dashed" style={{ backgroundColor: themeColors.primary.w, borderColor: themeColors.primary.w2 }}>
                  <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Star className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: themeColors.text.primary }}>No Enrolled Courses Yet</h3>
                  <p className="text-lg mb-8" style={{ color: themeColors.text.secondary }}>You haven't started your learning journey yet. Explore our courses and find the perfect fit!</p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
                    style={{ backgroundColor: themeColors.primary.w2, color: themeColors.primary.w }}
                  >
                    Explore Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCoursesList.map(course => (
                    <div
                      key={`enrolled-${course.id}`}
                      className="rounded-2xl p-4 shadow-lg hover:scale-105 transition flex flex-col border-2"
                      style={{ backgroundColor: themeColors.background.white, borderColor: themeColors.accent.green }}
                    >
                      <div
                        className="h-48 rounded-xl relative cursor-pointer overflow-hidden bg-slate-100 flex items-center justify-center"
                        onClick={() => viewCourseDetails(course.id)}
                      >
                        <img
                          src={course.thumbnail_url || "/logo/De-Eco-logo.png"}
                          alt={course.title}
                          className={course.thumbnail_url ? "w-full h-full object-cover" : "w-1/2 h-1/2 object-contain"}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/De-Eco-logo.png'; (e.currentTarget as HTMLImageElement).className = "w-1/2 h-1/2 object-contain"; }}
                        />
                        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full shadow text-xs font-bold flex items-center gap-2" style={{ color: themeColors.status.success }}>
                          <CheckCircle className="w-4 h-4" /> Enrolled
                        </div>
                      </div>

                      <div className="mt-4 flex-1 flex flex-col">
                        <h3 className="font-bold mb-2 text-lg" style={{ color: themeColors.text.primary }}>
                          {course.title}
                        </h3>
                        <p className="text-sm opacity-80 mb-6 line-clamp-2" style={{ color: themeColors.text.secondary }}>
                          {course.description}
                        </p>

                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => viewCourseDetails(course.id)}
                            className="flex-1 py-3 rounded-lg font-bold transition hover:scale-105 flex items-center justify-center gap-2 border-2"
                            style={{ 
                              backgroundColor: themeColors.primary.w, 
                              color: themeColors.primary.w2,
                              borderColor: themeColors.primary.w2
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
      {isComingSoon && (
      <div className="fixed inset-0 z-40 flex items-center justify-center">

        {/* Blur layer */}
        <div className="absolute inset-0 backdrop-blur-md bg-white/70 dark:bg-black/70"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4"
            style={{ color: themeColors.text.primary }}
          >
            🚀 Coming Soon
          </h1>

          <p
            className="text-base sm:text-lg max-w-md mx-auto"
            style={{ color: themeColors.text.secondary }}
          >
            Courses are currently under preparation.  
            We’re launching them very soon ✨
          </p>
        </div>

      </div>
    )}
    </div>
  );
};

const safeArray = (value: unknown): string[] => {
  return Array.isArray(value) ? value : [];
};


/* ================= COURSE DETAIL PAGE COMPONENT ================= */
interface CourseDetailPageProps {
  courseId: string;
  onBack: () => void;
  formatDeadline: (deadline: string | undefined) => string | null;
  isEnrollmentOpen: (deadline: string | undefined) => boolean;
  onPageChange?: (page: string) => void; // 👈 ADD THIS
}


const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ 
  courseId, 
  onBack, 
  formatDeadline, 
  isEnrollmentOpen,
  onPageChange
}) => {

  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      // select specific columns including JSONB and metadata
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          level,
          duration_weeks,
          thumbnail_url,
          enrollment_deadline,
          what_you_learn,
          prerequisites,
          price,
          instructor_name
        `)
        .eq('id', courseId)
        .single();

      if (!error && data) {
        setCourse(data);
      }
      setLoading(false);
    };

    fetchCourseDetails();
  }, [courseId]);

  const enrollInCourse = async () => {
    // Show contact information instead of direct enrollment
    const phoneNumber = '+91 9903996663';
    const message = `To enroll in this course, please contact us at:\n\n📞 ${phoneNumber}\n\nClick OK to copy the number to your clipboard.`;
    
    // Insert enrollment/contact record (best-effort)
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user && course) {
        await supabase.from('course_enrollments').insert({
          course_id: course.id,
          user_id: user.id,
          status: 'contacted',
          enrolled_at: new Date().toISOString()
        });
      }
    } catch (e) {
      // silent: don't break UX if DB write fails
      // console.warn('enroll record failed', e);
    }

    if (window.confirm(message)) {
      // Copy phone number to clipboard
      navigator.clipboard.writeText(phoneNumber).then(() => {
        alert('Phone number copied to clipboard!');
      }).catch(() => {
        alert(`Please contact: ${phoneNumber}`);
      });
    }
  };

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return themeColors.accent.green;
      case 'intermediate':
        return themeColors.accent.yellow;
      case 'advanced':
        return themeColors.accent.red;
      default:
        return themeColors.accent.orange;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">Loading course details...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">Course not found</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.primary.lightGray }}>
      <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-8 sm:pb-12">
        
        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-semibold hover:scale-105 transition"
          style={{ backgroundColor: themeColors.accent.blue, color: themeColors.primary.w2 }}
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Courses
        </button>

        {/* COURSE HEADER */}
        <div className="rounded-2xl p-6 sm:p-8 shadow-lg mb-6" style={{ backgroundColor: themeColors.background.white }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT - IMAGE */}
            <div className="rounded-xl relative bg-slate-100 flex items-center justify-center aspect-video overflow-hidden">
              <img
                src={course.thumbnail_url || "/logo/De-Eco-logo.png"}
                alt={course.title}
                className={course.thumbnail_url ? "w-full h-full object-cover rounded-xl" : "w-1/2 h-1/2 object-contain"}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/De-Eco-logo.png'; (e.currentTarget as HTMLImageElement).className = "w-1/2 h-1/2 object-contain"; }}
              />
            </div>



            {/* RIGHT - INFO */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  {course.title}
                </h1>
                {course.instructor_name && (
                  <p
                    className="text-sm mb-4 flex items-center gap-2"
                    style={{ color: themeColors.text.secondary }}
                  >
                    <Users
                      className="w-4 h-4"
                      style={{ color: themeColors.accent.blue }}
                    />
                    <strong>Instructor:</strong> {course.instructor_name}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: themeColors.accent.blue }} />
                    <span style={{ color: themeColors.text.secondary }}>
                      {course.duration_weeks ? `${course.duration_weeks} weeks` : 'Flexible Duration'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: themeColors.accent.blue }} />
                    <span style={{ color: themeColors.text.secondary }}>500+ Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-current" style={{ color: themeColors.accent.yellow }} />
                    <span style={{ color: themeColors.text.secondary }}>4.8 Rating</span>
                  </div>
                </div>

                {/* ENROLLMENT DEADLINE */}
                {course.enrollment_deadline && (
                  <div 
                    className="mb-4 p-3 rounded-lg flex items-center gap-3"
                    style={{ 
                      backgroundColor: isEnrollmentOpen(course.enrollment_deadline) 
                        ? themeColors.accent.yellow + '20' 
                        : themeColors.accent.red + '20',
                      border: `2px solid ${isEnrollmentOpen(course.enrollment_deadline) 
                        ? themeColors.accent.yellow 
                        : themeColors.accent.red}`
                    }}
                  >
                    <Calendar className="w-5 h-5" style={{ 
                      color: isEnrollmentOpen(course.enrollment_deadline)
                        ? themeColors.accent.yellow
                        : themeColors.accent.red
                    }} />
                    <div>
                      <div className="font-semibold text-sm" style={{ 
                        color: isEnrollmentOpen(course.enrollment_deadline)
                          ? themeColors.accent.yellow
                          : themeColors.accent.red
                      }}>
                        {isEnrollmentOpen(course.enrollment_deadline) 
                          ? 'Enrollment Deadline'
                          : 'Enrollment Closed'}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                        {formatDeadline(course.enrollment_deadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {course.price && (
                <div className="mb-4">
                  <p
                    className="text-3xl font-bold"
                    style={{ color: themeColors.text.primary }}
                  >
                    ₹{course.price.toLocaleString('en-IN')}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    One-time payment
                  </p>
                </div>
              )}

              <div className="mt-4">
                <div 
                  className="mb-4 p-4 rounded-lg"
                  style={{ 
                    backgroundColor: themeColors.accent.blue + '20',
                    border: `2px solid ${themeColors.accent.blue}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5" style={{ color: themeColors.accent.blue }} />
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                      Contact for Enrollment
                    </span>
                  </div>
                  <a 
                    href="tel:+919903996663"
                    className="text-lg font-bold hover:underline"
                    style={{ color: themeColors.accent.blue }}
                  >
                    +91 9903996663
                  </a>
                </div>

                <button
  onClick={() => {
    onBack();
    onPageChange?.('contact');
  }}
  className="w-full py-3 rounded-lg font-bold text-lg transition hover:scale-105 flex items-center justify-center gap-2"
  style={{ 
    backgroundColor: themeColors.primary.black,
    color: themeColors.text.white 
  }}
>
  <Phone className="w-5 h-5" />
  Contact for Enrollment
</button>

              </div>
            </div>
          </div>
        </div>

        {/* ADDITIONAL COURSE INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* WHAT YOU'LL LEARN */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: themeColors.background.white }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
              What You'll Learn
            </h2>
            <ul className="space-y-3">
              {safeArray(course.what_you_learn).length > 0 ? (
                safeArray(course.what_you_learn).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: themeColors.accent.green }} />
                    <span style={{ color: themeColors.text.secondary }}>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm italic" style={{ color: themeColors.text.secondary }}>
                  Course outcomes will be updated soon.
                </li>
              )}
            </ul>
          </div>

          {/* COURSE FEATURES */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: themeColors.background.white }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
              Course Features
            </h2>
            <ul className="space-y-3">
              {safeArray(course.prerequisites).length > 0 ? (
                safeArray(course.prerequisites).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Clock
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: themeColors.accent.blue }}
                    />
                    <span style={{ color: themeColors.text.secondary }}>
                      {item}
                    </span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <Clock
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: themeColors.accent.blue }}
                    />
                    <span style={{ color: themeColors.text.secondary }}>
                      No prerequisites required
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* DETAILED DESCRIPTION */}
        <div className="rounded-2xl p-6 shadow-lg mt-6" style={{ backgroundColor: themeColors.background.white }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Course Overview
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: themeColors.text.secondary }}>
            {course.description}
          </p>
          <p className="text-base leading-relaxed" style={{ color: themeColors.text.secondary }}>
          </p>
        </div>
      </div>
    </div>
  );
};