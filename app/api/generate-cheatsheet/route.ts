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
      prompt: `Create a comprehensive interview cheat sheet based on this job analysis. Focus on core concepts, definitions, and practical examples with proper structure.

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
For each main technology, provide fundamental concepts:
- **Programming Language Fundamentals**
  • Variable declaration and data types
  • Control structures (conditionals, loops)
  • Functions and methods
  • Object-oriented concepts
  • Error handling
- **Framework/Library Specific Concepts**
  • Core components and their purposes
  • State management principles
  • Event handling mechanisms
  • Data flow patterns
- **Database Concepts**
  • SQL fundamentals and query types
  • Database design principles
  • Transaction handling
  • Data relationships

**ESSENTIAL TERMINOLOGY & DEFINITIONS**
Provide clear definitions for technical terms:
- **Algorithm**: Step-by-step procedure for solving problems
  • Time complexity measures execution time
  • Space complexity measures memory usage
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

- **Data Structure**: Way of organizing and storing data
  • Arrays: Fixed-size sequential collection
  • Lists: Dynamic arrays that can grow/shrink
  • Dictionaries: Key-value pairs for fast lookup
  \`\`\`python
  # Array/List operations
  numbers = [1, 2, 3, 4, 5]
  numbers.append(6)  # Add element
  numbers.pop()      # Remove last element
  
  # Dictionary operations
  person = {"name": "John", "age": 30}
  person["city"] = "New York"  # Add key-value pair
  \`\`\`

**CODE PATTERNS & BEST PRACTICES**
Provide 15-20 essential coding patterns:
- **Variable Declaration & Types**
  • Variables store data values
  • Different languages have different type systems
  • Good naming conventions improve readability
  \`\`\`python
  # Python - Dynamic typing
  age = 25          # Integer
  height = 5.9      # Float
  name = "Alice"    # String
  is_active = True  # Boolean
  items = [1, 2, 3] # List
  \`\`\`

- **Function Definition**
  • Functions encapsulate reusable code
  • Parameters allow input, return values provide output
  • Proper function naming describes purpose
  \`\`\`python
  def calculate_area(length, width):
      """Calculate rectangle area."""
      return length * width
  
  result = calculate_area(5, 3)
  print(f"Area: {result}")
  \`\`\`

- **Conditional Logic**
  • If-else statements control program flow
  • Comparison operators: ==, !=, <, >, <=, >=
  • Logical operators: and, or, not
  \`\`\`python
  score = 85
  if score >= 90:
      grade = "A"
  elif score >= 80:
      grade = "B"
  elif score >= 70:
      grade = "C"
  else:
      grade = "F"
  print(f"Grade: {grade}")
  \`\`\`

- **Loop Structures**
  • For loops iterate over sequences
  • While loops continue until condition is false
  • Break and continue control loop execution
  \`\`\`python
  # For loop with range
  for i in range(5):
      print(f"Number: {i}")
  
  # While loop
  count = 0
  while count < 3:
      print(f"Count: {count}")
      count += 1
  
  # Loop through list
  fruits = ["apple", "banana", "cherry"]
  for fruit in fruits:
      print(fruit)
  \`\`\`

**COMMON ALGORITHMS WITH EXPLANATIONS**
Provide 10-12 fundamental algorithms:
- **Sorting Algorithm (Bubble Sort)**
  • Simple sorting algorithm that repeatedly steps through list
  • Compares adjacent elements and swaps if in wrong order
  • Time complexity: O(n²), Space complexity: O(1)
  \`\`\`python
  def bubble_sort(arr):
      n = len(arr)
      for i in range(n):
          for j in range(0, n - i - 1):
              if arr[j] > arr[j + 1]:
                  arr[j], arr[j + 1] = arr[j + 1], arr[j]
      return arr
  
  numbers = [64, 34, 25, 12, 22, 11, 90]
  sorted_numbers = bubble_sort(numbers)
  \`\`\`

- **Search Algorithm (Linear Search)**
  • Sequential search through each element
  • Returns index if found, -1 if not found
  • Time complexity: O(n), Space complexity: O(1)
  \`\`\`python
  def linear_search(arr, target):
      for i in range(len(arr)):
          if arr[i] == target:
              return i
      return -1
  
  numbers = [2, 4, 6, 8, 10]
  index = linear_search(numbers, 6)
  print(f"Found at index: {index}")
  \`\`\`

**FRAMEWORK SPECIFIC IMPLEMENTATIONS**
Based on job requirements, provide framework examples:
- **Web Framework (Flask/Express)**
  • Route definition handles HTTP requests
  • Middleware processes requests before reaching routes
  • Template rendering generates dynamic HTML
  \`\`\`python
  from flask import Flask, jsonify, request
  
  app = Flask(__name__)
  
  @app.route('/api/users', methods=['GET'])
  def get_users():
      return jsonify({"users": ["Alice", "Bob", "Charlie"]})
  
  @app.route('/api/users', methods=['POST'])
  def create_user():
      data = request.get_json()
      return jsonify({"message": "User created", "user": data})
  
  if __name__ == '__main__':
      app.run(debug=True)
  \`\`\`

**DATABASE OPERATIONS & SQL**
Provide 8-10 essential database patterns:
- **Basic CRUD Operations**
  • CREATE: Insert new records
  • READ: Select and retrieve data
  • UPDATE: Modify existing records
  • DELETE: Remove records
  \`\`\`sql
  -- Create table
  CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Insert data
  INSERT INTO users (name, email) 
  VALUES ('John Doe', 'john@example.com');
  
  -- Select data
  SELECT * FROM users WHERE name LIKE '%John%';
  
  -- Update data
  UPDATE users SET email = 'newemail@example.com' WHERE id = 1;
  
  -- Delete data
  DELETE FROM users WHERE id = 1;
  \`\`\`

- **JOIN Operations**
  • INNER JOIN: Returns matching records from both tables
  • LEFT JOIN: Returns all records from left table
  • RIGHT JOIN: Returns all records from right table
  \`\`\`sql
  -- Inner join example
  SELECT u.name, o.total, o.created_at
  FROM users u
  INNER JOIN orders o ON u.id = o.user_id
  WHERE o.total > 100;
  
  -- Left join with aggregate
  SELECT u.name, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  GROUP BY u.id, u.name;
  \`\`\`

**COMMON INTERVIEW CODING CHALLENGES**
Provide 10-12 popular interview questions:
- **Reverse String**
  • Multiple approaches: slicing, loop, recursion
  • Consider edge cases: empty string, single character
  \`\`\`python
  # Method 1: Slicing (most Pythonic)
  def reverse_string_slice(s):
      return s[::-1]
  
  # Method 2: Loop
  def reverse_string_loop(s):
      result = ""
      for char in s:
          result = char + result
      return result
  
  # Method 3: Built-in function
  def reverse_string_builtin(s):
      return ''.join(reversed(s))
  \`\`\`

- **Fibonacci Sequence**
  • Classic recursion and dynamic programming example
  • Multiple implementations with different time complexities
  \`\`\`python
  # Recursive approach (inefficient)
  def fibonacci_recursive(n):
      if n <= 1:
          return n
      return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)
  
  # Dynamic programming approach (efficient)
  def fibonacci_dp(n):
      if n <= 1:
          return n
      dp = [0] * (n + 1)
      dp[1] = 1
      for i in range(2, n + 1):
          dp[i] = dp[i-1] + dp[i-2]
      return dp[n]
  \`\`\`

**DEBUGGING & TESTING PATTERNS**
Provide debugging and testing examples:
- **Error Handling**
  • Try-catch blocks prevent program crashes
  • Specific exception types provide better error handling
  • Finally blocks ensure cleanup code runs
  \`\`\`python
  def safe_divide(a, b):
      try:
          result = a / b
          return result
      except ZeroDivisionError:
          print("Error: Cannot divide by zero")
          return None
      except TypeError:
          print("Error: Invalid input types")
          return None
      finally:
          print("Division operation completed")
  \`\`\`

- **Unit Testing**
  • Test individual functions or methods
  • Arrange-Act-Assert pattern
  • Test edge cases and error conditions
  \`\`\`python
  import unittest
  
  class TestMathOperations(unittest.TestCase):
      def test_addition(self):
          result = add(2, 3)
          self.assertEqual(result, 5)
      
      def test_division_by_zero(self):
          with self.assertRaises(ZeroDivisionError):
              divide(10, 0)
      
      def test_empty_list(self):
          result = sum_list([])
          self.assertEqual(result, 0)
  \`\`\`

**QUICK REFERENCE COMMANDS**
Essential commands for development:
- **Git Commands**
  • Version control for code management
  • Branching allows parallel development
  • Merging combines changes from different branches
  \`\`\`bash
  # Basic Git workflow
  git clone https://github.com/user/repo.git
  git checkout -b feature-branch
  git add .
  git commit -m "Add new feature"
  git push origin feature-branch
  git checkout main
  git merge feature-branch
  \`\`\`

- **Package Management**
  • Package managers handle dependencies
  • Virtual environments isolate project dependencies
  \`\`\`bash
  # Python pip commands
  pip install package_name
  pip install -r requirements.txt
  pip freeze > requirements.txt
  
  # Virtual environment
  python -m venv myenv
  source myenv/bin/activate  # Linux/Mac
  myenv\\Scripts\\activate   # Windows
  \`\`\`

CONTENT REQUIREMENTS:
- Focus on fundamental concepts with clear definitions
- Every major topic must include practical code examples
- Provide multiple approaches where applicable
- Include time/space complexity for algorithms
- Cover common pitfalls and best practices
- Use bullet points for better readability
- Ensure code examples are complete and runnable

Job Analysis:
${analysis}

Generate comprehensive, practical content with emphasis on core concepts and hands-on examples.`,
    })

    return NextResponse.json({ cheatsheet: text })
  } catch (error) {
    console.error("Error generating cheat sheet:", error)
    return NextResponse.json({ error: "Failed to generate cheat sheet" }, { status: 500 })
  }
}
