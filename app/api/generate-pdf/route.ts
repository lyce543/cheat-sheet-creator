// File: app/api/generate-pdf/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

interface Section {
  title: string
  content: string[]
  priority: number
  minHeight: number
}

interface Box {
  x: number
  y: number
  width: number
  height: number
  section: Section
}

interface TextSegment {
  text: string
  isBold: boolean
  isCode: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Create new PDF document in landscape orientation with explicit dimensions
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    // FIXED: Правильні розміри для landscape A4 (297x210mm)
    const pageWidth = doc.internal.pageSize.getWidth() // 297mm
    const pageHeight = doc.internal.pageSize.getHeight() // 210mm
    
    console.log(`PDF Dimensions: ${pageWidth}mm x ${pageHeight}mm`) // Debug info
    
    const margin = 8
    const headerHeight = 22 // Збільшено з 20 до 22
    const footerHeight = 5
    const availableWidth = pageWidth - (2 * margin) // 281mm
    const availableHeight = pageHeight - headerHeight - footerHeight - (2 * margin) // ~175mm

    console.log(`Available area: ${availableWidth}mm x ${availableHeight}mm`) // Debug info

    // Parse and clean content
    const sections = parseContentIntoSections(content)
      .filter(section => section.content.length > 0 && section.title.trim() !== '')
      .map(section => cleanAndOptimizeSection(section))
    
    // FIXED: Більш консервативний підхід до пакування
    const boxes = packSectionsWithSafeMargins(sections, availableWidth, availableHeight)

    // Add professional header with safe margins - ЗБІЛЬШЕНО РОЗМІР
    doc.setFillColor(30, 60, 140)
    doc.rect(0, 0, pageWidth, headerHeight, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18) // Збільшено з 16 до 18
    doc.setFont("helvetica", "bold")
    doc.text("Interview Preparation Cheat Sheet", margin, headerHeight / 2 + 4) // Трохи змістили вниз

    // Add generation date
    doc.setFontSize(9) // Збільшено з 8 до 9
    doc.setFont("helvetica", "normal")
    const date = new Date().toLocaleDateString('en-GB')
    doc.text(`Generated: ${date}`, pageWidth - margin - 35, headerHeight / 2 + 4)

    // FIXED: Рендеринг з перевіркою меж
    renderSectionsWithBoundaryCheck(doc, boxes, margin, headerHeight + margin)

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=interview-cheatsheet.pdf",
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

function parseContentIntoSections(content: string): Section[] {
  const sections: Section[] = []
  const lines = content.split('\n').filter(line => line.trim())
  
  let currentSection: Section | null = null
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.match(/^\*\*[^*]+\*\*$/) || trimmedLine.match(/^#{1,3}\s+/)) {
      if (currentSection && currentSection.content.length > 0) {
        sections.push(currentSection)
      }
      
      const title = trimmedLine.replace(/^\*\*|\*\*$|^#+\s+/g, '').toUpperCase()
      currentSection = {
        title,
        content: [],
        priority: getSectionPriority(title),
        minHeight: getMinHeight(title)
      }
    } else if (currentSection && trimmedLine && trimmedLine !== '---') {
      currentSection.content.push(trimmedLine)
    }
  }
  
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection)
  }
  
  return sections
}

function cleanAndOptimizeSection(section: Section): Section {
  const cleanedContent: string[] = []
  
  for (let line of section.content) {
    // Clean whitespace and format
    line = line.replace(/\s+/g, ' ').trim()
    
    if (line.length < 5) continue
    
    // Merge fragmented sentences
    if (cleanedContent.length > 0) {
      const lastLine = cleanedContent[cleanedContent.length - 1]
      
      if (lastLine.match(/[:-]$/) || line.match(/^(allow|and|or|but|with|for|in|to|of|at|being)\s/i)) {
        cleanedContent[cleanedContent.length - 1] = lastLine + ' ' + line
        continue
      }
    }
    
    cleanedContent.push(line)
  }
  
  return {
    ...section,
    content: cleanedContent
  }
}

function getSectionPriority(title: string): number {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('core') || titleLower.includes('technical')) return 10
  if (titleLower.includes('code') || titleLower.includes('examples') || titleLower.includes('snippets')) return 9
  if (titleLower.includes('interview') || titleLower.includes('questions')) return 8
  if (titleLower.includes('concepts') || titleLower.includes('terminology') || titleLower.includes('definitions')) return 7
  if (titleLower.includes('algorithms') || titleLower.includes('data structures')) return 6
  if (titleLower.includes('system') || titleLower.includes('architecture')) return 5
  if (titleLower.includes('reference') || titleLower.includes('quick') || titleLower.includes('commands')) return 4
  if (titleLower.includes('study') || titleLower.includes('resources')) return 3
  return 2
}

