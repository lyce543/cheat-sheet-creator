import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobDescription } = body

    console.log("[v0] Job description received, length:", jobDescription?.length)

    if (!jobDescription) {
      console.error("[v0] No job description provided")
      return NextResponse.json({ error: "Job description is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("[v0] OPENAI_API_KEY not found in environment")
      return NextResponse.json({ 
        error: "OpenAI API key is not configured. Please add it to environment variables." 
      }, { status: 500 })
    }

    console.log("[v0] Starting OpenAI API call...")

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Analyze this job posting and extract key information for creating a study cheat sheet. Focus on:

1. Technical skills and technologies mentioned
2. Soft skills and competencies required
3. Knowledge areas and concepts to study
4. Common interview topics for this role
5. Practical experience areas

Job Posting:
${jobDescription}

Please provide a structured analysis that would help someone prepare for this role. Format your response as a detailed breakdown with clear sections and bullet points.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    console.log("[v0] OpenAI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API error:", response.status, errorText)
      return NextResponse.json({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    console.log("[v0] Analysis completed, text length:", text?.length)

    if (!text) {
      console.error("[v0] Empty response from OpenAI")
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 500 })
    }

    return NextResponse.json({ analysis: text })

  } catch (error: any) {
    console.error("[v0] Error analyzing job posting:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ 
      error: "Failed to analyze job posting",
      details: error.message 
    }, { status: 500 })
  }
}
