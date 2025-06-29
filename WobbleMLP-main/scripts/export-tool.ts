import { build } from 'esbuild'
import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { sign } from '../lib/billing/signUrl'

async function main() {
  const toolId = process.argv[2]
  if (!toolId) {
    console.error('Usage: bun scripts/export-tool.ts <toolId>')
    process.exit(1)
  }

  const srcDir = path.join('app/tools', toolId)
  const htmlPath = path.join(srcDir, 'index.html')
  const scriptPath = path.join(srcDir, 'script.ts')

  const html = await readFile(htmlPath, 'utf8')

  await mkdir('/tmp/bundle', { recursive: true })
  await build({
    entryPoints: [scriptPath],
    bundle: true,
    format: 'iife',
    outfile: '/tmp/bundle/bundle.js',
  })
  const js = await readFile('/tmp/bundle/bundle.js', 'utf8')
  const outPath = '/tmp/bundle/index.html'
  await writeFile(outPath, `${html}\n<script>\n${js}\n</script>`)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
  const { data: row } = await supabase
    .from('tools')
    .select('current_version')
    .eq('id', toolId)
    .single()
  const ver = (row?.current_version ?? 0) + 1
  const file = await readFile(outPath)
  await supabase.storage
    .from('tools')
    .upload(`${toolId}/${ver}/index.html`, file, {
      contentType: 'text/html',
      upsert: true,
    })
  await supabase.from('tools').upsert({ id: toolId, current_version: ver })
  console.log(`/embed/${toolId}?v=${ver}&sig=${sign(toolId, ver)}`)
}

main()
