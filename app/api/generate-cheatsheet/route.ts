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
      prompt: `Create a comprehensive interview cheat sheet based on this job analysis. IMPORTANT FORMATTING RULES:
- Use **bold** ONLY for keywords/technologies, not entire sentences
- Every section MUST have substantial content (minimum 5-8 detailed points)
- Provide clear, detailed explanations that help with interview preparation
- No empty sections or brief fragments allowed

Structure the cheat sheet with these sections:

**CORE TECHNICAL SKILLS**
List 8-12 key technologies with detailed explanations:
- **Technology Name**: Detailed description of what it is, why it's important for this role, and how it's commonly used. Include version specifics if relevant.

**KEY CONCEPTS & METHODOLOGIES** 
6-10 important concepts with comprehensive explanations:
- **Concept Name**: Full explanation of the methodology, when it's used, benefits, and how it relates to the role.

**COMMON INTERVIEW QUESTIONS**
12-15 detailed questions with answer guidelines:
- Question text with clear, structured answer points covering what interviewers want to hear.

**CODE EXAMPLES & SNIPPETS**
6-8 practical examples with context:
- **Example Title**: Code snippet with explanation of purpose, common use cases, and key points to mention in interviews.

**STUDY RESOURCES & REFERENCES**
Comprehensive learning materials organized by category:
- **Books**: Specific titles with brief descriptions
- **Documentation**: Official docs and key sections to focus on  
- **Practice Platforms**: Coding platforms and specific areas to practice
- **Courses**: Recommended online courses or tutorials

**QUICK REFERENCE GUIDE**
Essential commands, syntax, and formulas organized by technology:
- **Technology**: Most important commands/syntax with brief explanations

**LAST-MINUTE REVIEW CHECKLIST**
Critical points to remember before the interview:
- Key talking points, common mistakes to avoid, and confidence boosters

Job Analysis:
${analysis}

Make every point detailed and interview-focused. Ensure no section is empty and all content is substantial enough to be genuinely helpful for interview preparation.`,
    })

    return NextResponse.json({ cheatsheet: text })
  } catch (error) {
    console.error("Error generating cheat sheet:", error)
    return NextResponse.json({ error: "Failed to generate cheat sheet" }, { status: 500 })
  }
}
