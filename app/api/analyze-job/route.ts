import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables")
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file." },
        { status: 500 }
      )
    }

    const { jobDescription } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      prompt: `Analyze this job posting and extract key information for creating a study cheat sheet. Focus on:

1. Technical skills and technologies mentioned
2. Soft skills and competencies required
3. Knowledge areas and concepts to study
4. Common interview topics for this role
5. Practical experience areas

Job Posting:
${jobDescription}

Please provide a structured analysis that would help someone prepare for this role. Format your response as a detailed breakdown with clear sections and bullet points.`,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error analyzing job posting:", error)
    
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
    
    return NextResponse.json({ error: "Failed to analyze job posting" }, { status: 500 })
  }
}
