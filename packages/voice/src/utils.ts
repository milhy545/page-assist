/**
 * Voice Utilities
 */

/**
 * Supported languages for speech recognition
 */
export const SPEECH_LANGUAGES = [
  { label: 'Czech (Česky)', value: 'cs-CZ' },
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Slovak (Slovenčina)', value: 'sk-SK' },
  { label: 'German (Deutsch)', value: 'de-DE' },
  { label: 'French (Français)', value: 'fr-FR' },
  { label: 'Spanish (Español)', value: 'es-ES' },
  { label: 'Italian (Italiano)', value: 'it-IT' },
  { label: 'Polish (Polski)', value: 'pl-PL' },
  { label: 'Russian (Русский)', value: 'ru-RU' },
  { label: 'Japanese (日本語)', value: 'ja-JP' },
  { label: 'Chinese (中文)', value: 'zh-CN' },
] as const

/**
 * Get default voice settings
 */
export function getDefaultVoiceSettings() {
  return {
    sttLanguage: 'cs-CZ',
    autoSubmit: false,
    autoStopTimeout: 2000,
    ttsEnabled: true,
    ttsProvider: 'browser' as const,
    ttsAutoPlay: false,
    playbackSpeed: 1.0
  }
}

/**
 * Format time for voice feedback
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

/**
 * Clean text for TTS
 * Removes code blocks, markdown, etc.
 */
export function cleanTextForTTS(text: string): string {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '[kod]')
    // Remove inline code
    .replace(/`[^`]+`/g, '[kod]')
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove markdown formatting
    .replace(/[*_~]/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Split long text into chunks for TTS
 */
export function splitTextForTTS(text: string, maxLength: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())

  return chunks
}
