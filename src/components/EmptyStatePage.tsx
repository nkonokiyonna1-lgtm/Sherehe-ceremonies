import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type EmptyStatePageProps = {
  title: string
  emptyTitle: string
  description: string
  ctaLabel: string
  ctaTo: string
  icon: LucideIcon
}

export function EmptyStatePage({
  title,
  emptyTitle,
  description,
  ctaLabel,
  ctaTo,
  icon: Icon,
}: EmptyStatePageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to={ctaTo}>{ctaLabel}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
