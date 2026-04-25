import { CalendarCheck } from 'lucide-react'
import { Card, EmptyState, PageHeader } from './ui/primitives'

// P3 will populate this with an auto-computed weekly digest + reflection
// prompts that save to journal_posts with type='weekly'. For P1 we ship the
// route + nav entry so the IA is correct.

export default function Review() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Weekly review"
        subtitle="Coming in P3 — see what worked, what slipped, write a short reflection."
      />
      <Card>
        <EmptyState
          icon={<CalendarCheck size={26} aria-hidden />}
          title="Weekly review is on the roadmap"
          body="Each Sunday we'll auto-build a digest from your habits and projects, then prompt three quick reflection questions. Save it to your journal in one click."
        />
      </Card>
    </div>
  )
}
