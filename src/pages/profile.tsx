import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function Profile() {
  const [user, setUser] = useState<null | { email: string }>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user || !user.email) {
        router.push('/login')
      } else {
        setUser({ email: user.email })
      }
    }
    fetchUser()
  }, [router])

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl mb-4">My Profile</h1>
      <div className="border p-4 rounded-lg">
        <p><strong>Email :</strong> {user.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white py-2 rounded-lg">
        Sign out
      </button>
    </div>
  )
}
