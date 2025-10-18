import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis } = body

    console.log("[v0] Cheatsheet request received, analysis length:", analysis?.length)

    if (!analysis) {
      console.error("[v0] No analysis provided")
      return NextResponse.json({ error: "Analysis is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("[v0] OPENAI_API_KEY not found in environment")
      return NextResponse.json({ 
        error: "OpenAI API key is not configured" 
      }, { status: 500 })
    }

    console.log("[v0] Starting cheatsheet generation...")

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
            content: `Create a comprehensive interview cheat sheet based on this job analysis. Focus on core concepts, definitions, and practical examples with proper structure.

CRITICAL FORMATTING RULES:
- Use **Main Topic** format for primary sections followed by bullet points
- Use bullet points (•) for definitions and sub-concepts
- Always include practical code examples in \`\`\`language format after explanations
- Each concept should have clear definition followed by code example
- Format: **Topic Name**
  • Definition or explanation
  • Key points about the concept
  \`\`\`language
  code example here
  \`\`\`

Structure the cheat sheet with these sections:

**CORE TECHNICAL CONCEPTS & DEFINITIONS**
For each main technology, provide fundamental concepts with code examples.

**ESSENTIAL TERMINOLOGY & DEFINITIONS**
Provide clear definitions for technical terms with practical code examples.

**CODE PATTERNS & BEST PRACTICES**
Provide 15-20 essential coding patterns with examples.

**COMMON ALGORITHMS WITH EXPLANATIONS**
Provide 10-12 fundamental algorithms with code.

**FRAMEWORK SPECIFIC IMPLEMENTATIONS**
Based on job requirements, provide framework examples.

**DATABASE OPERATIONS & SQL**
Provide 8-10 essential database patterns.

**COMMON INTERVIEW CODING CHALLENGES**
Provide 10-12 popular interview questions with solutions.

**DEBUGGING & TESTING PATTERNS**
Provide debugging and testing examples.

**QUICK REFERENCE COMMANDS**
Essential commands for development.

Job Analysis:
${analysis}

Generate comprehensive, practical content with emphasis on core concepts and hands-on examples.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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

    console.log("[v0] Cheatsheet generated, text length:", text?.length)

    if (!text) {
      console.error("[v0] Empty response from OpenAI")
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 500 })
    }

    return NextResponse.json({ cheatsheet: text })

  } catch (error: any) {
    console.error("[v0] Error generating cheatsheet:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ 
      error: "Failed to generate cheat sheet",
      details: error.message 
    }, { status: 500 })
  }
}
