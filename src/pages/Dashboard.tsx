import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LogoDropdown } from "@/components/LogoDropdown";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Clock,
  CheckSquare,
  Plus,
  Timer,
  Play,
  Pause,
  StopCircle,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  ChevronDown,
  ListChecks,
  GripVertical,
  ArrowLeft,
  Moon,
  Sun,
} from "lucide-react";

type Priority = "low" | "medium" | "high";
type Tab = "overview" | "subjects" | "tasks" | "timer";

const priorityColors: Record<Priority, string> = {
  low: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  medium: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  high: "bg-destructive/20 text-destructive border-destructive/30",
};

const subjectColors = [
  "#4A6FA5", "#5B8C5A", "#C17817", "#9B59B6",
  "#E67E22", "#1ABC9C", "#E74C3C", "#3498DB",
  "#2ECC71", "#F39C12", "#8E44AD", "#16A085",
];

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const subjects = useQuery(api.subjects.list);
  const tasks = useQuery(api.tasks.list, {});
  const todaySessions = useQuery(api.studySessions.list, {
    date: new Date().toISOString().split("T")[0],
  });
  const stats = useQuery(api.studySessions.getStats);

  const createSubject = useMutation(api.subjects.create);
  const removeSubject = useMutation(api.subjects.remove);
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggleComplete);
  const removeTask = useMutation(api.tasks.remove);
  const createSession = useMutation(api.studySessions.create);
  const removeSession = useMutation(api.studySessions.remove);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(subjectColors[0]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerSubject, setTimerSubject] = useState("");
  const [timerNotes, setTimerNotes] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const activeTasks = tasks?.filter((t) => !t.completed) ?? [];
  const completedTasks = tasks?.filter((t) => t.completed) ?? [];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const handleStartTimer = () => {
    if (!timerSubject) return;
    setTimerRunning(true);
  };

  const handleStopTimer = async () => {
    setTimerRunning(false);
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    if (minutes > 0 && timerSubject) {
      await createSession({
        subjectId: timerSubject as any,
        duration: minutes,
        date: today,
        notes: timerNotes || undefined,
      });
    }
    setTimerSeconds(0);
    setTimerNotes("");
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    await createSubject({
      name: newSubjectName.trim(),
      color: newSubjectColor,
      description: newSubjectDesc.trim() || undefined,
    });
    setNewSubjectName("");
    setNewSubjectDesc("");
    setNewSubjectColor(subjectColors[0]);
    setShowNewSubject(false);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !newTaskSubject) return;
    await createTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      subjectId: newTaskSubject as any,
      priority: newTaskPriority,
    });
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskSubject("");
    setNewTaskPriority("medium");
    setShowNewTask(false);
  };

  const totalStudyMinutes = stats?.totalMinutes ?? 0;
  const sessionCount = stats?.totalSessions ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "subjects", label: "Subjects", icon: BookOpen },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "timer", label: "Timer", icon: Timer },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <LogoDropdown />
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              <span className="font-serif">Study Notebook</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            {user?.name && (
              <span className="text-sm text-muted-foreground hidden md:block">
                {user.name}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation - Notebook margin tabs */}
      <div className="border-b border-border/60 bg-card/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.key ? "text-accent" : ""}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1">
        {/* Notebook margin ruler decoration */}
        <div className="hidden lg:block fixed left-[max(0px,calc(50%-640px))] top-14 bottom-0 w-px bg-border/30 z-10" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* ==================== OVERVIEW TAB ==================== */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="notebook-card rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            Total Study Time
                          </p>
                        </div>
                      </div>
                      <p className="text-3xl font-serif font-bold text-foreground">
                        {formatTime(totalStudyMinutes)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        across {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="notebook-card rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            Active Tasks
                          </p>
                        </div>
                      </div>
                      <p className="text-3xl font-serif font-bold text-foreground">
                        {activeTasks.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {completedTasks.length} completed
                      </p>
                    </div>

                    <div className="notebook-card rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            Subjects
                          </p>
                        </div>
                      </div>
                      <p className="text-3xl font-serif font-bold text-foreground">
                        {subjects?.length ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        courses being tracked
                      </p>
                    </div>
                  </div>

                  {/* Today's Sessions */}
                  <div className="notebook-card rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        Today's Study Sessions
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("timer")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Log session
                      </Button>
                    </div>
                    {todaySessions && todaySessions.length > 0 ? (
                      <div className="space-y-2">
                        {todaySessions.map((session) => (
                          <div
                            key={session._id}
                            className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: session.subjectColor }}
                              />
                              <span className="text-sm text-foreground">
                                {session.subjectName}
                              </span>
                              {session.notes && (
                                <span className="text-xs text-muted-foreground handwriting">
                                  — {session.notes}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {formatTime(session.duration)}
                              </Badge>
                              <button
                                onClick={() => removeSession({ id: session._id })}
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No sessions logged today yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("timer")}
                          className="mt-3"
                        >
                          Start a Study Session
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Subject Time Breakdown */}
                  {stats && stats.sessionsBySubject.length > 0 && (
                    <div className="notebook-card rounded-lg p-5">
                      <h3 className="font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        Study Time by Subject
                      </h3>
                      <div className="space-y-3">
                        {stats.sessionsBySubject.map((item) => (
                          <div key={item.subjectName}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: item.subjectColor }}
                                />
                                <span className="text-foreground">{item.subjectName}</span>
                              </div>
                              <span className="text-muted-foreground font-mono text-xs">
                                {formatTime(item.minutes)}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(item.minutes / totalStudyMinutes) * 100}%`,
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.subjectColor }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== SUBJECTS TAB ==================== */}
              {activeTab === "subjects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif font-bold text-xl text-foreground">
                      Your Subjects
                    </h2>
                    <Button
                      onClick={() => setShowNewSubject(!showNewSubject)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subject
                    </Button>
                  </div>

                  {/* New Subject Form */}
                  <AnimatePresence>
                    {showNewSubject && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="notebook-card rounded-lg p-5 mb-4 space-y-4">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                              Subject Name
                            </label>
                            <Input
                              value={newSubjectName}
                              onChange={(e) => setNewSubjectName(e.target.value)}
                              placeholder="e.g. Mathematics, History..."
                              className="bg-background"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                              Description (optional)
                            </label>
                            <Textarea
                              value={newSubjectDesc}
                              onChange={(e) => setNewSubjectDesc(e.target.value)}
                              placeholder="Brief description..."
                              className="bg-background resize-none"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                              Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {subjectColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setNewSubjectColor(color)}
                                  className={`w-7 h-7 rounded-full transition-all duration-200 ${
                                    newSubjectColor === color
                                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                                      : "hover:scale-110"
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button
                              onClick={handleCreateSubject}
                              disabled={!newSubjectName.trim()}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              size="sm"
                            >
                              Create Subject
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setShowNewSubject(false)}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Subjects List */}
                  {subjects && subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjects.map((subject) => (
                        <motion.div
                          key={subject._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="notebook-card rounded-lg p-5 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded mt-0.5"
                                style={{ backgroundColor: subject.color }}
                              />
                              <div>
                                <h3 className="font-serif font-semibold text-foreground">
                                  {subject.name}
                                </h3>
                                {subject.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 handwriting">
                                    {subject.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeSubject({ id: subject._id })}
                              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete subject"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 notebook-card rounded-lg">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">
                        No subjects yet
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        Add your first subject to get started
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TASKS TAB ==================== */}
              {activeTab === "tasks" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif font-bold text-xl text-foreground">
                      Tasks
                    </h2>
                    <Button
                      onClick={() => setShowNewTask(!showNewTask)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      size="sm"
                      disabled={!subjects || subjects.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {subjects && subjects.length === 0 && (
                    <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-3">
                      Add a subject first before creating tasks.
                    </div>
                  )}

                  {/* New Task Form */}
                  <AnimatePresence>
                    {showNewTask && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="notebook-card rounded-lg p-5 mb-4 space-y-4">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                              Task Title
                            </label>
                            <Input
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="e.g. Read chapter 5"
                              className="bg-background"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                              Description (optional)
                            </label>
                            <Textarea
                              value={newTaskDesc}
                              onChange={(e) => setNewTaskDesc(e.target.value)}
                              placeholder="Details..."
                              className="bg-background resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                                Subject
                              </label>
                              <select
                                value={newTaskSubject}
                                onChange={(e) => setNewTaskSubject(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="">Select subject</option>
                                {subjects?.map((s) => (
                                  <option key={s._id} value={s._id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                                Priority
                              </label>
                              <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button
                              onClick={handleCreateTask}
                              disabled={!newTaskTitle.trim() || !newTaskSubject}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              size="sm"
                            >
                              Create Task
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setShowNewTask(false)}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active Tasks */}
                  {activeTasks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        Active ({activeTasks.length})
                      </h3>
                      {activeTasks.map((task) => (
                        <motion.div
                          key={task._id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="notebook-card rounded-lg p-4 flex items-start gap-3 group"
                        >
                          <button
                            onClick={() => toggleTask({ id: task._id })}
                            className="mt-0.5"
                          >
                            <div className="notebook-check">
                              {task.completed && (
                                <CheckSquare className="h-3 w-3" />
                              )}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground">
                                {task.title}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 border ${priorityColors[task.priority as Priority]}`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: task.subjectColor }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {task.subjectName}
                              </span>
                              {task.description && (
                                <span className="text-xs text-muted-foreground/60 handwriting">
                                  — {task.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeTask({ id: task._id })}
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all mt-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Completed Tasks */}
                  {completedTasks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 pt-2">
                        <CheckSquare className="h-4 w-4" />
                        Completed ({completedTasks.length})
                      </h3>
                      {completedTasks.map((task) => (
                        <motion.div
                          key={task._id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="notebook-card rounded-lg p-4 flex items-start gap-3 group opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <button
                            onClick={() => toggleTask({ id: task._id })}
                            className="mt-0.5"
                          >
                            <div
                              className="notebook-check"
                              data-checked="true"
                            >
                              <CheckSquare className="h-3 w-3 text-primary-foreground" />
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-muted-foreground line-through">
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: task.subjectColor }}
                              />
                              <span className="text-xs text-muted-foreground/60">
                                {task.subjectName}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {tasks && tasks.length === 0 && (
                    <div className="text-center py-16 notebook-card rounded-lg">
                      <ListChecks className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">
                        No tasks yet
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        Create a task to start tracking your to-dos
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TIMER TAB ==================== */}
              {activeTab === "timer" && (
                <div className="space-y-6">
                  <h2 className="font-serif font-bold text-xl text-foreground">
                    Study Timer
                  </h2>

                  {subjects && subjects.length === 0 ? (
                    <div className="notebook-card rounded-lg p-8 text-center max-w-lg mx-auto">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-serif font-semibold text-foreground text-lg mb-2">
                        No Subjects Yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You need to add at least one subject before you can start a study session.
                      </p>
                      <Button
                        onClick={() => setActiveTab("subjects")}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add a Subject
                      </Button>
                    </div>
                  ) : (
                    <div className="notebook-card rounded-lg p-8 md:p-12 text-center max-w-lg mx-auto">
                      {/* Timer Display */}
                      <div className="mb-8">
                        <div className="text-6xl md:text-7xl font-mono font-bold text-foreground tracking-wider">
                          {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:
                          {String(timerSeconds % 60).padStart(2, "0")}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                          {timerRunning ? "Studying..." : "Ready to study"}
                        </p>
                      </div>

                      {/* Subject Selector */}
                      <div className="mb-6">
                        <label className="block text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider text-left">
                          Select Subject
                        </label>
                        <select
                          value={timerSubject}
                          onChange={(e) => setTimerSubject(e.target.value)}
                          disabled={timerRunning}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Choose a subject...</option>
                          {subjects?.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="mb-6">
                        <label className="block text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider text-left">
                          Notes (optional)
                        </label>
                        <Input
                          value={timerNotes}
                          onChange={(e) => setTimerNotes(e.target.value)}
                          placeholder="What are you studying?"
                          disabled={timerRunning}
                          className="bg-background"
                        />
                      </div>

                      {/* Timer Controls */}
                      <div className="flex items-center justify-center gap-4">
                        {!timerRunning ? (
                          <Button
                            onClick={handleStartTimer}
                            disabled={!timerSubject}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md px-8 py-6"
                          >
                            <Play className="h-5 w-5 mr-2" />
                            Start Studying
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => setTimerRunning(false)}
                              variant="outline"
                              className="border-2 px-6 py-6"
                            >
                              <Pause className="h-5 w-5 mr-2" />
                              Pause
                            </Button>
                            <Button
                              onClick={handleStopTimer}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md px-6 py-6"
                            >
                              <StopCircle className="h-5 w-5 mr-2" />
                              Stop & Save
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="text-center">
                    <hr className="notebook-divider max-w-xs mx-auto mb-4" />
                    <p className="text-xs text-muted-foreground handwriting">
                      Today: {formatTime(todaySessions?.reduce((s, sess) => s + sess.duration, 0) ?? 0)} studied
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
