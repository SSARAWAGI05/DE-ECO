import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Award,
  Users,
  Play,
  Activity,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  CheckCircle, MessageSquare,
  Plus,
  Instagram,
  Linkedin,
  Timer,
  ChevronRight,
  PenTool,
  Map,
  ListChecks,
  FileText
} from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import { colors, getActivityIconColor, getEventColorClasses, getThemeColors } from '../../styles/colors';
import { useTheme } from '../../contexts/ThemeContext';

interface HomePageProps {
  onNavigate?: (page: string) => void;
}
interface LiveClass {
  id: string;
  title: string;
  scheduled_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  status: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [jiggle, setJiggle] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typedName, setTypedName] = useState('');
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);
  const [marketPulseReels, setMarketPulseReels] = useState<any[]>([]);
  const [marketPulseLoading, setMarketPulseLoading] = useState(true);

  // Daily Quote State
  const [dailyQuote, setDailyQuote] = useState({
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: ""
  });

  // Focus Timer States
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  
  // Daily Planner States (same as old todo)
  const [newTask, setNewTask] = useState('');
  const [dailyTasks, setDailyTasks] = useState<{ 
    id: string; 
    title: string; 
    status: string; 
    created_at?: string;
  }[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [activeTaskTab, setActiveTaskTab] = useState<'incomplete' | 'completed'>('incomplete');
  const [isDailyPlannerOpen, setIsDailyPlannerOpen] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
const [featuredCoursesLoading, setFeaturedCoursesLoading] = useState(true);
  const liveDemoVideoSrc = isDark
  ? "/graphics/demovideodark.mp4"
  : "/graphics/demovideolight.mp4";

  const aiToolsData = [
  {
    id: 1,
    title: 'Chat with Document',
    description: 'Upload any document and have intelligent conversations about its content. Ask questions, get summaries, and extract key insights instantly.',
    icon: MessageSquare,
    color: '#14b8a6',
    features: ['PDF Support', 'Real-time Analysis', 'Multi-language']
  },
  {
    id: 2,
    title: 'Essay Writer',
    description: 'Generate well-structured, original essays on any topic. Perfect for research papers, assignments, and creative writing projects.',
    icon: PenTool,
    color: '#f87171',
    features: ['Multiple Styles', 'Citation Support', 'Plagiarism Free']
  },
  {
    id: 3,
    title: 'Learning Roadmap',
    description: 'Create personalized learning paths tailored to your goals. Get step-by-step guidance from beginner to expert level.',
    icon: Map,
    color: '#a78bfa',
    features: ['Personalized Plans', 'Progress Tracking', 'Resource Links']
  },
  {
    id: 4,
    title: 'Quiz Generator',
    description: 'Automatically create quizzes from any topic or document. Perfect for self-assessment and exam preparation.',
    icon: ListChecks,
    color: '#fbbf24',
    features: ['Multiple Choice', 'True/False', 'Instant Feedback']
  },
  {
    id: 5,
    title: 'Smart Study Planner',
    description: 'AI-powered study schedules that adapt to your learning style and availability. Optimize your study time effectively.',
    icon: Target,
    color: '#34d399',
    features: ['Auto-scheduling', 'Break Reminders', 'Goal Setting']
  },
  {
    id: 6,
    title: 'Content Summarizer',
    description: 'Condense long articles, papers, and documents into concise summaries. Save time while retaining key information.',
    icon: FileText,
    color: '#fb923c',
    features: ['Quick Summaries', 'Key Points', 'Adjustable Length']
  }
];

  const [courses] = useState([
  {
    id: 1,
    title: 'React Advanced Patterns',
    instructor: 'Sarah Johnson',
    duration: '8 weeks',
    students: 1234,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'JavaScript ES6+',
    instructor: 'Mike Chen',
    duration: '6 weeks',
    students: 2341,
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Node.js Mastery',
    instructor: 'Emma Wilson',
    duration: '10 weeks',
    students: 987,
    image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'TypeScript Deep Dive',
    instructor: 'David Park',
    duration: '7 weeks',
    students: 1567,
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop'
  }
]);

  // Dashboard Stats
const [dayStreak, setDayStreak] = useState(0);
const [activeCoursesCount, setActiveCoursesCount] = useState(0);
const [classesTodayCount, setClassesTodayCount] = useState(0);

const getClassStatus = (
  scheduledDatetime: string,
  endDatetime: string
): 'upcoming' | 'completed' | 'expired' => {
  const now = new Date();
  const start = new Date(scheduledDatetime);
  const end = new Date(endDatetime);

  // End of the same day (23:59:59)
  const endOfDay = new Date(start);
  endOfDay.setHours(23, 59, 59, 999);

  if (now < start) return 'upcoming';        // Before class
  if (now >= start && now <= end) return 'completed'; // During/just after → treat as completed
  if (now > end && now <= endOfDay) return 'completed'; // After class, same day
  return 'expired';                          // Next day → flush
};


const [todayClasses, setTodayClasses] = useState<{
  id: string;
  title: string;
  scheduled_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  status: string;
}[]>([]);




  useEffect(() => {
    const interval = setInterval(() => {
      setJiggle(true);
      setTimeout(() => setJiggle(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUserName(data.first_name);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  useEffect(() => {
  const fetchMarketPulsePreview = async () => {
    setMarketPulseLoading(true);

    const { data, error } = await supabase
      .from("market_reels")
      .select(
        "id, title, reel_url, thumbnail_url, platform, published_at, view_count, duration_seconds, tag"
      )
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setMarketPulseReels(data);
    }

    setMarketPulseLoading(false);
  };

  fetchMarketPulsePreview();
}, []);


  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('quote_text, author_name')
          .order('id', { ascending: true });
          
        if (!error && data && data.length > 0) {
          const todayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          const quoteIndex = todayIndex % data.length;
          const currentQuote = data[quoteIndex];
          
          setDailyQuote({
            text: currentQuote.quote_text,
            author: currentQuote.author_name || ""
          });
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };

    fetchDailyQuote();
  }, []);

  useEffect(() => {
    if (!loading && userName) {
      let index = 0;
      const interval = setInterval(() => {
        setTypedName(userName.slice(0, index + 1));
        index++;
        if (index === userName.length) clearInterval(interval);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [loading, userName]);

  // Focus Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isFocusRunning) {
      interval = setInterval(() => {
        if (focusSeconds === 0) {
          if (focusMinutes === 0) {
            setIsFocusRunning(false);
            // Timer completed - could add notification here
          } else {
            setFocusMinutes(focusMinutes - 1);
            setFocusSeconds(59);
          }
        } else {
          setFocusSeconds(focusSeconds - 1);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, focusMinutes, focusSeconds]);

  // Fetch Daily Tasks
  useEffect(() => {
    const fetchDailyTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('todos')
        .select('id, title, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setDailyTasks(data);
      }
    };

    fetchDailyTasks();
  }, []);

  useEffect(() => {
  const fetchDashboardStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    /* ================= DAY STREAK ================= */
    const { data: profileData } = await supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', user.id)
      .single();

    setDayStreak(profileData?.current_streak || 0);

    /* ================= ACTIVE COURSES ================= */
    const { data: activeCourses } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    setActiveCoursesCount(activeCourses?.length || 0);


    /* ================= CLASSES TODAY (USER'S LIVE CLASSES) ================= */
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const { data: classesToday } = await supabase
      .from('live_classes')
      .select('id')
      .eq('user_id', user.id)
      .gte('scheduled_datetime', startOfDay.toISOString())
      .lt('scheduled_datetime', endOfDay.toISOString())
      .eq('status', 'confirmed');

    setClassesTodayCount(classesToday?.length || 0);

      };

  fetchDashboardStats();
}, []);


useEffect(() => {
  const fetchTodayClassesForPlanner = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get today's date range in user's local timezone
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Query using scheduled_datetime (timestamptz)
    const { data, error } = await supabase
      .from('live_classes')
      .select('id, title, scheduled_datetime, end_datetime, duration_minutes, status')
      .eq('user_id', user.id)
      .gte('scheduled_datetime', startOfDay.toISOString())
      .lt('scheduled_datetime', endOfDay.toISOString())
      .eq('status', 'confirmed')
      .order('scheduled_datetime', { ascending: true });

    if (!error && data) {
      setTodayClasses(data.map(cls => ({
        id: cls.id,
        title: cls.title,
        scheduled_datetime: cls.scheduled_datetime,
        end_datetime: cls.end_datetime,
        duration_minutes: cls.duration_minutes,
        status: cls.status
      })));
    }
  };

  fetchTodayClassesForPlanner();
}, []);

  useEffect(() => {
  const fetchFeaturedCourses = async () => {
    setFeaturedCoursesLoading(true);

    const { data, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        instructor_name,
        thumbnail_url,
        duration_weeks,
        level
      `)
      .eq("is_active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (!error && data) {
      setFeaturedCourses(data);
    }

    setFeaturedCoursesLoading(false);
  };

  fetchFeaturedCourses();
}, []);


  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const addDailyTask = async () => {
  if (!newTask.trim()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('todos')
    .insert([{ title: newTask, user_id: user.id, status: 'pending' }])
    .select()
    .single();

  if (!error && data) {
    setDailyTasks(prev => [data, ...prev]);
    setNewTask('');
  }
};

const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'done' ? 'pending' : 'done';
  
  const { error } = await supabase
    .from('todos')
    .update({ status: newStatus })
    .eq('id', taskId);

  if (!error) {
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }
};

const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', taskId);

  if (!error) {
    setDailyTasks(prev => prev.filter(t => t.id !== taskId));
  }
};

const resetFocusTimer = () => {
  setFocusMinutes(25);
  setFocusSeconds(0);
  setIsFocusRunning(false);
};

  const aiTools = [
    { id: 1, title: 'Chat AI', color: themeColors.accent.green },
    { id: 2, title: 'Essay Writer', color: themeColors.accent.pink },
    { id: 3, title: 'Quiz Gen', color: themeColors.accent.purple },
    { id: 4, title: 'Roadmap', color: themeColors.accent.yellowBright }
  ];

  const assignedPlannerItems = [
  // UPCOMING CLASSES
  ...todayClasses
    .filter(cls =>
      getClassStatus(cls.scheduled_datetime, cls.end_datetime) === 'upcoming'
    )
    .map(cls => ({
      id: `class-${cls.id}`,
      title: `📅 ${cls.title}`,
      type: 'class' as const,
      start_time: new Date(cls.scheduled_datetime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
    })),

  // Pending todos
  ...dailyTasks
    .filter(t => t.status === 'pending')
    .map(t => ({
      id: t.id,
      title: t.title,
      type: 'task' as const,
    }))
];

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.primary.lightGray }}>
      {/* Spacer for fixed navbar */}
      <div className="h-14 sm:h-16 md:h-20 lg:h-24"></div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Top Welcome Section - KEPT SAME */}
        <div className="border-2 rounded-2xl sm:rounded-3xl shadow-lg mb-6 sm:mb-8" style={{ backgroundColor: themeColors.background.white, borderColor: themeColors.primary.black }}>
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-5 lg:py-6 xl:py-6">
            <div className="flex items-stretch gap-3 sm:gap-4 lg:gap-6 w-full">
              <div className="flex-[2] flex flex-col items-center justify-center text-center px-2 sm:px-4">
                <div className={`flex justify-center items-center mb-4 ${jiggle ? 'animate-pulse' : ''}`}>
                  <span className="text-sm sm:text-base lg:text-lg font-medium" style={{ color: themeColors.text.secondary }}>
                    {getCurrentGreeting()}
                  </span>
                </div>

                <h1
                  className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-3 sm:mb-4"
                  style={{ color: themeColors.text.primary }}
                >
                  Welcome
                  {(typedName || userName) && ','}{' '}
                  {(typedName || userName) && (
                    <span className="relative font-extrabold">
                      {typedName || userName}!
                      <span className="absolute left-0 -bottom-1 w-full h-1 bg-pink-500 rounded-full opacity-70"></span>
                    </span>
                  )}
                  <span className="ml-2 opacity-80">Ready to learn?</span>
                </h1>


                <p className="text-xs sm:text-base lg:text-lg italic text-center leading-relaxed mb-2" style={{ color: themeColors.text.secondary }}>
                  "{dailyQuote.text}"
                  {dailyQuote.author && <span className="block mt-1 text-xs opacity-80 not-italic">- {dailyQuote.author}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section - Improved Design */}
          <div className="mb-6 sm:mb-8">
            {/* Main Container Card */}
            <div 
              className="rounded-3xl shadow-xl border-0 p-4 sm:p-5 lg:p-6"
              style={{
                backgroundColor: themeColors.primary.lG,
                borderColor: themeColors.primary.black
              }}
            >


            {/* Stats Grid - Clean & Premium */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">

  {/* Current Streak */}
  <div
    className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition border border-black/5"
    style={{ backgroundColor: themeColors.accent.purple }}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
        <Activity className="w-4 h-4" style={{ color: themeColors.text.primary }} />
      </div>

      <span className="text-lg font-semibold tabular-nums"
        style={{ color: themeColors.text.primary }}>
        {dayStreak}
      </span>

      <span className="text-sm truncate"
        style={{ color: themeColors.text.primary, opacity: 0.7 }}>
        Day Streak 
      </span>
    </div>
  </div>

  {/* Courses Registered */}
  <div
    className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition border border-black/5 cursor-pointer hover:scale-105"
    style={{ backgroundColor: themeColors.accent.blue }}
    onClick={() => {
      localStorage.setItem('coursesTab', 'my-learning');
      onNavigate?.('courses');
    }}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
        <BookOpen className="w-4 h-4" style={{ color: themeColors.text.primary }} />
      </div>

      <span className="text-lg font-semibold"
        style={{ color: themeColors.text.primary }}>
        {activeCoursesCount}
      </span>

      <span className="text-sm truncate"
        style={{ color: themeColors.text.primary, opacity: 0.7 }}>
        Active Courses 
      </span>
    </div>
  </div>

  {/* Upcoming Classes */}
  <div
    className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition border border-black/5"
    style={{ backgroundColor: themeColors.accent.yellow }}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
        <Calendar className="w-4 h-4" style={{ color: themeColors.text.primary }} />
      </div>

      <span className="text-lg font-semibold"
        style={{ color: themeColors.text.primary }}>
        {classesTodayCount}
      </span>

      <span className="text-sm truncate"
        style={{ color: themeColors.text.primary, opacity: 0.7 }}>
        Classes Today 
      </span>
    </div>
  </div>

  {/* Social Connect */}
<div
  className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition border border-black/5"
  style={{ backgroundColor: themeColors.accent.red }}
>
  {/* Left side */}
  <div className="flex items-center gap-3 min-w-0">
    

    <span
      className="text-sm font-medium truncate"
      style={{ color: themeColors.text.primary, opacity: 0.7 }}
    >
      Connect with us
    </span>
  </div>

  {/* Social Icons */}
<div className="flex items-center gap-2 ml-3">
  <a
    href="https://l.instagram.com/?u=https%3A%2F%2Fchat.whatsapp.com%2FFzCODHVaAnFEoYgKjMEgM7%3Fmode%3Dhqrt2%26utm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnYU7QL0-s1szpbaUmSlZhg9ku4rwsK2G8lrXZ2yF--_dDsIvz3JFGmMq5Yxs%26brid%3D7sEOuXMEdYFIRsZvR0JMwg&e=AT1WfRorwFnqNiyNtX7vhCZRMtPUj-sZvsUOIsjEkVeocDxYrjLdsr5lX2iU16vyLFZgyeuB54ZCbb520VmV75NB6le-vjFwkhmVc6d9U4P-sbjoyKCQENAAdg"
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-md flex items-center justify-center transition hover:scale-110"
    style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
  >
    <i
      className="fa-brands fa-whatsapp"
      style={{ color: themeColors.text.primary, fontSize: "14px" }}
    />
  </a>

  <a
    href="https://instagram.com/deeco.official"
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-md flex items-center justify-center transition hover:scale-110"
    style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
  >
    <Instagram className="w-4 h-4" style={{ color: themeColors.text.primary }} />
  </a>

  <a
    href="https://linkedin.com/company/yourcompany"
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-md flex items-center justify-center transition hover:scale-110"
    style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
  >
    <Linkedin className="w-4 h-4" style={{ color: themeColors.text.primary }} />
  </a>

</div>
</div>


</div>


            {/* Daily Planner Section */}
            <div 
              className="rounded-2xl p-6 sm:p-7 shadow-lg"
              style={{
                backgroundColor: themeColors.background.white,
                borderColor: themeColors.primary.black
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.accent.orange}, ${themeColors.accent.yellowBright})`
                    }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: themeColors.text.primary }} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                      Daily Planner
                    </h3>
                    <p className="text-xs sm:text-sm" style={{ color: themeColors.text.secondary }}>
                      {assignedPlannerItems.length} assigned · {dailyTasks.filter(t => t.status === 'done').length} completed
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDailyPlannerOpen(!isDailyPlannerOpen);
                    }}
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: themeColors.primary.w2,
                    }}
                  >
                    <ChevronRight 
                      className={`w-6 h-6 transition-transform duration-300 ${isDailyPlannerOpen ? 'rotate-90' : ''}`}
                      style={{ color: themeColors.primary.w }}
                    />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2" style={{ backgroundColor: themeColors.accent.green, borderColor: themeColors.primary.black }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <span className="text-sm font-bold" style={{ color: themeColors.text.primary }}>
                      {dailyTasks.length > 0 ? Math.round((dailyTasks.filter(t => t.status === 'done').length / dailyTasks.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              {isDailyPlannerOpen && (
              <>
              {/* Add Task Input */}
              <div className="flex gap-3 mb-6">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addDailyTask(); }}
                  placeholder="✨ What's on your agenda today?"
                  className="flex-1 px-5 py-3.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 border-2 transition-all shadow-sm"
                  style={{
                    backgroundColor: themeColors.background.white,
                    borderColor: themeColors.primary.lightGray,
                    color: themeColors.text.primary
                  }}
                />
                <button
                  onClick={async () => {
                    if (!newTask.trim()) return;
                    setIsAddingTask(true);
                    await addDailyTask();
                    setIsAddingTask(false);
                  }}
                  disabled={isAddingTask || !newTask.trim()}
                  className="px-5 sm:px-7 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.03] hover:-translate-y-1
 active:scale-95 shadow-lg flex items-center gap-2"
                  style={{ 
                    backgroundColor: themeColors.accent.yellowBright,
                    color: themeColors.text.primary,
                    opacity: (!newTask.trim() || isAddingTask) ? 0.5 : 1,
                    borderWidth: '2px',
                    borderColor: themeColors.primary.black
                  }}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Task</span>
                </button>
              </div>

              {/* Two Column Layout - NO FIXED HEIGHT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Assigned Tasks Column */}
                <div 
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: themeColors.accent.orange,
                    borderColor: themeColors.primary.black
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5" style={{ color: themeColors.text.primary }} />
                    <h4 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                      Assigned ({assignedPlannerItems.length}) 
                    </h4>
                  </div>
                  
                  {assignedPlannerItems.length === 0 ? (
                    <div className="text-center py-0">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                        <CheckCircle className="w-7 h-7" style={{ color: themeColors.text.primary, opacity: 0.3 }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {assignedPlannerItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: themeColors.background.white,
                      borderColor: themeColors.primary.black
                    }}
                  >
                    {item.type === 'task' ? (
                      <>
                        <button
                          onClick={() => toggleTaskStatus(item.id, 'pending')}
                          className="flex-shrink-0 w-5 h-5 rounded border-2"
                          style={{ borderColor: themeColors.accent.blue }}
                        />
                        <span 
                        className="flex-1 text-sm font-medium"
                        style={{ color: themeColors.primary.w2 }}  // Add this style
                      >
                        {item.title}
                      </span>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ backgroundColor: themeColors.accent.yellow }}
                        >
                          <Calendar className="w-3 h-3" />
                        </div>

                        <span 
                        className="flex-1 text-sm font-medium"
                        style={{ color: themeColors.primary.w2 }} >
                          {item.title}
                          {item.start_time && (
                            <span className="ml-2 text-xs opacity-60">
                              ({item.start_time.slice(0, 5)})
                            </span>
                          )}
                        </span>

                        <span className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: themeColors.accent.green }}>
                          Live Class
                        </span>
                      </>
                    )}
                  </div>
                  ))}

                    </div>
                  )}
                </div>

                {/* Completed Tasks Column */}
                <div 
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: themeColors.accent.green,
                    borderColor: themeColors.primary.black
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5" style={{ color: themeColors.text.primary }} />
                    <h4 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                      Completed ({dailyTasks.filter(t => t.status === 'done').length})
                    </h4>
                  </div>
                  
                  {dailyTasks.filter(t => t.status === 'done').length === 0 ? (
                    <div className="text-center py-0">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                        <Activity className="w-7 h-7" style={{ color: themeColors.text.primary, opacity: 0.3 }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {[
                        // Completed classes (same day)
                        ...todayClasses
                          .filter(cls =>
                            getClassStatus(cls.scheduled_datetime, cls.end_datetime) === 'completed'
                          )
                          .map(cls => ({
                            id: `class-done-${cls.id}`,
                            title: `📅 ${cls.title}`,
                            type: 'class' as const,
                          })),

                        // Completed todos
                        ...dailyTasks
                          .filter(t => t.status === 'done')
                          .map(t => ({
                            id: t.id,
                            title: t.title,
                            type: 'task' as const,
                          }))
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border-2"
                          style={{
                            backgroundColor: themeColors.background.white,
                            borderColor: themeColors.primary.black
                          }}
                        >
                          <CheckCircle size={14} />
                          <span
                            className="flex-1 text-sm font-medium opacity-70"
                            style={{ color: themeColors.text.primary }}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              </>)}
            </div>

          </div>
        </div>
              
        {/* Featured Courses Section */}
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8" style={{ backgroundColor: themeColors.accent.yellow }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2 inline-block"
                style={{ color: themeColors.text.primary }}
              >
                Featured Courses
              </h2>
              <svg className="w-80 h-3 mt-1" viewBox="0 0 250 8" preserveAspectRatio="none">
                <path
                  d="M0,4 Q60,2 120,5 T250,4"
                  stroke={themeColors.text.primary}
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* 🔹 Explore More Courses Button */}
            <button
              onClick={() => onNavigate?.("courses")}
              className="px-6 py-3 rounded-xl font-bold transition-transform hover:scale-[1.03] hover:-translate-y-1
                flex items-center gap-2"
              style={{
                backgroundColor: themeColors.primary.black,
                color: themeColors.text.white,
              }}
            >
              Explore More Courses
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4 overflow-visible">
          {/* Loading */}
          {featuredCoursesLoading && (
            <p className="text-sm opacity-70 col-span-full text-center">
              Loading featured courses…
            </p>
          )}

          {/* Empty state */}
          {!featuredCoursesLoading && featuredCourses.length === 0 && (
            <p className="text-sm opacity-70 col-span-full text-center">
              
            </p>
          )}

          {/* Courses */}
          {!featuredCoursesLoading &&
            featuredCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:scale-[1.03] hover:-translate-y-1
"
                style={{ backgroundColor: themeColors.background.white }}
              >
                {/* Course Image */}
                <div className="h-40 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={
                      course.thumbnail_url ||
                      "/logo/De-Eco-logo.png"
                    }
                    alt={course.title}
                    className={course.thumbnail_url ? "w-full h-full object-cover" : "w-1/2 h-1/2 object-contain"}
                  />
                </div>

                {/* Course Content */}
                <div className="p-4">
                  <h3
                    className="font-bold text-base mb-2 line-clamp-2"
                    style={{ color: themeColors.text.primary }}
                  >
                    {course.title}
                  </h3>

                  <p
                    className="text-xs mb-1"
                    style={{ color: themeColors.text.secondary }}
                  >
                    by {course.instructor_name}
                  </p>

                  <div
                    className="flex items-center gap-3 text-xs mb-3"
                    style={{ color: themeColors.text.tertiary }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration_weeks ? `${course.duration_weeks} weeks` : 'Flexible'}
                    </span>

                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: themeColors.accent.blueLight }}
                    >
                      {course.level}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      localStorage.setItem('selectedCourseId', course.id);
                      onNavigate?.("courses");
                    }}
                    className="w-full py-2 rounded-lg font-bold text-sm transition-transform hover:scale-[1.03] hover:-translate-y-1"
                    style={{
                      backgroundColor: themeColors.accent.blue,
                      color: themeColors.text.white,
                    }}
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
        </div>
        </div>
        
        {/* Live Classes Section */}
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8" style={{ backgroundColor: themeColors.accent.red }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold mb-2 inline-block" style={{ color: themeColors.text.primary }}>
                  Live Classes
                </h2>
                <svg className="w-56 h-3 mt-1" viewBox="0 0 250 8" preserveAspectRatio="none">
                  <path d="M0,4 Q60,2 120,5 T250,4" stroke={themeColors.text.primary} strokeWidth="3" fill="none" />
                </svg>
              </div>

              <div className="space-y-3 mb-8">
                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: themeColors.text.primary }}
                >
                  Enroll in live classes designed for both group learning and one-on-one guidance.
                </p>

                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: themeColors.text.primary }}
                >
                  Learn Economics, Finance, Maths, Business Studies, Statistics, and more by connecting theory with real-life applications.
                </p>

                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: themeColors.text.primary }}
                >
                  Open to working professionals, college learners, and school students, with access to live classes, notes, recordings, and comprehensive study resources.
                </p>
              </div>
              
              <button
                onClick={() => onNavigate?.("live-classes")}
                className="px-8 py-4 rounded-xl font-bold text-lg transition-transform transform hover:scale-[1.03] hover:-translate-y-1
                  shadow-lg inline-block w-fit"
                style={{
                  backgroundColor: themeColors.accent.yellowBright,
                  color: themeColors.text.primary,
                }}
              >
                Explore Live Classes
              </button>
            </div>

              <div
  className="relative inline-block rounded-2xl overflow-hidden shadow-lg
             transition-transform transform hover:scale-[1.03] hover:-translate-y-1"
