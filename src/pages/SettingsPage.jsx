import React, { useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    dbType,
    dbConfig,
    apiKey,
    model,
    aiStatus,
    aiMessage,
    setDbConfig,
    setApiKey,
    setModel,
    connectionStatus,
    connectionError,
    testConnection,
    saveSettings,
    resetSettings,
    loadAiStatus,
  } = useSettingsStore()

  useEffect(() => {
    loadAiStatus()
  }, [loadAiStatus])

  const onSave = () => {
    saveSettings()
    toast.success('Settings saved')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      <div className="mt-6 space-y-6">
        <section className="rounded-xl border border-border bg-bg-surface/30 p-5">
          <h2 className="text-sm font-bold text-text-primary">Database Connection</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-text-muted">DB Type</div>
              <div className="mt-2 flex gap-2">
                {['mysql', 'postgres'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => useSettingsStore.getState().setDbType?.(t) || null}
                    className={[
                      'rounded-lg border px-4 py-2 text-sm font-bold',
                      t === dbType ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-bg-elevated/40 text-text-secondary',
                    ].join(' ')}
                  >
                    {t === 'mysql' ? 'MySQL' : 'PostgreSQL'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={testConnection}
                className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-hover"
              >
                Test Connection
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['host', 'Host'],
              ['port', 'Port'],
              ['dbName', 'Database Name'],
              ['username', 'Username'],
              ['password', 'Password'],
            ].map(([k, label]) => (
              <div key={k}>
                <div className="text-xs font-semibold text-text-muted">{label}</div>
                <input
                  type={k === 'password' ? 'password' : 'text'}
                  value={dbConfig?.[k] || ''}
                  onChange={(e) => setDbConfig({ ...dbConfig, [k]: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-border bg-bg-primary/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-xs font-semibold text-text-secondary">Status: {connectionStatus}</div>
            {connectionError ? (
              <div className="text-xs text-danger">{connectionError}</div>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-bg-surface/30 p-5">
          <h2 className="text-sm font-bold text-text-primary">AI Configuration</h2>
          <div className="mt-4 rounded-lg border border-border bg-bg-elevated/30 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-text-muted">Backend AI Status</div>
                <div className="mt-1 text-sm font-bold text-text-primary">
                  {{ configured: 'Configured', missing_key: 'Missing API key', rate_limited: 'Rate limited', error: 'Error', unknown: 'Unknown' }[aiStatus] || aiStatus}
                </div>
              </div>
              <button
                type="button"
                onClick={loadAiStatus}
                className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-secondary hover:border-accent hover:text-text-primary"
              >
                Refresh
              </button>
            </div>
            {aiMessage ? <div className="mt-2 text-xs text-text-muted">{aiMessage}</div> : null}
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-text-muted">Model</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {['gemini-1.5-pro', 'gemini-2.5-flash'].map((m) => (
                <label
                  key={m}
                  className={[
                    'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3',
                    m === model ? 'border-accent bg-accent/15' : 'border-border bg-bg-elevated/40',
                  ].join(' ')}
                >
                  <span className="text-sm font-bold text-text-secondary">{m}</span>
                  <input type="radio" checked={m === model} onChange={() => setModel(m)} />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-text-muted">Frontend API key field</div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Not used by the browser app"
              className="mt-2 w-full rounded-lg border border-border bg-bg-primary/10 px-3 py-2 font-code text-sm text-text-primary outline-none focus:border-accent"
            />
          </div>

          <div className="mt-2 text-xs text-text-muted">Live AI uses GEMINI_API_KEY and GEMINI_MODEL from backend/.env.</div>
        </section>

        <section className="rounded-xl border border-border bg-bg-surface/30 p-5">
          <h2 className="text-sm font-bold text-text-primary">Appearance</h2>
          <div className="mt-4 flex gap-2">
            {['dark', 'light'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={[
                  'flex-1 rounded-lg border px-4 py-2 text-sm font-bold',
                  theme === t ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-bg-elevated/40 text-text-secondary',
                ].join(' ')}
              >
                {t === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-danger/50 bg-bg-surface/20 p-5">
          <h2 className="text-sm font-bold text-danger">Danger Zone</h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all history?')) useSettingsStore.getState().resetSettings?.();
              }}
              className="rounded-lg border border-danger bg-danger/15 px-4 py-2 text-sm font-bold text-danger"
            >
              Clear all history
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all settings?')) resetSettings()
              }}
              className="rounded-lg border border-danger bg-danger/15 px-4 py-2 text-sm font-bold text-danger"
            >
              Reset all settings
            </button>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 mt-8 pb-4">
        <button
          type="button"
          onClick={onSave}
          className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-hover"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

