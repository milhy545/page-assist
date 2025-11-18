import React, { useState } from 'react'
import type { PluginPanelProps } from '@page-assist/plugin-system'
import { Button, Input, Card, Badge } from '@page-assist/ui'
import { Send, Sparkles } from 'lucide-react'

export const ChatPanel: React.FC<PluginPanelProps> = ({ plugin }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    setLoading(true)

    try {
      // Use plugin API to send message
      const api = plugin.context.getPluginAPI<{
        sendMessage: (msg: string) => Promise<string>
      }>('page-assist')

      const response = await api?.sendMessage(userMessage)

      setMessages(prev => [...prev, { role: 'assistant', content: response || 'No response' }])

      // Emit event
      await plugin.context.eventBus.emit('message.sent', {
        content: userMessage,
        chatId: 'default',
        messageId: Date.now().toString(),
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      plugin.context.notify('Failed to send message', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">AI Chat</h2>
        </div>
        <Badge variant="success">Mercury Mini</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-2">Ask me anything!</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <Card
            key={idx}
            className={msg.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {msg.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {msg.content}
            </div>
          </Card>
        ))}

        {loading && (
          <Card className="mr-auto max-w-[80%]">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="animate-pulse">AI is thinking...</div>
            </div>
          </Card>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            icon={<Send className="h-4 w-4" />}
            loading={loading}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
