import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  CheckSquare,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Track Subjects",
      description: "Organize your courses and subjects with color-coded notebooks.",
    },
    {
      icon: Clock,
      title: "Study Timer",
      description: "Log study sessions and watch your progress add up over time.",
    },
    {
      icon: CheckSquare,
      title: "Task Manager",
      description: "Keep track of assignments, homework, and deadlines.",
    },
    {
      icon: TrendingUp,
      title: "Progress Insights",
      description: "Visualize your study habits with intuitive charts and stats.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-serif tracking-tight text-foreground">
              Study Notebook
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                My Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-foreground hover:bg-secondary"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1">
        {/* Notebook page background effect */}
        <div className="absolute inset-0 notebook-page opacity-[0.03] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            {/* Annotation accent */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky-note inline-block px-4 py-2 mb-8 rounded-sm"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Your personal academic companion
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight tracking-tight text-foreground"
            >
              Your Study Journey,
              <br />
              <span className="text-accent annotation-underline">One Page at a Time</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
            >
              A beautifully simple notebook-style study tracker. Log your study hours,
              manage assignments, and watch your progress grow — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md px-8 py-6 text-base"
              >
                Start Studying
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth")}
                className="border-2 border-border hover:bg-secondary px-8 py-6 text-base"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Decorative ruled lines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 space-y-2"
            >
              <hr className="notebook-divider" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="handwriting">— study smart, not hard</span>
                <span className="text-border">|</span>
                <span className="handwriting">— progress over perfection</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative margin line on large screens */}
        <div className="hidden lg:block absolute left-12 top-0 bottom-0 w-px bg-border/40" />
      </section>

      {/* Features Section */}
      <section className="border-t border-border/60 bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <span className="handwriting text-sm text-accent font-medium">
              Everything you need
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 text-foreground">
              Your Complete Study Toolkit
            </h2>
            <hr className="notebook-divider max-w-xs mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="notebook-card rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="handwriting text-sm text-accent font-medium">
              Ready to begin?
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 text-foreground">
              Start Your Study Notebook Today
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Join students who track their progress, stay organized, and achieve more
              with the simple power of a study notebook.
            </p>

            <div className="mt-8 notebook-page inline-block rounded-lg px-8 py-6">
              <div className="relative z-1">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md px-10 py-6 text-base"
                >
                  Create Your Free Notebook
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/80">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="font-serif">Study Notebook</span>
          </div>
          <p className="handwriting text-xs">— keep learning —</p>
        </div>
      </footer>
    </div>
  );
}
