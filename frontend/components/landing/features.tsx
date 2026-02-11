"use client"

import {
  Brain,
  Dumbbell,
  Salad,
  TrendingUp,
  Trophy,
  MessageCircle,
  HeartPulse,
  ShoppingCart,
  Calendar,
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Brain,
    title: "AI Health Assessment",
    description:
      "Get a comprehensive health profile with BMI analysis, personalized recommendations, and adaptive coaching from our AI engine.",
  },
  {
    icon: Dumbbell,
    title: "Smart Workout Plans",
    description:
      "AI-generated workout routines tailored to your fitness level, goals, and available equipment with video demonstrations.",
  },
  {
    icon: Salad,
    title: "Nutrition Guidance",
    description:
      "Personalized meal plans focusing on Indian cuisine with calorie tracking, macro breakdowns, and dietary preferences.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Visual charts and analytics for weight, body metrics, calories, steps, and mood over time to keep you motivated.",
  },
  {
    icon: Trophy,
    title: "Achievements & Charity",
    description:
      "Earn achievement badges for milestones. Every achievement unlocks micro-donations to health charities in your name.",
  },
  {
    icon: MessageCircle,
    title: "AROMI AI Coach",
    description:
      "Chat with AROMI anytime for fitness advice, motivation, form corrections, and real-time health insights.",
  },
  {
    icon: HeartPulse,
    title: "Holistic Wellness",
    description:
      "Track sleep, stress, water intake, and mood alongside workouts for a complete picture of your health journey.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Shopping List",
    description:
      "Auto-generated grocery lists from your meal plans with one-click links to order ingredients online.",
  },
  {
    icon: Calendar,
    title: "Schedule Integration",
    description:
      "Sync your workout schedule with your calendar so you never miss a training session.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function Features() {
  return (
    <section id="features" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            Features
          </p>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need for Your Wellness Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            From AI-driven assessments to gamified achievements, ArogyaMitra
            brings together every tool you need under one platform.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
