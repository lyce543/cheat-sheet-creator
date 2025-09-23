import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { analysis } = await request.json()

    if (!analysis) {
      return NextResponse.json({ error: "Analysis is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
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
    return NextResponse.json({ error: "Failed to generate cheat sheet" }, { status: 500 })
  }
}
