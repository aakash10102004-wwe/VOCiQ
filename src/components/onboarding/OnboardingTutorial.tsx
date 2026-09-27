import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Eye, BarChart3, Target, Brain, Database,
  ArrowRight, ArrowLeft, X, Check, Rocket,
  TrendingUp, Users, Sparkles, ShoppingBag
} from 'lucide-react'

interface OnboardingTutorialProps {
  onComplete: () => void
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to VOCiQ',
    subtitle: 'Your AI-powered retail intelligence platform.',
    description: 'Understand your stores, products, and customers with smart analytics. Let us give you a quick tour of the 6 key sections.',
    icon: Rocket,
    color: 'from-primary-500 to-purple-600',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    features: [
      { icon: LayoutDashboard, label: 'Overview Dashboard', desc: 'KPIs and quick insights' },
      { icon: Eye, label: 'Crowd Analytics', desc: 'Live monitoring & heatmaps' },
      { icon: BarChart3, label: 'Sales & Insights', desc: 'Products & customers' },
      { icon: Target, label: 'Competitor Intel', desc: 'Market comparison' },
      { icon: Brain, label: 'Predictions', desc: 'AI forecasting' },
      { icon: Database, label: 'Dataset & Analysis', desc: 'Upload & analyze' },
    ]
  },
  {
    id: 'dashboard',
    title: 'Overview Dashboard',
    subtitle: 'Your command center at a glance.',
    description: 'See total visitors, sales summary, conversion rate, quick AI insights, and real-time alerts — all in one clean view.',
    icon: LayoutDashboard,
    color: 'from-primary-500 to-violet-500',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    highlights: [
      { icon: ShoppingBag, title: 'Sales & Revenue', desc: 'Track total sales, transactions, and revenue trends across all branches.' },
      { icon: Users, title: 'Visitor Metrics', desc: 'See daily visitors, conversion rates, and quick insights powered by AI.' },
      { icon: Sparkles, title: 'Smart Alerts', desc: 'Business health score and AI-generated alerts for staffing, demand, and more.' },
    ]
  },
  {
    id: 'crowd',
    title: 'Crowd Analytics',
    subtitle: 'Monitor foot traffic and crowd density.',
    description: 'Live CCTV feeds, multi-branch monitoring, crowd density heatmaps, and footfall analytics — all organized with tabs.',
    icon: Eye,
    color: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    highlights: [
      { icon: Eye, title: 'Live Camera Feeds', desc: 'Demo cameras with crowd simulation, or connect your own CCTV system.' },
      { icon: TrendingUp, title: 'Density Heatmaps', desc: 'Weekly heatmaps showing visitor intensity by hour and day of week.' },
      { icon: BarChart3, title: 'Footfall Analytics', desc: 'Branch comparison, hourly trends, and peak hour detection.' },
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Customer Insights',
    subtitle: 'Products, customers, and basket analysis.',
    description: 'Product performance, customer journeys, frequently-bought-together analysis, and conversion optimization in one section.',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    highlights: [
      { icon: ShoppingBag, title: 'Product Performance', desc: 'Top sellers, category distribution, and product trend analysis.' },
      { icon: Users, title: 'Customer Behavior', desc: 'Customer journey mapping and in-store movement patterns.' },
      { icon: Sparkles, title: 'Basket Analysis', desc: 'AI finds frequently bought-together items for cross-selling opportunities.' },
    ]
  },
  {
    id: 'ready',
    title: "You're All Set!",
    subtitle: 'Explore your 6-section intelligence platform.',
    description: 'Navigate using the sidebar, or ask the AI chatbot to take you anywhere. Upload your data to unlock personalized insights!',
    icon: Check,
    color: 'from-emerald-500 to-green-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  }
]

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.25 }
  })
}

const featureCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, type: 'spring', stiffness: 260, damping: 25 }
  })
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const goNext = useCallback(() => {
    if (isLastStep) { onComplete(); return }
    setDirection(1)
    setCurrentStep(prev => prev + 1)
  }, [isLastStep, onComplete])

  const goBack = useCallback(() => {
    if (isFirstStep) return
    setDirection(-1)
    setCurrentStep(prev => prev - 1)
  }, [isFirstStep])

  const handleSkip = useCallback(() => { onComplete() }, [onComplete])

  const StepIcon = step.icon

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        variants={backdropVariants}
        initial="hidden" animate="visible" exit="exit"
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: `radial-gradient(circle, ${step.glowColor}, transparent 70%)` }}
            animate={{ x: ['-10%', '10%', '-10%'], y: ['-10%', '5%', '-10%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent 70%)' }}
            animate={{ x: ['10%', '-10%', '10%'], y: ['10%', '-5%', '10%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Skip button */}
        {!isLastStep && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white/80 transition-all duration-200 backdrop-blur-sm"
          >
            <X className="w-4 h-4" /> Skip Tour
          </motion.button>
        )}

        {/* Progress indicators */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {steps.map((_, i) => (
            <motion.div key={i} initial={false}>
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentStep ? 'w-8 bg-gradient-to-r ' + steps[i].color
                : i < currentStep ? 'w-4 bg-white/40' : 'w-4 bg-white/15'
              }`} />
            </motion.div>
          ))}
        </div>

        {/* Main content card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={cardVariants}
            initial="enter" animate="center" exit="exit"
            className="relative z-10 w-full max-w-2xl mx-4"
          >
            <div className="onboarding-card rounded-3xl p-8 md:p-10">
              {/* Step icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 }}
                className="mb-6"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}
                  style={{ boxShadow: `0 10px 40px ${step.glowColor}` }}
                >
                  <StepIcon className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-3xl md:text-4xl font-bold font-display text-white mb-2 tracking-tight"
              >
                {step.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }} className="text-lg text-white/60 font-medium mb-4">
                {step.subtitle}
              </motion.p>

              {/* Description */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.4 }} className="text-sm text-white/45 leading-relaxed mb-8 max-w-lg">
                {step.description}
              </motion.p>

              {/* Welcome step — 6 section grid */}
              {step.id === 'welcome' && step.features && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {step.features.map((feature, i) => (
                    <motion.div
                      key={feature.label}
                      custom={i}
                      variants={featureCardVariants}
                      initial="hidden" animate="visible"
                      className="onboarding-feature-card rounded-xl p-3.5 flex items-start gap-3 group cursor-default"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <feature.icon className="w-4 h-4 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/90">{feature.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Highlight cards for other steps */}
              {(step.id === 'dashboard' || step.id === 'crowd' || step.id === 'sales') && step.highlights && (
                <div className="space-y-3 mb-8">
                  {step.highlights.map((highlight, i) => (
                    <motion.div
                      key={highlight.title}
                      custom={i}
                      variants={featureCardVariants}
                      initial="hidden" animate="visible"
                      className="onboarding-highlight-card rounded-xl p-4 flex items-start gap-4 group"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} bg-opacity-20 flex items-center justify-center flex-shrink-0 opacity-80`}>
                        <highlight.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white/90">{highlight.title}</p>
                          <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
                            <ArrowRight className="w-3 h-3 text-white/30" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">{highlight.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Ready step — success animation */}
              {step.id === 'ready' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className="flex justify-center my-8"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl"
                      style={{ boxShadow: '0 10px 60px rgba(16, 185, 129, 0.4)' }}
                    >
                      <Check className="w-12 h-12 text-white" strokeWidth={3} />
                    </motion.div>
                    <motion.div animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full border-2 border-emerald-400" />
                    <motion.div animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 rounded-full border-2 border-emerald-400" />
                  </div>
                </motion.div>
              )}

              {/* Navigation buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex items-center justify-between"
              >
                <div>
                  {!isFirstStep && (
                    <button onClick={goBack}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/30 font-medium">{currentStep + 1} / {steps.length}</span>
                  <button onClick={goNext}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r ${step.color} hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
                    style={{ boxShadow: `0 6px 30px ${step.glowColor}` }}
                  >
                    {isFirstStep ? 'Start Tour' : isLastStep ? 'Go to Dashboard' : 'Next'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default OnboardingTutorial
