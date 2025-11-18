import React, { useEffect, useState } from 'react'
import type { PluginPanelProps } from '@page-assist/plugin-system'
import { Card, Badge } from '@page-assist/ui'
import { Cpu, HardDrive, Zap, TrendingUp } from 'lucide-react'

interface Metrics {
  cpu: number
  memory: { used: number; total: number; limit: number }
  longTasks: Array<{ name: string; duration: number }>
}

export const MonitoringPanel: React.FC<PluginPanelProps> = ({ plugin }) => {
  const [metrics, setMetrics] = useState<Metrics>({
    cpu: 0,
    memory: { used: 0, total: 0, limit: 0 },
    longTasks: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      const api = plugin.context.getPluginAPI<{
        getCPUUsage: () => Promise<number>
        getMemoryUsage: () => Promise<{ used: number; total: number; limit: number }>
        getLongTasks: () => Promise<Array<{ name: string; duration: number }>>
      }>('monitoring')

      const [cpu, memory, longTasks] = await Promise.all([
        api?.getCPUUsage() || 0,
        api?.getMemoryUsage() || { used: 0, total: 0, limit: 0 },
        api?.getLongTasks() || [],
      ])

      setMetrics({ cpu, memory, longTasks })
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold) return 'error'
    if (value > threshold * 0.7) return 'warning'
    return 'success'
  }

  const formatNumber = (num: number) => {
    return num.toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Loading metrics...
        </div>
      </div>
    )
  }

  const cpuStatus = getStatusColor(metrics.cpu, 80)
  const memoryPercent = (metrics.memory.used / metrics.memory.limit) * 100
  const memoryStatus = getStatusColor(memoryPercent, 80)

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time system monitoring
        </p>
      </div>

      {/* CPU Usage */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                CPU Usage
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(metrics.cpu)}%
              </div>
            </div>
          </div>
          <Badge variant={cpuStatus}>
            {cpuStatus === 'success' ? 'Normal' : cpuStatus === 'warning' ? 'High' : 'Critical'}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              cpuStatus === 'error'
                ? 'bg-red-600'
                : cpuStatus === 'warning'
                ? 'bg-yellow-600'
                : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(metrics.cpu, 100)}%` }}
          />
        </div>
      </Card>

      {/* Memory Usage */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Memory Usage
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(metrics.memory.used)} MB
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                of {formatNumber(metrics.memory.limit)} MB
              </div>
            </div>
          </div>
          <Badge variant={memoryStatus}>
            {memoryStatus === 'success' ? 'Normal' : memoryStatus === 'warning' ? 'High' : 'Critical'}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              memoryStatus === 'error'
                ? 'bg-red-600'
                : memoryStatus === 'warning'
                ? 'bg-yellow-600'
                : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(memoryPercent, 100)}%` }}
          />
        </div>
      </Card>

      {/* Long Tasks */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Long Tasks
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Tasks taking &gt;50ms
            </div>
          </div>
        </div>

        {metrics.longTasks.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No long tasks detected
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.longTasks.slice(0, 5).map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-900 dark:text-gray-100">{task.name}</span>
                <Badge variant={task.duration > 100 ? 'error' : 'warning'}>
                  {task.duration.toFixed(0)}ms
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card padding="sm">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Avg Response
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            125ms
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Uptime
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            2h 34m
          </div>
        </Card>
      </div>
    </div>
  )
}
