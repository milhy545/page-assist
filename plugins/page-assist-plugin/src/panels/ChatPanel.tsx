import React, { useState, useEffect, useRef } from 'react'
import type { PluginPanelProps } from '@page-assist/plugin-system'
import { Button, Input, Card, Badge } from '@page-assist/ui'
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react'

// Simple speech recognition interface
interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition?: new() => ISpeechRecognition
    webkitSpeechRecognition?: new() => ISpeechRecognition
  }
}

export const ChatPanel: React.FC<PluginPanelProps> = ({ plugin }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [loading, setLoading] = useState(false)

  // Voice features
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'cs-CZ' // Czech language default
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [])

  // Handle send message
  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setInterimTranscript('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    setLoading(true)

    try {
      // Use plugin API to send message
      const api = plugin.context.getPluginAPI<{
        sendMessage: (msg: string) => Promise<string>
      }>('page-assist')

      const response = await api?.sendMessage(userMessage)
      const aiResponse = response || 'No response'

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

      // Auto-play response (optional - can be made configurable)
      // speakText(aiResponse)

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

  // Start voice dictation
  const startListening = () => {
    if (!recognitionRef.current) {
      plugin.context.notify('Speech recognition not supported', 'error')
      return
    }

    try {
      recognitionRef.current.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript
          }
        }

        if (final) {
          setMessage(prev => prev + final)
          setInterimTranscript('')
        } else {
          setInterimTranscript(interim)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        plugin.context.notify('Voice recognition error', 'error')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setInterimTranscript('')
      }

      recognitionRef.current.start()
      setIsListening(true)
      plugin.context.notify('🎤 Listening...', 'info')
    } catch (error) {
      console.error('Failed to start recognition:', error)
      plugin.context.notify('Failed to start voice recognition', 'error')
    }
  }

  // Stop voice dictation
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript('')
    }
  }

  // Speak text using TTS
  const speakText = (text: string) => {
    if (!synthesisRef.current) {
      plugin.context.notify('Text-to-speech not supported', 'error')
      return
    }

    // Stop any ongoing speech
    synthesisRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'cs-CZ' // Czech language
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      plugin.context.notify('Speech playback error', 'error')
    }

    synthesisRef.current.speak(utterance)
    plugin.context.notify('🔊 Playing...', 'info')
  }

  // Stop speech
  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
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
        <div className="flex items-center gap-2">
          <Badge variant="success">Mercury Mini</Badge>
          {isListening && (
            <Badge variant="warning" className="animate-pulse">
              🎤 Recording
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="info" className="animate-pulse">
              🔊 Speaking
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-2">Type or use voice! 🎤</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2">
            <Card
              className={msg.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                {msg.role === 'assistant' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(msg.content)}
                    icon={isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    title="Read aloud"
                  />
                )}
              </div>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {msg.content}
              </div>
            </Card>
          </div>
        ))}

        {loading && (
          <Card className="mr-auto max-w-[80%]">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div>AI is thinking...</div>
            </div>
          </Card>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Interim transcript (preview of what's being spoken) */}
        {interimTranscript && (
          <div className="mb-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Listening: </span>
            <span className="italic">{interimTranscript}</span>
          </div>
        )}

        <div className="flex gap-2">
          {/* Microphone button */}
          <Button
            onClick={toggleListening}
            variant={isListening ? 'danger' : 'secondary'}
            icon={isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            title={isListening ? 'Stop dictation (click)' : 'Start dictation (click)'}
            className={isListening ? 'animate-pulse' : ''}
          />

          {/* Input field */}
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type or speak your message..."
            className="flex-1"
          />

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            loading={loading}
          >
            Send
          </Button>
        </div>

        {/* Voice hint */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Click <Mic className="inline h-3 w-3" /> to dictate • Click <Volume2 className="inline h-3 w-3" /> on messages to hear them
        </div>
      </div>
    </div>
  )
}
