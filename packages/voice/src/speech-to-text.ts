/**
 * Speech-to-Text (STT) utilities
 * Uses Web Speech API for browser-based speech recognition
 */

import type { SpeechRecognitionResult } from './types'

// Browser SpeechRecognition types
interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
}

interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor
    webkitSpeechRecognition?: ISpeechRecognitionConstructor
  }
}

export class SpeechToText {
  private recognition: ISpeechRecognition | null = null
  private isListening = false

  constructor(
    private language: string = 'cs-CZ',
    private continuous: boolean = true
  ) {
    this.initRecognition()
  }

  private initRecognition() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognitionAPI()
    this.recognition.continuous = this.continuous
    this.recognition.interimResults = true
    this.recognition.lang = this.language
    this.recognition.maxAlternatives = 1
  }

  /**
   * Check if speech recognition is supported
   */
  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  /**
   * Start listening
   */
  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    onEnd?: () => void
  ): void {
    if (!this.recognition) {
      onError?.(new Error('Speech Recognition not supported'))
      return
    }

    if (this.isListening) {
      console.warn('Already listening')
      return
    }

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const result = event.results[last]

      onResult({
        transcript: result[0].transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence
      })
    }

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      onError?.(new Error(event.error))
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd?.()
    }

    this.recognition.start()
    this.isListening = true
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  /**
   * Abort listening
   */
  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  /**
   * Set language
   */
  setLanguage(lang: string): void {
    this.language = lang
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening
  }
}

/**
 * React hook for speech recognition
 */
export function useSpeechRecognition(language: string = 'cs-CZ') {
  let stt: SpeechToText | null = null

  const startListening = (
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    onEnd?: () => void
  ) => {
    if (!stt) {
      stt = new SpeechToText(language)
    }
    stt.start(onResult, onError, onEnd)
  }

  const stopListening = () => {
    stt?.stop()
  }

  const abortListening = () => {
    stt?.abort()
  }

  const isSupported = SpeechToText.isSupported()
  const isListening = stt?.getIsListening() || false

  return {
    startListening,
    stopListening,
    abortListening,
    isSupported,
    isListening
  }
}
