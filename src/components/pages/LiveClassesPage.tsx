import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Menu, 
  X, 
  Play, 
  FileText, 
  BookOpen, 
  Users, 
  Download,
  Bell,
  Video,
  Home,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { getPriorityColor, getStatusColor, getThemeColors } from '../../styles/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from "../../lib/supabaseClient";

type SidebarSection = 'home' | 'upcoming' | 'notes' | 'recordings' | 'schedule';

// Add these type definitions
interface Class {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  duration_minutes: number; // ✅ ADD THIS
  participants: number;
  status: string;
  meeting_link: string;
  scheduled_datetime: string;
  end_datetime: string;
}


interface Announcement {
  id: string;
  title: string;
  message: string;
  time: string;
  priority: string;
  type: string;
}

interface Note {
  id: string;
  title: string;
  date: string;
  size: string;
  downloads: number;
  file_url: string;
}

interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  views: number;
  video_url: string;
}

interface UserStats {
  classes_attended: number;
  classes_scheduled: number;
  total_study_hours: number;
  notes_downloaded: number;
  recordings_watched: number;
  attendance_rate: number;
}
interface LiveClassesPageProps {
  onPageChange: (page: string) => void;
}

export const LiveClassesPage: React.FC<LiveClassesPageProps> = ({ onPageChange }) => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);
  const [currentSection, setCurrentSection] = useState<SidebarSection>('home');
  const [countdown, setCountdown] = useState({
  phase: 'upcoming' as 'upcoming' | 'in_progress' | 'ended',
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // NEW STATE - Add these
  const [loading, setLoading] = useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState<Class[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [nextClass, setNextClass] = useState<Class | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  // Calculate countdown for next class
  useEffect(() => {
  if (!nextClass) return;

  const calculateCountdown = () => {
    const now = Date.now();
    const start = new Date(nextClass.scheduled_datetime).getTime();
    const end =
      start + nextClass.duration_minutes * 60 * 1000;

    let diff = 0;
    let phase: 'upcoming' | 'in_progress' | 'ended';

    if (now < start) {
      phase = 'upcoming';
      diff = start - now;
    } else if (now >= start && now < end) {
      phase = 'in_progress';
      diff = end - now;
    } else {
      phase = 'ended';
      diff = 0;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setCountdown({ phase, days, hours, minutes, seconds });
  };

  calculateCountdown();
  const interval = setInterval(calculateCountdown, 1000);
  return () => clearInterval(interval);
}, [nextClass]);


  // Fetch all data from database
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // ✅ FAST COUNT: Classes Attended
        const nowIso = new Date().toISOString();

        const { count: attendedCount, error: attendedError } = await supabase
          .from('live_classes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lt('end_datetime', nowIso);

        // 🔒 CHECK ENROLLMENT (Global Active Status)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || profile.is_active === false) {
          setIsEnrolled(false);
          setLoading(false);
          return; // ⛔ STOP HERE — don't load class data
        }

        setIsEnrolled(true);
        
        // Fetch upcoming classes
        // Fetch upcoming classes
        const now = new Date().toISOString();

          const { data: classes, error: classesError } = await supabase
            .from('live_classes')
            .select('*')
            .eq('user_id', user.id)
            .gte('scheduled_datetime', '2026-06-11T00:00:00.000Z')
            .order('scheduled_datetime', { ascending: false });


        if (!classesError && classes) {
          setUpcomingClasses(classes.map(cls => {
            const scheduledDate = new Date(cls.scheduled_datetime); // ✅ Parse timestamptz
            const endDate = new Date(scheduledDate.getTime() + cls.duration_minutes * 60000);
            
            return {
              id: cls.id,
              title: cls.title,
              instructor: cls.instructor_name,
              // ✅ Automatically converts to user's local timezone
              date: scheduledDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              }),
              time: `${scheduledDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })} - ${endDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}`,
              duration: `${cls.duration_minutes} min`,
              duration_minutes: cls.duration_minutes, // ✅ ADD
              participants: cls.current_participants,
              status: cls.status,
              meeting_link: cls.meeting_link,
              scheduled_datetime: cls.scheduled_datetime,
              end_datetime: cls.end_datetime
            };
          }));

          // Set next class for countdown
          if (classes.length > 0) {
            const nowTime = new Date().getTime();
            // Find the closest upcoming class by dynamically calculating end time
            const upcoming = classes
              .filter(c => {
                const actualEnd = new Date(c.scheduled_datetime).getTime() + c.duration_minutes * 60000;
                return actualEnd >= nowTime;
              })
              .sort((a, b) => new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime());
            
            if (upcoming.length > 0) {
              setNextClass(upcoming[0]);
            } else {
              setNextClass(null);
            }
          }
      }

      // Fetch class announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('class_announcements')
        .select('*')
        .eq('is_active', true)
        .or(
          `target_audience.eq.all,user_id.eq.${user.id}`
        )
        .order('created_at', { ascending: false })
        .limit(3);

      if (!announcementsError && announcementsData) {
        setAnnouncements(announcementsData.map(a => ({
          id: a.id,
          title: a.title,
          message: a.message,
          time: getTimeAgo(a.created_at),
          priority: a.priority,
          type: a.type
        })));
      }

      // Fetch class notes
      const { data: notes, error: notesError } = await supabase
        .from('class_notes')
        .select('*')
        .eq('user_id', user.id)  // ← ADD THIS LINE
        .order('upload_date', { ascending: false })
        .limit(10);

      if (!notesError && notes) {
        setRecentNotes(notes.map(note => ({
          id: note.id,
          title: note.title,
          date: new Date(note.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          size: note.file_size || 'N/A',
          downloads: note.download_count,
          file_url: note.file_url
        })));
      }

      // Fetch recordings
      const { data: recordings, error: recordingsError } = await supabase
        .from('class_recordings')
        .select('*')
        .eq('user_id', user.id)  // ← ADD THIS LINE
        .order('recorded_date', { ascending: false })
        .limit(10);

      if (!recordingsError && recordings) {
        setRecentRecordings(recordings.map(rec => ({
          id: rec.id,
          title: rec.title,
          date: new Date(rec.recorded_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          duration: formatDuration(rec.duration_minutes),
          views: rec.view_count,
          video_url: rec.video_url
        })));
      }

      // Fetch user stats
const { data: stats, error: statsError } = await supabase
  .from('user_class_stats')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (!statsError && stats) {
  setUserStats({
    ...stats,
    // ✅ OVERRIDE classes_attended with FAST DB COUNT
    classes_attended: attendedError ? stats.classes_attended : (attendedCount ?? 0),
  });
} else {
  // Create stats if they don't exist
  await supabase.from('user_class_stats').insert([{ user_id: user.id }]);

  setUserStats({
    // ✅ USE COUNT HERE TOO
    classes_attended: attendedCount ?? 0,
    classes_scheduled: 0,
    notes_downloaded: 0,
    recordings_watched: 0,
    total_study_hours: 0,
    attendance_rate: 0
  });
}


      setLoading(false); // ✅ SUCCESS PATH
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false); // ❌ ERROR PATH
    }
  };

  fetchAllData();
}, []);

  // Helper function to format time ago
  const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  return 'Just now';
  };

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
  };

  const sidebarItems = [
    { id: 'home' as SidebarSection, label: 'Home', icon: <Home className="w-5 h-5" />, color: themeColors.accent.blue },
    { id: 'upcoming' as SidebarSection, label: 'Classes', icon: <Calendar className="w-5 h-5" />, color: themeColors.accent.yellow },
    { id: 'notes' as SidebarSection, label: 'Class Notes', icon: <BookOpen className="w-5 h-5" />, color: themeColors.accent.red },
    { id: 'recordings' as SidebarSection, label: 'Recordings & Transcripts', icon: <Video className="w-5 h-5" />, color: themeColors.accent.orange },
    { id: 'schedule' as SidebarSection, label: 'Week Schedule', icon: <Clock className="w-5 h-5" />, color: themeColors.accent.blueLight },
  ];


  const renderHomeContent = () => (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-black rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg border-2 border-white dark:border-gray-700">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div style={{ backgroundColor: themeColors.accent.blue }} className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {userStats?.classes_attended || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-white">Classes Attended</div>
          </div>
          <div style={{ backgroundColor: themeColors.accent.yellow }} className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {upcomingClasses.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-white">Upcoming</div>
          </div>
          <div style={{ backgroundColor: themeColors.accent.red }} className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {recentNotes.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-white">Notes Available</div>
          </div>
          <div style={{ backgroundColor: themeColors.accent.orange }} className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center">
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {recentRecordings.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-white">Recordings</div>
          </div>
        </div>
      </div>

      {/* Next Class Countdown */}
      <div style={{ backgroundColor: themeColors.accent.blue }} className="p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {countdown.phase === 'upcoming' && 'Next Class Starting In'}
              {countdown.phase === 'in_progress' && 'Class In Progress'}
              {countdown.phase === 'ended' && 'Last Class Ended'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base">
              {nextClass?.title || 'No upcoming classes'}
            </p>
          </div>
          <button
  onClick={() => {
    if (countdown.phase !== 'ended') {
      window.open(nextClass?.meeting_link || "#", "_blank");
    }
  }}
  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-md transition ${
    countdown.phase === 'in_progress'
      ? 'bg-green-600 text-white animate-pulse'
      : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
  }`}
>
  {countdown.phase === 'upcoming' && 'Join Class'}
  {countdown.phase === 'in_progress' && 'Join fast'}
  {countdown.phase === 'ended' && 'Class Ended'}
</button>

        </div>


        <div className="grid grid-cols-2 sm:flex sm:justify-center gap-3 sm:gap-6">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
            { label: 'Seconds', value: countdown.seconds },
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-black rounded-xl px-3 sm:px-5 py-3 sm:py-4 shadow-md text-center">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {item.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements & Reminders */}
      <div style={{ backgroundColor: themeColors.accent.orange }} className="p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-gray-100" />
            Announcements & Reminders
          </h3>
          <button className="bg-black dark:bg-white text-white dark:text-black px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition">
            View All
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {announcements.map((announcement) => (
           <div
            key={announcement.id}
            className="p-3 sm:p-4 rounded-xl shadow-sm border"
            style={{ backgroundColor: themeColors.background.white, borderColor: themeColors.primary.w2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {announcement.priority === 'high' && <AlertCircle className="w-4 h-4" style={{ color: themeColors.text.primary }} />}
                  {announcement.priority === 'medium' && <Clock className="w-4 h-4" style={{ color: themeColors.text.primary }} />}
                  {announcement.priority === 'low' && <CheckCircle className="w-4 h-4" style={{ color: themeColors.text.primary }} />}
                  <h4 className="font-semibold text-sm sm:text-base" style={{ color: themeColors.text.primary }}>{announcement.title}</h4>
                </div>
                <p className="text-xs sm:text-sm mb-2" style={{ color: themeColors.text.secondary }}>{announcement.message}</p>
                <p className="text-xs" style={{ color: themeColors.text.tertiary }}>{announcement.time}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: themeColors.text.tertiary }} />
            </div>
          </div>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Recent Classes */}
        <div style={{ backgroundColor: themeColors.accent.red }} className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Recent Classes
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {upcomingClasses.slice(0, 3).map((cls) => (
              <div key={cls.id} className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: themeColors.background.white }}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm" style={{ color: themeColors.text.primary }}>{cls.title}</h4>
                  <span 
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ 
                      backgroundColor: getStatusColor(cls.status, isDark), 
                      color: themeColors.text.primary 
                    }}
                  >
                    {cls.status}
                  </span>
                </div>
                <p className="text-xs" style={{ color: themeColors.text.tertiary }}>{cls.date} • {cls.time}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCurrentSection('upcoming')}
            className="w-full mt-3 sm:mt-4 bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            View All Classes
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: themeColors.accent.blueLight }} className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <button 
              onClick={() => setCurrentSection('notes')}
              className="w-full p-3 rounded-xl shadow-sm text-left hover:shadow-md transition flex items-center gap-3" style={{ backgroundColor: themeColors.background.white }}
            >
              <BookOpen className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Access Class Notes</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{recentNotes.length} files available</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentSection('recordings')}
              className="w-full p-3 rounded-xl shadow-sm text-left hover:shadow-md transition flex items-center gap-3" style={{ backgroundColor: themeColors.background.white }}
            >
              <Video className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Watch Recordings</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{recentRecordings.length} videos available</div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentSection('schedule')}
              className="w-full p-3 rounded-xl shadow-sm text-left hover:shadow-md transition flex items-center gap-3" style={{ backgroundColor: themeColors.background.white }}
            >
              <Calendar className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">View Schedule</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">This week's classes</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpcomingClasses = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-black p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 lg:mb-6">Classes</h2>
        
        <div className="space-y-4">
          {upcomingClasses.map((cls) => (
            <div key={cls.id} style={{ backgroundColor: themeColors.accent.blue }} className="p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">{cls.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">with {cls.instructor}</p>
                </div>
                <div className="flex gap-2">
                  <span 
                    className="px-3 py-1 text-xs rounded-full font-medium"
                    style={{ 
                      backgroundColor: getStatusColor(cls.status, isDark), 
                      color: themeColors.text.primary 
                    }}
                  >
                    {cls.status}
                  </span>
                  <button
                    onClick={() => {
                      if (countdown.phase !== 'ended') {
                        window.open(nextClass?.meeting_link || "#", "_blank");
                      }
                    }}
                    className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-md transition ${
                      countdown.phase === 'in_progress'
                        ? 'bg-green-600 text-white animate-pulse'
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                    }`}
                  >
                    {countdown.phase === 'upcoming' && 'Join Class'}
                    {countdown.phase === 'in_progress' && 'Join fast'}
                    {countdown.phase === 'ended' && 'Class Ended'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-900 dark:text-gray-100" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">Date</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{cls.date}</div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-gray-900 dark:text-gray-100" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">Time</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{cls.time}</div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                  <Users className="w-4 h-4 mx-auto mb-1 text-gray-900 dark:text-gray-100" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">Participants</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{cls.participants}</div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-gray-900 dark:text-gray-100" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{cls.duration}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClassNotes = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-black p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 lg:mb-6">Class Notes</h2>
        
        <div className="grid gap-4">
          {recentNotes.map((note) => (
            <div key={note.id} style={{ backgroundColor: themeColors.accent.red }} className="p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{note.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Uploaded on {note.date}</p>
                  </div>
                </div>
                <a
                  href={note.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Fire-and-forget analytics (does not block download)
                    supabase.rpc('increment_note_downloads', { note_id: note.id });
                  }}
                  className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition inline-flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecordings = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-black p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 lg:mb-6">Recordings & Transcripts</h2>
        
        <div className="grid gap-4">
          {recentRecordings.map((recording) => (
            <div key={recording.id} style={{ backgroundColor: themeColors.accent.orange }} className="p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{recording.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Recorded on {recording.date}</p>
                  </div>
                </div>
                <button 
                onClick={async () => {
                  // Increment view count
                  await supabase.rpc('increment_recording_views', { recording_id: recording.id });
                  // Open video
                  window.open(recording.video_url, '_blank');
                }}
                className="bg-black dark:bg-white text-white dark:text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition text-xs sm:text-sm font-medium"
              >
                Watch
              </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => {
  // Get current date info
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create a map of dates that have classes
  const classDateMap = new Map();
  upcomingClasses.forEach((cls: Class) => {
    const classDate = new Date(cls.scheduled_datetime); // ✅ Parse timestamptz
  if (classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear) {
    const day = classDate.getDate();
    if (!classDateMap.has(day)) {
      classDateMap.set(day, []);
    }
    classDateMap.get(day)!.push(cls);
  }
});

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, classes: [] });
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      classes: classDateMap.get(day) || [],
      isToday: day === today.getDate() && 
               currentMonth === today.getMonth() && 
               currentYear === today.getFullYear()
    });
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-black p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white dark:border-gray-700">
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Schedule
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {upcomingClasses.filter(cls => {
              const clsDate = new Date(cls.scheduled_datetime); // ✅ Parse timestamptz
              return clsDate.getMonth() === currentMonth && clsDate.getFullYear() === currentYear;
            }).length} classes this month
          </div>
        </div>
        
        <div style={{ backgroundColor: themeColors.accent.blueLight }} className="p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="text-center font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, i) => {
              const hasClass = dayData.classes.length > 0;
              
              return (
                <div
                  key={i}
                  className={`p-2 sm:p-3 rounded-lg text-center text-sm relative group transition ${
                    !dayData.day 
                      ? 'bg-transparent' 
                      : hasClass 
                        ? 'cursor-pointer font-bold' 
                        : 'hover:bg-white dark:hover:bg-gray-700 cursor-default'
                  } ${
                    dayData.isToday ? 'ring-2 ring-black dark:ring-white' : ''
                  }`}
                  style={{
                    backgroundColor: hasClass ? themeColors.accent.blue : undefined,
                    color: !dayData.day 
                      ? 'transparent' 
                      : hasClass 
                        ? themeColors.text.primary 
                        : themeColors.text.tertiary
                  }}
                  title={hasClass ? `${dayData.classes.length} class(es)` : ''}
                >
                  {dayData.day}
                  
                  {/* Tooltip on hover for days with classes */}
                  {hasClass && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 w-48 sm:w-56">
                      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-black text-xs rounded-lg p-2 shadow-lg">
                        <div className="font-bold mb-1">
                          {dayData.classes.length} {dayData.classes.length === 1 ? 'Class' : 'Classes'}:
                        </div>
                        {dayData.classes.map((cls: Class, idx: number) => (
                          <div key={idx} className="mb-1 last:mb-0">
                            <div className="font-medium">{cls.title}</div>
                            <div className="text-gray-300 dark:text-gray-600">{cls.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Indicator dot for multiple classes */}
                  {dayData.classes.length > 1 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend & Class List */}
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Legend:</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: themeColors.accent.blue }} className="w-4 h-4 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Class scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded ring-2 ring-black dark:ring-white"></div>
                  <span className="text-gray-600 dark:text-gray-400">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Multiple classes</span>
                </div>
              </div>
            </div>

            {/* Classes List for Selected Month */}
            {upcomingClasses.filter(cls => {
              const clsDate = new Date(cls.scheduled_datetime); // ✅ Fixed
              return clsDate.getMonth() === currentMonth && clsDate.getFullYear() === currentYear;
            }).length > 0 && (
              <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">This Month's Classes:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {upcomingClasses
                    .filter((cls: Class) => {
                      const clsDate = new Date(cls.scheduled_datetime); // ✅ Parse timestamptz
                      return clsDate.getMonth() === currentMonth && clsDate.getFullYear() === currentYear;
                    })
                    .map((cls: Class) => (
                      <div 
                        key={cls.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded-lg text-sm"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{cls.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {cls.date} • {cls.time}
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(cls.meeting_link, "_blank")}
                          className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

    const renderNotEnrolled = () => (
    <div
      style={{ backgroundColor: themeColors.primary.lightGray }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full bg-white dark:bg-black rounded-2xl shadow-xl p-6 sm:p-8 text-center border-2 border-gray-200 dark:border-gray-700">
        
        <Users className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.accent.blue }} />
        
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
          You’re not enrolled yet
        </h2>

        <p className="text-sm sm:text-base mb-6" style={{ color: themeColors.text.secondary }}>
          Enroll in this class to access live sessions, notes, recordings, and announcements.
        </p>

        <button
          onClick={() => onPageChange('contact')}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition"
        >
          Register Now
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'upcoming':
        return renderUpcomingClasses();
      case 'notes':
        return renderClassNotes();
      case 'recordings':
        return renderRecordings();
      case 'schedule':
        return renderSchedule();
      default:
        return renderHomeContent();
    }
  };

  return (
  <>
    {loading ? (
      /* ---------------- LOADING ---------------- */
      <div
        style={{ backgroundColor: themeColors.primary.lightGray }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
            style={{ borderColor: themeColors.accent.blue }}
          />
          <p style={{ color: themeColors.text.primary }}>
            Loading classes...
          </p>
        </div>
      </div>

    ) : isEnrolled === false ? (
      /* ---------------- NOT ENROLLED ---------------- */
      renderNotEnrolled()

    ) : (
      /* ---------------- ENROLLED (EXISTING UI) ---------------- */
      <div
        style={{ backgroundColor: themeColors.primary.lightGray }}
        className="min-h-screen text-gray-900 dark:text-gray-100"
      >
        {/* Floating Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ backgroundColor: themeColors.accent.blue }}
          className="fixed left-3 sm:left-4 lg:left-6 top-20 sm:top-24 md:top-28 lg:top-32 z-50 text-gray-900 dark:text-gray-100 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Floating Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64 sm:w-72 lg:w-80 overflow-y-auto`}
        >
          <div className="p-3 sm:p-4 lg:p-6 pt-32 sm:pt-36 md:pt-40 lg:pt-44">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 mt-6 sm:mt-8">
              Live Classes
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer text-left ${
                    currentSection === item.id
                      ? 'ring-2 ring-gray-900 dark:ring-gray-100'
                      : ''
                  }`}
                  style={{ backgroundColor: item.color }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {item.icon}
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                      {item.label}
                    </h3>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base">
                Quick Stats
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Classes This Week:</span>
                  <span className="font-medium">{upcomingClasses.length}</span>
                </div>
              </div>
            </div>

            {/* User Timezone Info */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-6 sm:pb-8 lg:pb-12">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8 pl-12 sm:pl-16 md:pl-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 px-2 sm:px-4">
              {currentSection === 'home'
                ? 'Live Classes'
                : sidebarItems.find(
                    (item) => item.id === currentSection
                  )?.label}
            </h1>
            {currentSection === 'home' && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg px-2 sm:px-4">
                Your comprehensive learning dashboard
              </p>
            )}
          </div>

          {renderContent()}
        </div>

        {/* Footer (UNCHANGED) */}
        {/* ⬇️ Your existing footer stays exactly as-is ⬇️ */}
      </div>
    )}
  </>
);
}