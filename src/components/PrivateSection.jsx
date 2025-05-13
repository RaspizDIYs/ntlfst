import { useAuth } from '../hooks/useAuth'

export default function PrivateSection({ children, fallback = null }) {
    const { session } = useAuth()

    if (!session) return fallback
    return <>{children}</>
}
