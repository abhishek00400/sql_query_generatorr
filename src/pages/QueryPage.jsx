import React, { useEffect } from 'react'
import { useQueryStore } from '../store/useQueryStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useSchemaStore } from '../store/useSchemaStore'
import StepIndicator from '../components/ui/StepIndicator'
import InputSection from '../components/query/InputSection'
import QueryResults from '../components/query/QueryResults'
import ExecutePanel from '../components/query/ExecutePanel'

export default function QueryPage() {
  const { step } = useQueryStore()
  const { connectionStatus, dbConfig, dbType } = useSettingsStore()
  const { parsedSchema, selectedSchemaKey, loadDbSchema } = useSchemaStore()

  useEffect(() => {
    if (connectionStatus !== 'connected') return
    if (selectedSchemaKey === 'database' && parsedSchema?.tables?.length) return
    const payload = {
      host: dbConfig.host,
      port: dbConfig.port,
      dbName: dbConfig.dbName,
      username: dbConfig.username,
      password: dbConfig.password,
      type: dbType === 'postgres' ? 'postgresql' : 'mysql',
    }
    if (payload.host && payload.port && payload.dbName && payload.username) {
      loadDbSchema(payload).catch(() => {})
    }
  }, [connectionStatus, dbConfig, dbType, selectedSchemaKey, parsedSchema, loadDbSchema])

  return (
    <div>
      <StepIndicator currentStep={step} />
      <InputSection />

      {step >= 2 && <QueryResults />}
      {step >= 3 && <ExecutePanel />}
    </div>
  )
}


