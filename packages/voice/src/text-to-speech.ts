/**
 * Text-to-Speech (TTS) utilities
 * Supports: Browser TTS, ElevenLabs, OpenAI TTS
 */

import type { TTSResult, VoiceSettings } from './types'

/**
 * Browser TTS using Web Speech API
 */
export class BrowserTTS {
  private synthesis: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    this.synthesis = window.speechSynthesis
  }

  /**
   * Check if browser TTS is supported
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices()
  }

  /**
   * Speak text
   */
  speak(
    text: string,
    options?: {
      voice?: string
      rate?: number
      pitch?: number
      volume?: number
      onStart?: () => void
      onEnd?: () => void
      onError?: (error: Error) => void
    }
  ): void {
    // Cancel any ongoing speech
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)
    this.currentUtterance = utterance

    // Set voice
    if (options?.voice) {
      const voices = this.getVoices()
      const selectedVoice = voices.find(v => v.name === options.voice)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    // Set parameters
    utterance.rate = options?.rate || 1
    utterance.pitch = options?.pitch || 1
    utterance.volume = options?.volume || 1

    // Event handlers
    utterance.onstart = () => options?.onStart?.()
    utterance.onend = () => {
      this.currentUtterance = null
      options?.onEnd?.()
    }
    utterance.onerror = (event) => {
      options?.onError?.(new Error(event.error))
    }

    this.synthesis.speak(utterance)
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  /**
   * Resume speech
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synthesis.paused
  }
}

/**
 * ElevenLabs TTS
 */
export class ElevenLabsTTS {
  constructor(
    private apiKey: string,
    private voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Default voice
    private modelId: string = 'eleven_monolingual_v1'
  ) {}

  /**
   * Generate speech
   */
  async speak(text: string): Promise<TTSResult> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: this.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.statusText}`)
    }

    const blob = await response.blob()
    const audioUrl = URL.createObjectURL(blob)

    return { audioUrl, blob }
  }

  /**
   * Get available voices
   */
  static async getVoices(apiKey: string): Promise<any[]> {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch voices')
    }

    const data = await response.json()
    return data.voices || []
  }

  /**
   * Get available models
   */
  static async getModels(apiKey: string): Promise<any[]> {
    const response = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: {
        'xi-api-key': apiKey
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }

    const data = await response.json()
    return data || []
  }
}

/**
 * OpenAI TTS
 */
export class OpenAITTS {
  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://api.openai.com/v1',
    private model: string = 'tts-1',
    private voice: string = 'alloy'
  ) {}

  /**
   * Generate speech
   */
  async speak(text: string, speed: number = 1.0): Promise<TTSResult> {
    const response = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        voice: this.voice,
        input: text,
        speed
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed: ${response.statusText}`)
    }

    const blob = await response.blob()
    const audioUrl = URL.createObjectURL(blob)

    return { audioUrl, blob }
  }
}

/**
 * Universal TTS Manager
 * Handles all TTS providers
 */
export class TTSManager {
  private browserTTS: BrowserTTS | null = null
  private elevenLabsTTS: ElevenLabsTTS | null = null
  private openAITTS: OpenAITTS | null = null
  private currentAudio: HTMLAudioElement | null = null

  constructor(private settings: VoiceSettings) {
    this.initProviders()
  }

  private initProviders() {
    // Browser TTS
    if (BrowserTTS.isSupported()) {
      this.browserTTS = new BrowserTTS()
    }

    // ElevenLabs TTS
    if (this.settings.ttsProvider === 'elevenlabs' && this.settings.elevenLabsApiKey) {
      this.elevenLabsTTS = new ElevenLabsTTS(
        this.settings.elevenLabsApiKey,
        this.settings.elevenLabsVoiceId,
        this.settings.elevenLabsModel
      )
    }

    // OpenAI TTS
    if (this.settings.ttsProvider === 'openai' && this.settings.openAITTSApiKey) {
      this.openAITTS = new OpenAITTS(
        this.settings.openAITTSApiKey,
        this.settings.openAITTSBaseUrl,
        this.settings.openAITTSModel,
        this.settings.openAITTSVoice
      )
    }
  }

  /**
   * Speak text using configured provider
   */
  async speak(text: string): Promise<void> {
    if (!this.settings.ttsEnabled) return

    // Stop any current speech
    this.stop()

    try {
      switch (this.settings.ttsProvider) {
        case 'browser':
          if (this.browserTTS) {
            this.browserTTS.speak(text, {
              voice: this.settings.browserVoice,
              rate: this.settings.playbackSpeed
            })
          }
          break

        case 'elevenlabs':
          if (this.elevenLabsTTS) {
            const result = await this.elevenLabsTTS.speak(text)
            await this.playAudio(result.audioUrl!)
          }
          break

        case 'openai':
          if (this.openAITTS) {
            const result = await this.openAITTS.speak(text, this.settings.playbackSpeed)
            await this.playAudio(result.audioUrl!)
          }
          break
      }
    } catch (error) {
      console.error('TTS error:', error)
      throw error
    }
  }

  /**
   * Play audio from URL
   */
  private async playAudio(url: string): Promise<void> {
    this.currentAudio = new Audio(url)
    this.currentAudio.playbackRate = this.settings.playbackSpeed
    await this.currentAudio.play()

    return new Promise((resolve, reject) => {
      this.currentAudio!.onended = () => resolve()
      this.currentAudio!.onerror = () => reject(new Error('Audio playback failed'))
    })
  }

  /**
   * Stop current speech
   */
  stop(): void {
    this.browserTTS?.stop()

    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }

  /**
   * Update settings
   */
  updateSettings(settings: VoiceSettings): void {
    this.settings = settings
    this.initProviders()
  }
}
