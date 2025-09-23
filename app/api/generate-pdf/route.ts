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

    // Create new PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 6
    const headerHeight = 18
    const availableWidth = pageWidth - 2 * margin
    const availableHeight = pageHeight - headerHeight - margin - 5

    // Parse content into sections and ensure no empty sections
    const sections = parseContentIntoSections(content)
      .filter(section => section.content.length > 0 && section.title.trim() !== '')
      .map(section => validateAndEnrichSection(section)) // Ensure each section has substantial content
    
    // Apply optimized packing algorithm
    const boxes = packSectionsOptimized(sections, availableWidth, availableHeight)

    // Add professional header
    doc.setFillColor(30, 60, 140)
    doc.rect(0, 0, pageWidth, headerHeight, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Interview Preparation Cheat Sheet", margin, 11)

    // Add generation info
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    const date = new Date().toLocaleDateString('en-GB')
    doc.text(`Generated: ${date}`, pageWidth - margin - 30, 13)

    // Render sections with enhanced formatting
    renderSectionsWithBoldFormatting(doc, boxes, margin, headerHeight + 2)

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
    
    // Detect section headers
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

function validateAndEnrichSection(section: Section): Section {
  // Ensure minimum content requirements
  const minContentItems = {
    'CORE TECHNICAL SKILLS': 8,
    'KEY CONCEPTS': 6,
    'INTERVIEW QUESTIONS': 10,
    'CODE EXAMPLES': 5,
    'STUDY RESOURCES': 6,
    'QUICK REFERENCE': 5,
    'LAST-MINUTE REVIEW': 5
  }

  const requiredItems = minContentItems[section.title] || 5
  
  // If section has insufficient content, don't enrich (let AI handle it properly)
  // Just ensure we have the content that was provided
  return section
}

function getSectionPriority(title: string): number {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('core') || titleLower.includes('technical')) return 10
  if (titleLower.includes('interview') || titleLower.includes('questions')) return 9
  if (titleLower.includes('concepts') || titleLower.includes('key')) return 8
  if (titleLower.includes('code') || titleLower.includes('examples')) return 7
  if (titleLower.includes('study') || titleLower.includes('resources')) return 6
  if (titleLower.includes('reference') || titleLower.includes('quick')) return 5
  if (titleLower.includes('review') || titleLower.includes('checklist')) return 4
  return 5
}

function getMinHeight(title: string): number {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('interview') || titleLower.includes('questions')) return 85
  if (titleLower.includes('code') || titleLower.includes('examples')) return 75
  if (titleLower.includes('core') || titleLower.includes('technical')) return 70
  if (titleLower.includes('concepts') || titleLower.includes('key')) return 60
  if (titleLower.includes('study') || titleLower.includes('resources')) return 55
  return 45
}

function packSectionsOptimized(sections: Section[], containerWidth: number, containerHeight: number): Box[] {
  const boxes: Box[] = []
  const sortedSections = [...sections].sort((a, b) => b.priority - a.priority)
  
  // Use 3 columns for better balance
  const columns = 3
  const gap = 4
  const columnWidth = (containerWidth - (columns - 1) * gap) / columns
  
  let columnHeights = new Array(columns).fill(0)
  
  for (const section of sortedSections) {
    // Calculate height based on content density
    const contentLength = section.content.join(' ').length
    const estimatedLines = Math.ceil(contentLength / 50) // ~50 chars per line
    const baseHeight = Math.max(section.minHeight, estimatedLines * 2.8 + 15)
    
    // Find column with minimum height
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    const x = shortestColumnIndex * (columnWidth + gap)
    const y = columnHeights[shortestColumnIndex]
    
    // Ensure reasonable height limits
    const maxAllowedHeight = containerHeight - y - 8
    const finalHeight = Math.min(baseHeight, Math.max(40, maxAllowedHeight))
    
    boxes.push({
      x,
      y,
      width: columnWidth,
      height: finalHeight,
      section
    })
    
    columnHeights[shortestColumnIndex] += finalHeight + gap
  }
  
  return boxes
}

function parseTextWithFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let currentIndex = 0
  
  // Find all **bold** patterns
  const boldPattern = /\*\*(.*?)\*\*/g
  let match
  
  while ((match = boldPattern.exec(text)) !== null) {
    // Add text before bold
    if (match.index > currentIndex) {
      const beforeText = text.slice(currentIndex, match.index)
      if (beforeText) {
        segments.push({
          text: beforeText,
          isBold: false,
          isCode: beforeText.includes('```') || beforeText.match(/^\s{4,}/)
        })
      }
    }
    
    // Add bold text
    segments.push({
      text: match[1],
      isBold: true,
      isCode: false
    })
    
    currentIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex)
    if (remainingText) {
      segments.push({
        text: remainingText,
        isBold: false,
        isCode: remainingText.includes('```') || remainingText.match(/^\s{4,}/)
      })
    }
  }
  
  // If no bold patterns found, treat entire text as normal
  if (segments.length === 0) {
    segments.push({
      text: text.replace(/\*\*/g, ''),
      isBold: false,
      isCode: text.includes('```') || text.match(/^\s{4,}/)
    })
  }
  
  return segments
}

function renderSectionsWithBoldFormatting(doc: jsPDF, boxes: Box[], offsetX: number, offsetY: number) {
  for (const box of boxes) {
    const { x, y, width, height, section } = box
    const actualX = offsetX + x
    const actualY = offsetY + y
    
    // Draw section border
    doc.setDrawColor(140, 140, 140)
    doc.setLineWidth(0.4)
    doc.roundedRect(actualX, actualY, width, height, 2.5, 2.5, 'S')
    
    // Add section title background
    doc.setFillColor(220, 230, 250)
    doc.roundedRect(actualX, actualY, width, 10, 2.5, 2.5, 'F')
    
    // Section title
    doc.setTextColor(20, 40, 120)
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "bold")
    const titleText = doc.splitTextToSize(section.title, width - 4)[0]
    doc.text(titleText, actualX + 2, actualY + 6.5)
    
    // Section content with proper formatting
    let contentY = actualY + 14
    const maxContentWidth = width - 4
    const maxContentHeight = height - 16
    
    for (const line of section.content) {
      if (contentY - actualY > maxContentHeight - 5) break
      
      const segments = parseTextWithFormatting(line.replace(/```\w*/g, '').replace(/```/g, ''))
      let lineX = actualX + 2
      const lineStartY = contentY
      let maxLineHeight = 0
      
      for (const segment of segments) {
        // Set font based on segment properties
        if (segment.isCode) {
          doc.setFont("courier", "normal")
          doc.setFontSize(6)
          doc.setTextColor(0, 120, 0)
        } else if (segment.isBold) {
          doc.setFont("helvetica", "bold")
          doc.setFontSize(7)
          doc.setTextColor(40, 40, 40)
        } else {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(6.5)
          doc.setTextColor(60, 60, 60)
        }
        
        // Handle text wrapping for long segments
        const availableWidth = maxContentWidth - (lineX - actualX - 2)
        const wrappedLines = doc.splitTextToSize(segment.text, availableWidth)
        
        for (let i = 0; i < wrappedLines.length; i++) {
          if (contentY - actualY > maxContentHeight - 5) break
          
          if (i > 0) {
            // New line for wrapped text
            contentY += 3
            lineX = actualX + 2
          }
          
          doc.text(wrappedLines[i], lineX, contentY)
          
          // Update X position for next segment on same line
          if (i === 0) {
            lineX += doc.getTextWidth(wrappedLines[i]) + 1
          }
          
          maxLineHeight = Math.max(maxLineHeight, 3)
        }
      }
      
      contentY += Math.max(maxLineHeight, 3.2)
      
      // Add extra space after bullet points and numbered items
      if (line.match(/^[-•]\s/) || line.match(/^\d+\./)) {
        contentY += 0.8
      }
    }
  }
}
