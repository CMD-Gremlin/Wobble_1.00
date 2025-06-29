import { GetServerSideProps } from 'next'
import LiveToolRenderer from '@/components/LiveToolRenderer'
import { createServerClient } from '@/lib/supabase/server'
import { getPublicToolById } from '@/lib/tools'

interface Props {
  html: string
  script: string
  paid_only: boolean
  price: number
}

export default function EmbedPage({ html, script, paid_only }: Props) {
  return (
    <div style={{ margin: 0 }}>
      {paid_only ? (
        <p>Payment required to view this tool.</p>
      ) : (
        <LiveToolRenderer tool={{ html, script }} />
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const supabase = createServerClient()
  try {
    const tool = await getPublicToolById(supabase, ctx.params!.toolId as string)
    return { props: tool }
  } catch (e) {
    return { notFound: true }
  }
}
