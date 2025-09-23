import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Перевірка наявності API ключа
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables")
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file." },
        { status: 500 }
      )
    }

    const { analysis } = await request.json()

    if (!analysis) {
      return NextResponse.json({ error: "Analysis is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      prompt: `Based on this job analysis, create a comprehensive cheat sheet content that would be perfect for a PDF study guide. Include:

1. **Executive Summary** - Brief overview of the role requirements
2. **Technical Skills Breakdown** - Detailed explanations of each technology/skill
3. **Key Concepts** - Important theories, methodologies, and best practices
4. **Common Interview Questions** - Typical questions with brief answer guidelines
5. **Practical Examples** - Code snippets, scenarios, or real-world applications
6. **Study Resources** - Recommended learning materials and practice areas
7. **Quick Reference** - Checklists and summary points for last-minute review

Job Analysis:
${analysis}

Format this as a well-structured document that would work well in a PDF format with clear headings, bullet points, and organized sections. Make it comprehensive but concise - suitable for interview preparation.`,
    })

    return NextResponse.json({ cheatsheet: text })
  } catch (error) {
    console.error("Error generating cheat sheet:", error)
    
    // Більш детальна обробка помилок
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local file." },
          { status: 401 }
        )
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return NextResponse.json(
          { error: "OpenAI API quota exceeded. Please check your billing and usage limits." },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json({ error: "Failed to generate cheat sheet" }, { status: 500 })
  }
}
