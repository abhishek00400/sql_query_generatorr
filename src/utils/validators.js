export function validateInput(text) {
  const v = (text || '').trim()
  if (!v) return { isValid: false, error: 'Please enter a question.' }
  if (v.length < 10) return { isValid: false, error: 'Please enter at least 10 characters.' }
  if (v.length > 500) return { isValid: false, error: 'Input must be 500 characters or less.' }
  return { isValid: true, error: null }
}

export function validateDbConfig(config) {
  const c = config || {}
  const required = ['host', 'port', 'dbName', 'username', 'password']
  for (const k of required) {
    const val = c[k]
    if (val === undefined || val === null || String(val).trim() === '') {
      return { isValid: false, error: `Missing ${k}.` }
    }
  }
  return { isValid: true, error: null }
}
