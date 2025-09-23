// File: app/api/generate-cheatsheet/route.ts

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
      prompt: `Create a comprehensive interview cheat sheet based on this job analysis. 

CRITICAL FORMATTING RULES:
- Use **keyword** format ONLY for the main concept/technology name followed by a colon
- The explanation should be in normal text, not bold
- Each point should be a complete, flowing sentence without line breaks
- No bullet points or dashes in explanations - use complete sentences
- Example: **Python**: A high-level programming language known for its simplicity and readability, essential for data science and web development.

Structure the cheat sheet with these sections (each must have 6-10 substantial entries):

**CORE TECHNICAL SKILLS**
Provide 8-10 key technologies with detailed explanations:
- **Technology**: Complete explanation in one flowing paragraph about what it is, why it's important, and how it's used.

**KEY CONCEPTS & METHODOLOGIES** 
Provide 6-8 important concepts:
- **Concept**: Full explanation of the methodology, benefits, and practical applications.

**COMMON INTERVIEW QUESTIONS**
Provide 10-12 essential questions with structured answer guidelines:
- Question followed by clear talking points about what to cover in your response.

**CODE EXAMPLES & SNIPPETS**
Provide 6-8 practical examples:
- **Example Name**: Brief code snippet followed by explanation of purpose and key points to mention.

**STUDY RESOURCES & REFERENCES**
Comprehensive learning materials:
- **Books**: 3-4 specific titles with brief descriptions
- **Documentation**: Key official docs to study  
- **Practice**: Coding platforms and practice areas
- **Courses**: Recommended online learning resources

**QUICK REFERENCE GUIDE**
Essential commands and syntax:
- **Technology**: Most important commands/syntax with concise explanations

**LAST-MINUTE REVIEW CHECKLIST**
Critical points for final preparation:
- Key confidence boosters and common pitfalls to avoid

CONTENT REQUIREMENTS:
- Every explanation must be 50-150 characters to ensure proper fitting
- No fragmented sentences across lines
- Use concise but complete explanations
- Focus on practical interview relevance
- Ensure every section has substantial, useful content

Job Analysis:
${analysis}

Generate dense, interview-focused content that fits well in a compact PDF layout.`,
    })

    return NextResponse.json({ cheatsheet: text })
  } catch (error) {
    console.error("Error generating cheat sheet:", error)
    return NextResponse.json({ error: "Failed to generate cheat sheet" }, { status: 500 })
  }
}
