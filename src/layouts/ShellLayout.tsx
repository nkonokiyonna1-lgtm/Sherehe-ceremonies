import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useMatches } from 'react-router'
import { ShieldCheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCurrentUser } from '@/lib/auth'
import { visibleNavItems } from '@/config/nav'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ThemeToggle } from '@/components/ThemeToggle'

type CrumbHandle = { crumbKey?: string }

function SidebarNav() {
  const { t } = useTranslation('nav')
  const location = useLocation()
  const items = visibleNavItems()

  return (
    <nav aria-label={t('mainLabel')} className="flex min-h-0 flex-1 flex-col">
      <SidebarGroup>
        <SidebarGroupLabel>{t('group')}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              const title = t(item.titleKey)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={title}
                  >
                    <Link
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </nav>
  )
}

function AppSidebar() {
  const { t } = useTranslation('nav')
  const user = getCurrentUser()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShieldCheckIcon aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sherehe</span>
                  <span className="truncate text-xs">Ceremonies</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">
                    {t(
                      user.role === 'super_admin'
                        ? 'roles.superAdmin'
                        : 'roles.organizer'
                    )}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function Breadcrumbs() {
  const { t } = useTranslation('nav')
  const matches = useMatches()
  const crumbs = matches
    .map((match) => ({
      key: (match.handle as CrumbHandle | undefined)?.crumbKey,
      href: match.pathname,
    }))
    .filter((crumb): crumb is { key: string; href: string } =>
      Boolean(crumb.key)
    )
    .map((crumb) => ({ label: t(crumb.key), href: crumb.href }))

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          if (isLast) {
            return (
              <BreadcrumbItem key={crumb.href}>
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )
          }
          return (
            <BreadcrumbItem key={crumb.href}>
              <BreadcrumbLink asChild>
                <Link to={crumb.href}>{crumb.label}</Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function ShellLayout() {
  const { t } = useTranslation('nav')
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const lastPathname = useRef(location.pathname)

  // Move focus to the content area on every route change except the first,
  // so keyboard and screen reader users land on the new page, not the nav.
  useEffect(() => {
    if (lastPathname.current === location.pathname) return
    lastPathname.current = location.pathname
    mainRef.current?.focus()
  }, [location.pathname])

  const skipToContent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        {t('skipToContent')}
      </a>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <Breadcrumbs />
          </div>
          <LanguageSwitch />
          <ThemeToggle />
        </header>
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex flex-1 flex-col gap-4 p-4 outline-none md:gap-6 md:p-6"
        >
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  )
}

export default ShellLayout
