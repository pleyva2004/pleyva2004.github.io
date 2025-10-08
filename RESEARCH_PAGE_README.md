# Research Page Documentation

## Overview

The research page has been refactored into a modular, scalable system with three main views:

1. **Research Dashboard** - Main research page with your projects and reading list
2. **Research Detail View** - Detailed view of individual research projects
3. **Paper Reading View** - Side-by-side PDF viewer with markdown notes (2/3 + 1/3 layout)

## File Structure

```
src/
├── app/
│   └── research/
│       ├── page.tsx                    # Dashboard (main research page)
│       ├── [id]/
│       │   └── page.tsx               # Dynamic route for research detail
│       └── reading/
│           └── [id]/
│               └── page.tsx           # Paper reading view (PDF + notes)
├── components/
│   ├── ResearchDetail.tsx             # Renders research proposals/papers
│   ├── ResearchCard.tsx               # Card component for dashboard
│   ├── ReadingListSidebar.tsx         # Sidebar with reading list
│   ├── PDFViewer.tsx                  # PDF viewer component
│   └── MarkdownNotesPanel.tsx         # Markdown notes renderer
└── constants/
    └── research/
        ├── research-papers.ts         # Your research data
        └── reading-list.ts            # External papers data

public/
└── research/
    ├── my-papers/                     # YOUR completed research PDFs
    ├── papers/                        # External research paper PDFs
    └── notes/                         # Your markdown notes
```

## Adding Content

### Adding a New Research Project (Ongoing)

1. Edit `/src/constants/research/research-papers.ts`
2. Add a new entry to the `researchPapers` array:

```typescript
{
  id: 'my-new-project',
  title: 'My Research Title',
  author: 'Pablo Leyva',
  date: 'January 2025',
  institution: 'NJIT R1 University',
  status: 'ongoing',
  abstract: 'Brief abstract...',
  sections: {
    // ... fill in all sections
  }
}
```

### Adding a Completed Research Project

1. Add your PDF to `/public/research/my-papers/my-paper.pdf`
2. Edit `/src/constants/research/research-papers.ts`
3. Add entry with `status: 'completed'` and `pdfFileName: 'my-paper.pdf'`

### Adding an External Paper to Reading List

1. Add paper PDF to `/public/research/papers/paper-name.pdf`
2. Create markdown notes at `/public/research/notes/paper-name-notes.md`
3. Edit `/src/constants/research/reading-list.ts`
4. Add new entry:

```typescript
{
  id: 'paper-name',
  title: 'Paper Title',
  authors: 'Author Names',
  year: '2025',
  pdfFileName: 'paper-name.pdf',
  notesFileName: 'paper-name-notes.md',
  category: 'favorites' // or 'read'
}
```

## Features

### Research Dashboard (`/research`)

- Filter tabs: All, Ongoing, Completed
- Research cards (70% width) showing your projects
- Reading list sidebar (30% width) with favorites and read papers
- Click any card to view details

### Research Detail View (`/research/[id]`)

- **Ongoing projects:** Renders full proposal content with PDF generation
- **Completed projects:** Displays PDF from `/public/research/my-papers/`
- Download button for PDFs
- Back navigation to dashboard

### Paper Reading View (`/research/reading/[id]`)

- **Left panel (2/3 width):** External paper PDF viewer
  - Page navigation
  - Zoom controls
  - Download button
- **Right panel (1/3 width):** Your markdown notes
  - Syntax highlighting
  - GitHub-flavored markdown
  - Download button
- Responsive: Stacks vertically on mobile

## Technologies Used

- **react-pdf** - PDF rendering
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub-flavored markdown support
- **rehype-highlight** - Code syntax highlighting
- **framer-motion** - Animations
- **jsPDF** - PDF generation for proposals

## Styling

- Dark theme with accent colors (blue, purple, green)
- Gradient borders and hover effects
- Responsive design (mobile, tablet, desktop)
- Animations for page transitions and cards

## Notes Format

Markdown notes support:
- Headings (styled with accent colors)
- Code blocks (with syntax highlighting)
- Tables
- Lists
- Blockquotes
- Links
- Bold/italic text

Example:

```markdown
# Paper Title - Notes

## Key Takeaways
- Point 1
- Point 2

### Code Example
\`\`\`python
def example():
    return "hello"
\`\`\`

## Personal Insights
> This research is crucial for my project...
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Future Enhancements

- [ ] Search functionality for papers
- [ ] Tags/categories for research
- [ ] Export notes as PDF
- [ ] Annotation support for PDFs
- [ ] Dark/light mode toggle
- [ ] Progress tracking for papers
