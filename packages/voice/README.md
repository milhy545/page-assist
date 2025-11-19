# @page-assist/voice

**Hlasové funkce pro Page Assist** - Diktování a přehrávání! 🎤🔊

## Funkce

### 🎤 Speech-to-Text (Diktování)
- **Web Speech API** - Vestavěná podpora v prohlížeči
- **Podpora češtiny** - Výchozí jazyk cs-CZ
- **Real-time přepis** - Vidíš co říkáš okamžitě
- **Auto-stop** - Automatické zastavení po pauze

### 🔊 Text-to-Speech (Přehrávání)
- **Browser TTS** - Vestavěné hlasy prohlížeče (ZDARMA)
- **ElevenLabs** - Profesionální AI hlasy
- **OpenAI TTS** - OpenAI text-to-speech

## Quick Start

### 1. Speech-to-Text (Diktování)

```typescript
import { SpeechToText } from '@page-assist/voice'

const stt = new SpeechToText('cs-CZ')

// Začít nahrávat
stt.start(
  (result) => {
    console.log('Říkáš:', result.transcript)
    if (result.isFinal) {
      console.log('Finální text:', result.transcript)
    }
  },
  (error) => console.error('Chyba:', error),
  () => console.log('Ukončeno')
)

// Zastavit nahrávání
stt.stop()
```

### 2. Text-to-Speech (Přehrávání)

```typescript
import { BrowserTTS } from '@page-assist/voice'

const tts = new BrowserTTS()

// Přečíst text
tts.speak('Ahoj, jak se máš?', {
  rate: 1.0,  // Rychlost
  pitch: 1.0, // Výška hlasu
  volume: 1.0 // Hlasitost
})

// Zastavit čtení
tts.stop()
```

### 3. React Hook

```typescript
import { useSpeechRecognition } from '@page-assist/voice'

function MyComponent() {
  const { startListening, stopListening, isSupported, isListening } = useSpeechRecognition('cs-CZ')

  return (
    <button onClick={startListening}>
      {isListening ? 'Nahrávám...' : 'Klikni pro diktování'}
    </button>
  )
}
```

## Použití v Dashboard

V **ChatPanel** najdeš:

1. **🎤 Tlačítko mikrofonu** - Klikni a mluv!
   - Červené = nahrává
   - Šedé = vypnuto
   - Vidíš interim přepis (co právě říkáš)

2. **🔊 Tlačítko reproduktoru** - Na každé zprávě AI
   - Klikni a poslouchej odpověď
   - Automatické zastavení ostatních přehrávání

### Jak to funguje

```typescript
// V ChatPanel.tsx

// 1. Klikneš na mikrofon
const startListening = () => {
  recognitionRef.current?.start()
  setIsListening(true)
}

// 2. Mluvíš...
recognitionRef.current.onresult = (event) => {
  // Real-time přepis
  setInterimTranscript(event.results[0][0].transcript)

  // Finální text přidán do inputu
  if (event.results[0].isFinal) {
    setMessage(prev => prev + transcript)
  }
}

// 3. Zastavíš mikrofon
stopListening()

// 4. Odešleš zprávu jako normálně!
```

## Podporované jazyky

```typescript
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
]
```

## API Reference

### SpeechToText

```typescript
class SpeechToText {
  constructor(language: string, continuous: boolean)

  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    onEnd?: () => void
  ): void

  stop(): void
  abort(): void
  setLanguage(lang: string): void
  getIsListening(): boolean

  static isSupported(): boolean
}
```

### BrowserTTS

```typescript
class BrowserTTS {
  speak(text: string, options?: {
    voice?: string
    rate?: number
    pitch?: number
    volume?: number
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: Error) => void
  }): void

  stop(): void
  pause(): void
  resume(): void

  getVoices(): SpeechSynthesisVoice[]
  isSpeaking(): boolean
  isPaused(): boolean

  static isSupported(): boolean
}
```

### TTSManager

```typescript
class TTSManager {
  constructor(settings: VoiceSettings)

  speak(text: string): Promise<void>
  stop(): void
  updateSettings(settings: VoiceSettings): void
}
```

## Utility Functions

### cleanTextForTTS

Vyčistí text pro TTS (odstraní kód, markdown, atd.)

```typescript
import { cleanTextForTTS } from '@page-assist/voice'

const cleaned = cleanTextForTTS('Here is some `code` and **markdown**')
// "Here is some [kod] and markdown"
```

### splitTextForTTS

Rozdělí dlouhý text na kratší části pro TTS

```typescript
import { splitTextForTTS } from '@page-assist/voice'

const chunks = splitTextForTTS(longText, 500)
// ['Chunk 1...', 'Chunk 2...', ...]
```

## Browser Support

### Speech Recognition
✅ Chrome/Edge (Web Speech API)
✅ Safari 14.1+
❌ Firefox (zatím nepodporováno)

### Speech Synthesis
✅ Chrome/Edge
✅ Safari
✅ Firefox
✅ Opera

## Advanced Usage

### ElevenLabs TTS

```typescript
import { ElevenLabsTTS } from '@page-assist/voice'

const tts = new ElevenLabsTTS(
  'your-api-key',
  'voice-id',
  'model-id'
)

const result = await tts.speak('Hello world!')
// Přehrát audio
const audio = new Audio(result.audioUrl)
audio.play()
```

### OpenAI TTS

```typescript
import { OpenAITTS } from '@page-assist/voice'

const tts = new OpenAITTS(
  'your-api-key',
  'https://api.openai.com/v1',
  'tts-1',
  'alloy'
)

const result = await tts.speak('Hello!', 1.0)
const audio = new Audio(result.audioUrl)
audio.play()
```

## Tips & Tricks

### 1. Auto-submit po diktování

```typescript
const [autoSubmit, setAutoSubmit] = useState(true)

stt.start((result) => {
  if (result.isFinal && autoSubmit) {
    handleSend() // Automaticky odešle
  }
})
```

### 2. Indikátor nahrávání

```typescript
{isListening && (
  <Badge variant="warning" className="animate-pulse">
    🎤 Recording
  </Badge>
)}
```

### 3. TTS na každou odpověď

```typescript
const handleSend = async () => {
  const response = await sendMessage(message)

  // Auto-přehrát odpověď
  if (ttsEnabled) {
    speakText(response)
  }
}
```

## Troubleshooting

### Speech Recognition nefunguje

1. **Zkontroluj prohlížeč** - Funguje jen v Chrome/Edge/Safari
2. **HTTPS required** - Speech API vyžaduje HTTPS (nebo localhost)
3. **Microphone permission** - Uživatel musí povolit mikrofon

### TTS nefunguje

1. **Zkontroluj voices** - `speechSynthesis.getVoices()`
2. **Počkej na voices** - Voices se načítají asynchronně
3. **Zkus jiný hlas** - Ne všechny hlasy podporují všechny jazyky

### Interim transcript se nezobrazuje

```typescript
recognition.interimResults = true // MUSÍ být true!
```

## Performance

- **STT** - Negligible overhead (browser API)
- **Browser TTS** - Zdarma, rychlé, offline
- **ElevenLabs TTS** - Platba za znaky, vysoká kvalita
- **OpenAI TTS** - Platba za znaky, rychlé

## Examples

Více příkladů najdeš v:
- `plugins/page-assist-plugin/src/panels/ChatPanel.tsx`
- `src/components/Sidepanel/Chat/form.tsx` (original extension)

## License

MIT

---

**Vytvořeno s ❤️ pro Page Assist 2.0**

*Teď už nemusíš ťukat do klávesnice! 🎤🚀*
