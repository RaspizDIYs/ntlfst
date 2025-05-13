import { useAuth } from '../hooks/useAuth'

export default function AdminSection({ children, fallback = null }) {
    const { session } = useAuth()

    const githubUsername = session?.user?.user_metadata?.user_name

    // ✅ Список GitHub логинов админов
    const admins = ['Alexxxxxander', 'Jab04kin', 'Butk1ch', 'SpelLOVE']

    const isAdmin = githubUsername && admins.includes(githubUsername)

    if (!isAdmin) return fallback
    return <>{children}</>
}
