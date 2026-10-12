import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrentUser } from '@/lib/auth'

const GUARD_TOAST_ID = 'activation-role-guard'

// Client-side UX convenience only (spec 0002 security model): real role
// enforcement lives server-side with feature 4.
export function RequireSuperAdmin() {
  const { t } = useTranslation('nav')
  const isSuperAdmin = getCurrentUser().role === 'super_admin'

  useEffect(() => {
    if (isSuperAdmin) return
    toast.warning(t('guard.superAdminOnly'), { id: GUARD_TOAST_ID })
  }, [isSuperAdmin, t])

  if (isSuperAdmin) return <Outlet />
  return <Navigate to="/dashboard" replace />
}
