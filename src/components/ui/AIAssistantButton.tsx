import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  X,
  Sparkles,
  Send,
  Navigation,
  RotateCcw,
  BookOpen,
  LayoutDashboard,
  Eye,
  BarChart3,
  Target,
  Database,
  Bot,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { askGeminiAssistant, type ChatMessage } from '../../services/geminiService'

const quickNavButtons = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/' },
  { label: 'Crowd Intel', icon: Eye, route: '/crowd-analytics' },
  { label: 'Sales Insights', icon: BarChart3, route: '/sales' },
  { label: 'Competitors', icon: Target, route: '/competitors' },
  { label: 'Uploads', icon: Database, route: '/dataset' },
]

const suggestedQuestions = [
  'What are our top selling product categories?',
  'Which branch generated the most revenue?',
  'What is our Diwali festival demand forecast?',
  'How do our prices compare to Amazon and Flipkart?',
]

interface AIAssistantButtonProps {
  onRestartTutorial?: () => void
}

const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({ onRestartTutorial }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "👋 Hi! I'm your **VOCiQ Gemini AI Analyst**. I have full access to your business KPIs, branches, footfall, competitor benchmarks, and uploaded datasets. Ask me anything!",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { business } = useAuth()
  const { businessData, staffData } = useData()
  const navigate = useNavigate()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSendQuery = async (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await askGeminiAssistant(
        trimmed,
        messages,
        business,
        businessData,
        staffData
      )

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: response.text,
        isBot: true,
        navigateTo: response.navigateTo,
        label: response.label,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMsg])

      // Auto navigate if Gemini detected an intent to open a page
      if (response.navigateTo) {
        setTimeout(() => {
          navigate(response.navigateTo!)
          setIsOpen(false)
        }, 1800)
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `Error contacting Gemini: ${err?.message || 'Please check your connection.'}`,
          isBot: true,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Chat cleared! Ask me anything about your retail numbers, branch expansion, or uploaded CSVs.",
        isBot: true,
        timestamp: new Date(),
      },
    ])
  }

  const handleQuickNav = (route: string, label: string) => {
    navigate(route)
    setIsOpen(false)
  }

  // Format message markdown basics (**bold** and bullet points)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold handling
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={idx} className={line.startsWith('•') || line.startsWith('-') ? 'pl-2 my-0.5' : 'my-1'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              )
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 w-[420px] max-w-[92vw] mb-3"
          >
            <div
              className="ai-assistant-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10 dark:bg-slate-900/95 bg-slate-900/95 backdrop-blur-xl text-white"
              style={{ maxHeight: '560px' }}
            >
              {/* Header */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">VOCiQ Copilot</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Gemini 3.8 Flash
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70">Trained on your store data & CSVs</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearChat}
                    title="Clear Chat"
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div
                className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
                style={{ maxHeight: '290px', minHeight: '180px' }}
              >
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 ${
                      msg.isBot ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {msg.isBot && (
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-indigo-300" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.isBot
                          ? 'bg-white/[0.08] border border-white/10 text-slate-100 rounded-tl-sm'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {msg.navigateTo && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-indigo-300">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium">
                            <Navigation className="w-3 h-3 animate-spin" />
                            <span>Navigating to {msg.label || msg.navigateTo}...</span>
                          </div>
                          <button
                            onClick={() => {
                              navigate(msg.navigateTo!)
                              setIsOpen(false)
                            }}
                            className="px-2 py-0.5 rounded bg-indigo-500/30 hover:bg-indigo-500/50 text-[10px] text-white"
                          >
                            Go Now
                          </button>
                        </div>
                      )}
                    </div>

                    {!msg.isBot && (
                      <div className="w-6 h-6 rounded-lg bg-purple-500/30 border border-purple-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-purple-300" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.08] border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Analyzing retail metrics…</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Chips */}
              <div className="px-3 py-1.5 border-t border-white/5 flex-shrink-0 bg-white/[0.02]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-1.5">
                  Suggested Prompts
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(q)}
                      disabled={isLoading}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Nav Row */}
              <div className="px-3 py-1.5 border-t border-white/5 flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {quickNavButtons.map(btn => (
                    <button
                      key={btn.route}
                      onClick={() => handleQuickNav(btn.route, btn.label)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <btn.icon className="w-3 h-3 text-indigo-400" />
                      {btn.label}
                    </button>
                  ))}
                </div>

                {onRestartTutorial && (
                  <button
                    onClick={() => {
                      onRestartTutorial()
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/50 hover:text-white/80 hover:bg-white/10"
                    title="Restart Platform Tour"
                  >
                    <BookOpen className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-white/10 flex-shrink-0 bg-black/20">
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSendQuery(inputValue)
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask Gemini about sales, branches, stock..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-indigo-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 relative ${
          isOpen
            ? 'bg-slate-900 border border-white/20'
            : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500'
        }`}
        style={!isOpen ? { boxShadow: '0 8px 32px rgba(99, 102, 241, 0.45)' } : {}}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                <Sparkles className="w-1.5 h-1.5 text-black" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring when closed */}
      {!isOpen && (
        <motion.div
          animate={{ scale: [1, 1.45], opacity: [0.35, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-indigo-500/30 pointer-events-none"
        />
      )}
    </div>
  )
}

export default AIAssistantButton
