/**
 * Voice Types
 */

export interface VoiceSettings {
  // Speech-to-Text settings
  sttLanguage: string
  autoSubmit: boolean
  autoStopTimeout: number

  // Text-to-Speech settings
  ttsEnabled: boolean
  ttsProvider: 'browser' | 'elevenlabs' | 'openai'
  ttsAutoPlay: boolean
  playbackSpeed: number

  // Browser TTS
  browserVoice?: string

  // ElevenLabs
  elevenLabsApiKey?: string
  elevenLabsVoiceId?: string
  elevenLabsModel?: string

  // OpenAI TTS
  openAITTSBaseUrl?: string
  openAITTSApiKey?: string
  openAITTSModel?: string
  openAITTSVoice?: string
}

export interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

export interface TTSResult {
  audioUrl?: string
  blob?: Blob
  duration?: number
}

export interface VoiceProvider {
  name: string
  id: string
  supported: boolean
}