function getMinHeight(title: string): number {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('code') || titleLower.includes('examples') || titleLower.includes('snippets')) return 80
  if (titleLower.includes('interview') || titleLower.includes('questions')) return 75
  if (titleLower.includes('algorithms') || titleLower.includes('data structures')) return 70
  if (titleLower.includes('core') || titleLower.includes('technical')) return 65
  if (titleLower.includes('concepts') || titleLower.includes('terminology')) return 60
  if (titleLower.includes('system') || titleLower.includes('architecture')) return 55
  return 50
}

// FIXED: Безпечне пакування з перевіркою меж
function packSectionsWithSafeMargins(sections: Section[], containerWidth: number, containerHeight: number): Box[] {
  const boxes: Box[] = []
  const sortedSections = [...sections].sort((a, b) => b.priority - a.priority)
  
  // FIXED: Використовуємо 3 колонки з безпечними відступами
  const columns = 3
  const gap = 5
  const columnWidth = (containerWidth - (columns - 1) * gap) / columns
  const maxColumnHeight = containerHeight - 10 // Залишаємо 10mm знизу
  
  let columnHeights = new Array(columns).fill(0)
  
  console.log(`Column width: ${columnWidth}mm, Max height: ${maxColumnHeight}mm`) // Debug
  
  for (const section of sortedSections) {
    // FIXED: Більш точний розрахунок висоти
    const contentChars = section.content.join(' ').length
    const estimatedLines = Math.max(2, Math.ceil(contentChars / 55)) // 55 chars per line
    const calculatedHeight = Math.max(section.minHeight, estimatedLines * 3.5 + 25) // 3.5mm per line + header (збільшено з 20 до 25)
    
    // Find shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    const x = shortestColumnIndex * (columnWidth + gap)
    const y = columnHeights[shortestColumnIndex]
    
    // FIXED: Переконуємося, що контент поміститься
    const availableHeight = maxColumnHeight - y
    const finalHeight = Math.min(calculatedHeight, Math.max(40, availableHeight - 5)) // Збільшено з 35 до 40
    
    // Skip if no space left
    if (finalHeight < 40) { // Збільшено з 35 до 40
      console.log(`Skipping section "${section.title}" - no space left`)
      continue
    }
    
    boxes.push({
      x,
      y,
      width: columnWidth,
      height: finalHeight,
      section
    })
    
    columnHeights[shortestColumnIndex] += finalHeight + gap
    
    console.log(`Section "${section.title}": ${x}, ${y}, ${columnWidth}x${finalHeight}`) // Debug
  }
  
  return boxes
}

function parseTextWithKeywordFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  text = text.replace(/\s+/g, ' ').trim()
  
  // Find **keyword**: patterns
  const keywordPattern = /\*\*([^*]+?)\*\*\s*:?/g
  let currentIndex = 0
  let match
  
  while ((match = keywordPattern.exec(text)) !== null) {
    // Add text before keyword
    if (match.index > currentIndex) {
      const beforeText = text.slice(currentIndex, match.index).trim()
      if (beforeText) {
        segments.push({ text: beforeText, isBold: false, isCode: false })
      }
    }
    
    // Add keyword in bold
    segments.push({ text: match[1].trim(), isBold: true, isCode: false })
    
    // Add colon if present
    if (match[0].includes(':')) {
      segments.push({ text: ':', isBold: false, isCode: false })
    }
    
    currentIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex).trim()
    if (remainingText) {
      // Розширене визначення коду - шукаємо блоки коду та технічні патерни
      const isCodeBlock = remainingText.includes('```') || 
                         remainingText.includes('```python') || 
                         remainingText.includes('```javascript') ||
                         remainingText.includes('```sql') ||
                         remainingText.includes('```bash') ||
                         remainingText.includes('```java') ||
                         remainingText.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(/) ||
                         remainingText.match(/^[a-zA-Z_][a-zA-Z0-9_.]*\s*=/) ||
                         remainingText.match(/^(import|from|def|class|function|const|let|var|SELECT|CREATE|INSERT|UPDATE|docker|git)\s/) ||
                         remainingText.includes('->') || remainingText.includes('=>') ||
                         remainingText.match(/[{}();[\]]/g)?.length > 2 ||
                         remainingText.includes('app = Flask') ||
                         remainingText.includes('.route(') ||
                         remainingText.includes('pd.read_csv') ||
                         remainingText.includes('conn.cursor()') ||
                         remainingText.includes('git clone') ||
                         remainingText.includes('docker run')
      
      segments.push({
        text: remainingText,
        isBold: false,
        isCode: isCodeBlock
      })
    }
  }
  
  if (segments.length === 0) {
    segments.push({ text: text.replace(/\*\*/g, ''), isBold: false, isCode: false })
  }
  
  return segments
}

