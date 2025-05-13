import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAuth() {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await supabase.auth.getSession()
                const currentSession = data.session
                setSession(currentSession)

                if (currentSession?.user) {
                    await fetchOrCreateProfile(currentSession.user)
                }
            } catch (err) {
                console.error('Ошибка при инициализации auth:', err)
            } finally {
                setLoading(false)
            }
        }

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setSession(newSession)

                if (newSession?.user) {
                    await fetchOrCreateProfile(newSession.user)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        void init()
        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])


    const fetchOrCreateProfile = async (user) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error && error.code === 'PGRST116') {
            const { user_metadata } = user

            const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                username: user_metadata.user_name || user_metadata.user_name || user.email,
                avatar_url: user_metadata.avatar_url,
                full_name: user_metadata.full_name || user_metadata.name || '',
            })

            if (insertError) {
                console.error('Ошибка при создании профиля:', insertError.message)
            } else {
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(newProfile)
            }
        } else if (profile) {
            setProfile(profile)
        }
    }

    return { session, profile, loading }
}
