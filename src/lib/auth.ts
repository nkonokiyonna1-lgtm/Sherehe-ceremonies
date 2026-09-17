export type StubUserRole = 'organizer' | 'super_admin'

export type StubUser = {
  name: string
  avatarInitials: string
  role: StubUserRole
}

// Stub seam for feature 4 (auth & data foundation): replace with the real
// Clerk session read. Components only ever import getCurrentUser().
export function getCurrentUser(): StubUser {
  return {
    name: 'Amina (demo)',
    avatarInitials: 'A',
    role: 'organizer',
  }
}
