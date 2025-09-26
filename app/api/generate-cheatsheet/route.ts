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
      prompt: `Create a comprehensive interview cheat sheet based on this job analysis. Focus heavily on practical code examples, technical definitions, and core concepts with real implementations.

CRITICAL FORMATTING RULES:
- Use **keyword** format ONLY for the main concept/technology name followed by a colon
- The explanation should be in normal text, not bold
- Always include practical code examples in \`\`\`language format
- Each point should be a complete, flowing sentence without line breaks
- Example format: **Python Functions**: A reusable block of code that performs a specific task. \`\`\`python
def greet(name):
    return f"Hello, {name}!"
result = greet("World")
\`\`\`

Structure the cheat sheet with these sections (each must have many practical sub-concepts):

**CORE TECHNICAL SKILLS & DEFINITIONS**
For each main technology, provide 4-6 core concepts with definitions and code examples:
- **Main Technology**: Brief definition
- **Sub-concept 1**: Definition and practical code example
- **Sub-concept 2**: Definition and practical code example
- **Sub-concept 3**: Definition and practical code example
- **Sub-concept 4**: Definition and practical code example
Examples should include:
- Variable declarations and data types
- Functions and methods
- Control structures (if/else, loops)
- Classes and objects
- Error handling
- File operations

**ESSENTIAL CODE PATTERNS & EXAMPLES**
Provide 12-20 specific coding patterns with complete examples:
- **PATTERN NAME IN CAPS**: Brief description followed by complete code block
Examples like:
- **LOADING DATA FROM FILE**: 
\`\`\`python
import pandas as pd
data = pd.read_csv('data.csv')
print(data.head())
\`\`\`
- **CREATING API ENDPOINT**:
\`\`\`python
from flask import Flask, jsonify
app = Flask(__name__)
@app.route('/api/data')
def get_data():
    return jsonify({'status': 'success'})
\`\`\`
- **DATABASE CONNECTION**:
\`\`\`python
import sqlite3
conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM users")
\`\`\`

**KEY ALGORITHMS & DATA STRUCTURES WITH CODE**
Provide 8-12 fundamental algorithms with implementations:
- **ALGORITHM NAME**: Time complexity explanation with complete code implementation
Examples:
- **BINARY SEARCH**: O(log n) search algorithm
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

**FRAMEWORK SPECIFIC IMPLEMENTATIONS**
For each relevant framework, provide 5-8 practical examples:
- **FRAMEWORK NAME**: Core concept with code
- **Component Creation**: Code example
- **State Management**: Code example
- **Event Handling**: Code example
- **Data Fetching**: Code example
- **Routing**: Code example

**COMMON INTERVIEW CODING CHALLENGES**
Provide 10-15 coding problems with solutions:
- Problem description followed by complete solution with explanation
Include classics like:
- **REVERSE A STRING**: 
\`\`\`python
def reverse_string(s):
    return s[::-1]
# Alternative: return ''.join(reversed(s))
\`\`\`
- **FIBONACCI SEQUENCE**:
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

**DEBUGGING & TESTING EXAMPLES**
Provide 6-10 debugging and testing patterns:
- **TEST CASE EXAMPLE**:
\`\`\`python
import unittest
class TestMyFunction(unittest.TestCase):
    def test_addition(self):
        self.assertEqual(add(2, 3), 5)
\`\`\`
- **ERROR HANDLING**:
\`\`\`python
try:
    result = risky_operation()
except ValueError as e:
    print(f"Error: {e}")
    result = default_value
\`\`\`

**DATABASE & SQL EXAMPLES**
Provide 8-12 SQL patterns and database operations:
- **CREATE TABLE**:
\`\`\`sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE
);
\`\`\`
- **JOIN OPERATIONS**:
\`\`\`sql
SELECT u.name, o.total 
FROM users u 
JOIN orders o ON u.id = o.user_id;
\`\`\`

**QUICK REFERENCE COMMANDS & SYNTAX**
Essential commands for each technology:
- **GIT COMMANDS**: 
\`\`\`bash
git clone <url>
git add .
git commit -m "message"
git push origin main
\`\`\`
- **DOCKER COMMANDS**:
\`\`\`bash
docker build -t myapp .
docker run -p 3000:3000 myapp
\`\`\`

CONTENT REQUIREMENTS:
- ALWAYS include practical code examples in proper code blocks
- Every major concept must have a working code example
- Focus on patterns that appear in real interviews
- Include multiple programming languages where relevant
- Provide complete, runnable code snippets
- Explain what each code example does and when to use it

Job Analysis:
${analysis}

Generate dense, code-heavy content with practical examples that demonstrate hands-on programming skills.`,
    })

    return NextResponse.json({ cheatsheet: text })
  } catch (error) {
    console.error("Error generating cheat sheet:", error)
    return NextResponse.json({ error: "Failed to generate cheat sheet" }, { status: 500 })
  }
}