// FIXED: Рендеринг з суворою перевіркою меж
function renderSectionsWithBoundaryCheck(doc: jsPDF, boxes: Box[], offsetX: number, offsetY: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  for (const box of boxes) {
    const { x, y, width, height, section } = box
    const actualX = offsetX + x
    const actualY = offsetY + y
    
    // FIXED: Перевірка меж перед рендерингом
    if (actualX + width > pageWidth - 5 || actualY + height > pageHeight - 5) {
      console.log(`Skipping section "${section.title}" - exceeds page bounds`)
      continue
    }
    
    // Draw section border
    doc.setDrawColor(140, 140, 140)
    doc.setLineWidth(0.3)
    doc.roundedRect(actualX, actualY, width, height, 2, 2, 'S')
    
    // Add section title background - ЗБІЛЬШЕНО ВИСОТУ
    const titleHeight = 14 // Збільшено з 12 до 14
    doc.setFillColor(220, 230, 250)
    doc.roundedRect(actualX, actualY, width, titleHeight, 2, 2, 'F')
    
    // Section title - ЗБІЛЬШЕНО ШРИФТ
    doc.setTextColor(20, 40, 120)
    doc.setFontSize(10) // Збільшено з 9 до 10
    doc.setFont("helvetica", "bold")
    const titleText = doc.splitTextToSize(section.title, width - 4)[0]
    doc.text(titleText, actualX + 2, actualY + 9) // Трохи змістили вниз
    
    // Section content with strict boundary checking
    let contentY = actualY + titleHeight + 4 // Збільшено відступ з 16 до 18 (14+4)
    const contentWidth = width - 4
    const maxContentY = actualY + height - 5
    const lineHeight = 3.3
    
    for (const line of section.content) {
      if (contentY > maxContentY) break
      
      const segments = parseTextWithKeywordFormatting(line)
      let currentX = actualX + 2
      
      for (const segment of segments) {
        if (contentY > maxContentY) break
        
        // Set font
        if (segment.isCode) {
          doc.setFont("courier", "normal")
          doc.setFontSize(6.8) // Трохи менший для коду
          doc.setTextColor(0, 80, 0) // Темніший зелений для кращої читаемості
        } else if (segment.isBold) {
          doc.setFont("helvetica", "bold")
          doc.setFontSize(8) // Збільшено з 7.5 до 8
          doc.setTextColor(40, 40, 40)
        } else {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(7.5) // Збільшено з 7 до 7.5
          doc.setTextColor(60, 60, 60)
        }
        
        // FIXED: Ретельна перевірка ширини
        const availableWidth = contentWidth - (currentX - actualX - 2)
        if (availableWidth < 10) break // Skip if no space
        
        const wrappedLines = doc.splitTextToSize(segment.text, availableWidth)
        
        for (let i = 0; i < wrappedLines.length; i++) {
          if (contentY > maxContentY) break
          
          if (i > 0) {
            contentY += lineHeight
            currentX = actualX + 2
          }
          
          // FIXED: Перевірка меж перед виводом тексту
          if (actualX + 2 + doc.getTextWidth(wrappedLines[i]) <= pageWidth - 5) {
            doc.text(wrappedLines[i], currentX, contentY)
          }
          
          if (i === 0) {
            currentX += doc.getTextWidth(wrappedLines[i]) + 1
          }
        }
        
        if (wrappedLines.length > 1) {
          contentY += (wrappedLines.length - 1) * lineHeight
        }
      }
      
      contentY += lineHeight + 0.8
      
      // Extra space for bullet points and code blocks
      if (line.match(/^[-•]\s/) || line.match(/^\d+\./) || line.includes('```')) {
        contentY += 2 // Збільшено з 1.5 до 2
      }
    }
  }
}
