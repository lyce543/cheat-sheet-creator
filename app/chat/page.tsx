"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, FileText, Download, User, Bot, LogOut, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  type: "user" | "assistant" | "error"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your AI assistant for creating cheat sheets. Paste a job description below, and I'll analyze it to create a personalized study guide with all the key skills and topics you need to master.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCheatSheet, setGeneratedCheatSheet] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const jobDescription = input
    setInput("")
    setIsLoading(true)

    try {
      const analysisResponse = await fetch("/api/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze job posting")
      }

      const { analysis } = await analysisResponse.json()
      setCurrentAnalysis(analysis)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: analysis,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const cheatsheetResponse = await fetch("/api/generate-cheatsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysis }),
      })

      if (!cheatsheetResponse.ok) {
        throw new Error("Failed to generate cheat sheet")
      }

      const { cheatsheet } = await cheatsheetResponse.json()
      setGeneratedCheatSheet(cheatsheet)

      const cheatsheetMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content:
          "Perfect! I've generated your comprehensive cheat sheet. It includes detailed breakdowns of all the key skills, common interview questions, practical examples, and study resources. Click the download button below to get your PDF study guide.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, cheatsheetMessage])
    } catch (error) {
      console.error("Error processing job description:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content:
          "I'm sorry, there was an error analyzing the job posting. Please try again or check if you have a valid OpenAI API key configured.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!generatedCheatSheet) return

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: generatedCheatSheet }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "job-cheatsheet.pdf"
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      // Fallback: show the content in a new window for now
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(
          `<pre style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">${generatedCheatSheet}</pre>`,
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">CheatSheet Creator</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Study Guide Generator</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <FileText className="h-4 w-4 mr-2" />
              History
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {(message.type === "assistant" || message.type === "error") && (
                  <div className="flex-shrink-0">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.type === "error" ? "bg-destructive/10" : "bg-primary/10"
                      }`}
                    >
                      {message.type === "error" ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                )}

                <Card
                  className={`max-w-[80%] p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : message.type === "error"
                        ? "bg-destructive/10 border-destructive/20"
                        : "bg-card border-border/40"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </Card>

                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <Card className="bg-card border-border/40 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing job posting...</span>
                  </div>
                </Card>
              </div>
            )}

            {generatedCheatSheet && (
              <div className="flex justify-center">
                <Card className="bg-primary/5 border-primary/20 p-6 max-w-md">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Cheat Sheet Ready!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your personalized study guide has been generated and is ready for download.
                    </p>
                    <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary/90">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a job description here to generate a cheat sheet..."
              className="flex-1 min-h-[60px] max-h-[120px] bg-input border-border resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="bg-primary hover:bg-primary/90 px-6">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