>
  <video
    key={liveDemoVideoSrc}
    src={liveDemoVideoSrc}
    autoPlay
    loop
    muted
    playsInline
    className="block rounded-2xl"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',     // 🔥 THIS removes black bars
      backgroundColor: 'transparent',
    }}
  />
</div>

            </div>
          </div>

        {/* ================= MARKET PULSE SECTION ================= */}
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-visible" style={{ backgroundColor: themeColors.accent.blue }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2 inline-block"
                style={{ color: themeColors.text.primary }}
              >
                Market Pulse
              </h2>
              <svg className="w-80 h-3 mt-1" viewBox="0 0 250 8" preserveAspectRatio="none">
                <path
                  d="M0,4 Q60,2 120,5 T250,4"
                  stroke={themeColors.text.primary}
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* 🔹 Explore More Courses Button */}
            <button
              onClick={() => onNavigate?.("market-pulse")}
              className="px-6 py-3 rounded-xl font-bold transition-transform hover:scale-[1.03] hover:-translate-y-1
                flex items-center gap-2"
              style={{
                backgroundColor: themeColors.primary.black,
                color: themeColors.text.white,
              }}
            >
              Explore Market Pulse
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Reels Preview – Horizontal Scroll */}
        <div className="overflow-x-auto overflow-y-visible px-4">

          <div
            className="flex gap-4 sm:gap-6 pt-4"
            style={{ minWidth: "max-content" }}
          >

            {marketPulseLoading && (
              <div className="px-6 py-10 text-sm opacity-70">
                Loading Market Pulse…
              </div>
            )}

            {!marketPulseLoading &&
              marketPulseReels.map((reel) => (
                <div
                  key={reel.id}
                  className="w-[280px] sm:w-[320px] rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-[1.03] hover:-translate-y-1
 cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: themeColors.background.white }}
                  onClick={() => window.open(reel.reel_url, "_blank")}
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 sm:h-48 bg-slate-100 flex items-center justify-center">
                    <img
                      src={
                        reel.thumbnail_url ||
                        "/logo/De-Eco-logo.png"
                      }
                      alt={reel.title}
                      className={reel.thumbnail_url ? "w-full h-full object-cover" : "w-1/2 h-1/2 object-contain"}
                    />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                        <Play className="w-6 h-6 text-black" />
                      </div>
                    </div>

                    {/* Tag */}
                    {reel.tag && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white">
                        {reel.tag}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3
                      className="font-bold text-sm sm:text-base line-clamp-2"
                      style={{ color: themeColors.text.primary }}
                    >
                      {reel.title}
                    </h3>

                    <div
                      className="mt-2 text-xs flex justify-between"
                      style={{ color: themeColors.text.secondary }}
                    >
                      <span>
                        {new Date(reel.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Scroll Indicator */}
          <p className="text-center text-sm mt-4 text-gray-400">← Scroll to see more pulses →</p>
        </div>

        </div>

        {/* AI Hub Section */}
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-visible"
          style={{ backgroundColor: themeColors.accent.blueLight }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2 inline-block"
                style={{ color: themeColors.text.primary }}
              >
                AI Hub
              </h2>
              <svg className="w-36 h-3 mt-1" viewBox="0 0 250 8" preserveAspectRatio="none">
                <path
                  d="M0,4 Q60,2 120,5 T250,4"
                  stroke={themeColors.text.primary}
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* 🔹 Explore AI Hub Button */}
            <button
              onClick={() => onNavigate?.("ai-hub")}
              className="px-6 py-3 rounded-xl font-bold transition-transform hover:scale-[1.03] hover:-translate-y-1
                flex items-center gap-2"
              style={{
                backgroundColor: themeColors.primary.black,
                color: themeColors.text.white,
              }}
            >
              Explore AI Hub
              <ChevronRight size={18} />
            </button>
          </div>
          
          {/* Horizontally Scrollable Container */}
          <div className="overflow-x-auto overflow-y-visible pb-8 px-4">
            <div
              className="flex gap-4 sm:gap-6 py-3"
              style={{ minWidth: 'max-content' }}
            >
              {aiToolsData.map((tool, index) => {
                // Assign colors from themeColors in a rotating pattern
                const colorOptions = [
                  themeColors.accent.yellow,
                  themeColors.accent.green,
                  themeColors.accent.purple,
                  themeColors.accent.orange,
                  themeColors.accent.yellow,
                  themeColors.accent.red
                ];
                const toolColor = colorOptions[index % colorOptions.length];
                
                return (
                  <div
                    key={tool.id}
                    className="
                      rounded-2xl shadow-lg
                      transition-transform duration-300
                      hover:scale-[1.03]
                      hover:translate-z-10
                      cursor-pointer
                      p-6
                      flex-shrink-0
                    "
                    style={{ 
                      backgroundColor: toolColor, 
                      width: '320px',
                    }}
                  >
                      {/* Icon */}
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" 
                        style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                      >
                        <tool.icon className="w-7 h-7" style={{ color: themeColors.text.primary }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm mb-4 line-clamp-3" style={{ color: themeColors.text.primary, opacity: 0.85 }}>
                        {tool.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                            style={{ 
                              backgroundColor: 'rgba(0,0,0,0.15)', 
                              color: themeColors.text.primary 
                            }}
                          >
                            <CheckCircle className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Launch Button */}
                      <button 
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 border-2" 
                        style={{ 
                          backgroundColor: themeColors.primary.black, 
                          color: themeColors.text.white,
                          borderColor: themeColors.primary.black
                        }}
                      >
                        Coming Soon!
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  );
                })}
            </div>  
          </div>

          {/* Scroll Indicator */}
          <div className="mt-8 mb-2">
            <p className="text-center text-sm text-gray-400">
              ← Scroll to see more pulses →
            </p>
          </div>
        </div>
      </div>
        </div>
  );
};