import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
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
    return NextResponse.json({ error: "Failed to analyze job posting" }, { status: 500 })
  }
}
