import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism as atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { prism as atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { useSettingsStore } from '../../store/useSettingsStore'

export default function SQLBlock({ sql = '' }) {
  const { theme } = useSettingsStore()
  const style = theme === 'light' ? atomOneLight : atomOneDark

  return (
    <div className="rounded-xl bg-[var(--code-bg)] border border-border/60">
      <div className="max-w-full overflow-x-auto">
        <SyntaxHighlighter
          language="sql"
          style={style}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontFamily: 'var(--font-code)',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.55',
          }}
          codeTagProps={{
            style: { fontFamily: 'var(--font-code)' },
          }}
        >
          {sql}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

