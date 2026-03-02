import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function LessonCategoryIndex() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/lesson')
  }, [router])
  return null
}
