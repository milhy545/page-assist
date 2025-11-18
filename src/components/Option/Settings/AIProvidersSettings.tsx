/**
 * AI Providers Settings Component
 * Configuration UI for new AI providers (Mercury, Claude, Groq, etc.)
 */

import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Tabs,
  Alert,
  Divider,
  Tag,
  Tooltip,
  InputNumber,
} from 'antd'
import {
  ThunderboltOutlined,
  BrainCircuitOutlined,
  CloudOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { MERCURY_MODELS } from '@/models/ChatMercury'
import { CLAUDE_MODELS } from '@/models/ChatAnthropic'
import { GENERIC_PROVIDERS } from '@/models/ChatGeneric'
import { IMAGE_GENERATION_MODELS } from '@/models/ImageGeneration'

const { TabPane } = Tabs
const { Option } = Select

interface AIProviderConfig {
  id: string
  enabled: boolean
  apiKey: string
  baseURL?: string
  defaultModel?: string
  settings?: Record<string, any>
}

export const AIProvidersSettings: React.FC = () => {
  const [form] = Form.useForm()
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const testConnection = async (provider: string, apiKey: string, baseURL?: string) => {
    setTestingConnection(provider)
    try {
      // Simulate API test (in real implementation, make actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTestResults(prev => ({ ...prev, [provider]: true }))
      return true
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: false }))
      return false
    } finally {
      setTestingConnection(null)
    }
  }

  const renderProviderStatus = (provider: string) => {
    if (testingConnection === provider) {
      return <Tag color="processing">Testing...</Tag>
    }
    if (testResults[provider] === true) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Connected</Tag>
    }
    if (testResults[provider] === false) {
      return <Tag color="error">Failed</Tag>
    }
    return null
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2>AI Providers Configuration</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Configure API keys and settings for various AI providers to unlock powerful capabilities.
      </p>

      <Tabs defaultActiveKey="text-generation">
        {/* Text Generation Providers */}
        <TabPane
          tab={
            <span>
              <BrainCircuitOutlined />
              Text Generation
            </span>
          }
          key="text-generation"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Mercury (Inception Labs) */}
            <Card
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#1890ff' }} />
                  Mercury (Inception Labs)
                  <Tag color="blue">Ultra-Fast</Tag>
                  <Tag color="green">5-10x Faster</Tag>
                </Space>
              }
              extra={renderProviderStatus('mercury')}
            >
              <Alert
                message="Mercury is the world's first commercial-scale diffusion LLM"
                description="Get ultra-fast inference: 1109 tokens/sec (Mini model). Perfect for code generation."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16 }}
              />

              <Form layout="vertical">
                <Form.Item
                  label="API Key"
                  tooltip="Get your API key from https://platform.inceptionlabs.ai"
                >
                  <Input.Password
                    placeholder="Enter Mercury API key"
                    onChange={e => form.setFieldValue('mercuryApiKey', e.target.value)}
                  />
                </Form.Item>

                <Form.Item label="Default Model">
                  <Select defaultValue={MERCURY_MODELS[0].id}>
                    {MERCURY_MODELS.map(model => (
                      <Option key={model.id} value={model.id}>
                        <Space>
                          <span>{model.name}</span>
                          <Tag color="blue">{model.contextLength} tokens</Tag>
                        </Space>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {model.description}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Alert
                  message="Pricing: $0.25/1M input tokens, $1.00/1M output tokens"
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Button
                  type="primary"
                  onClick={() => testConnection('mercury', form.getFieldValue('mercuryApiKey'))}
                  loading={testingConnection === 'mercury'}
                >
                  Test Connection
                </Button>
              </Form>
            </Card>

            {/* Anthropic Claude */}
            <Card
              title={
                <Space>
                  <BrainCircuitOutlined style={{ color: '#d46b08' }} />
                  Anthropic Claude
                  <Tag color="orange">Advanced Reasoning</Tag>
                  <Tag color="purple">200K Context</Tag>
                </Space>
              }
              extra={renderProviderStatus('claude')}
            >
              <Alert
                message="Claude excels at analysis, coding, and nuanced conversation"
                description="Claude 3.5 Sonnet is recommended for most tasks. Opus for the most complex reasoning."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form layout="vertical">
                <Form.Item
                  label="API Key"
                  tooltip="Get your API key from https://console.anthropic.com"
                >
                  <Input.Password placeholder="Enter Anthropic API key" />
                </Form.Item>

                <Form.Item label="Default Model">
                  <Select defaultValue={CLAUDE_MODELS[0].id}>
                    {CLAUDE_MODELS.map(model => (
                      <Option key={model.id} value={model.id}>
                        <Space>
                          <span>{model.name}</span>
                          <Tag color="purple">{model.contextLength.toLocaleString()} tokens</Tag>
                        </Space>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {model.description}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Button type="primary" onClick={() => testConnection('claude', '')}>
                  Test Connection
                </Button>
              </Form>
            </Card>

            {/* Groq (Ultra-Fast) */}
            <Card
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#52c41a' }} />
                  Groq
                  <Tag color="green">800 tokens/sec</Tag>
                  <Tag color="cyan">Free Tier</Tag>
                </Space>
              }
              extra={renderProviderStatus('groq')}
            >
              <Alert
                message="Groq provides ultra-fast LLM inference"
                description="Up to 800 tokens/sec with Llama 3.3 70B. Perfect for real-time applications."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form layout="vertical">
                <Form.Item
                  label="API Key"
                  tooltip="Get your API key from https://console.groq.com"
                >
                  <Input.Password placeholder="Enter Groq API key" />
                </Form.Item>

                <Form.Item label="Default Model">
                  <Select defaultValue="llama-3.3-70b-versatile">
                    {GENERIC_PROVIDERS.groq.models.map(model => (
                      <Option key={model.id} value={model.id}>
                        <Space>
                          <span>{model.name}</span>
                          <Tag color="green">{model.contextLength.toLocaleString()} tokens</Tag>
                        </Space>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {model.description}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Button type="primary" onClick={() => testConnection('groq', '')}>
                  Test Connection
                </Button>
              </Form>
            </Card>

            {/* Mistral AI */}
            <Card
              title={
                <Space>
                  <CloudOutlined style={{ color: '#722ed1' }} />
                  Mistral AI
                  <Tag color="purple">128K Context</Tag>
                </Space>
              }
              extra={renderProviderStatus('mistral')}
            >
              <Form layout="vertical">
                <Form.Item label="API Key">
                  <Input.Password placeholder="Enter Mistral API key" />
                </Form.Item>

                <Form.Item label="Default Model">
                  <Select defaultValue="mistral-large-latest">
                    {GENERIC_PROVIDERS.mistral.models.map(model => (
                      <Option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Button type="primary">Test Connection</Button>
              </Form>
            </Card>
          </Space>
        </TabPane>

        {/* Image Generation Providers */}
        <TabPane
          tab={
            <span>
              <PictureOutlined />
              Image Generation
            </span>
          }
          key="image-generation"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* DALL-E 3 */}
            <Card
              title={
                <Space>
                  <PictureOutlined style={{ color: '#1890ff' }} />
                  DALL-E 3 (OpenAI)
                  <Tag color="blue">HD Quality</Tag>
                </Space>
              }
            >
              <Alert
                message={IMAGE_GENERATION_MODELS.dalle3.description}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form layout="vertical">
                <Form.Item label="OpenAI API Key">
                  <Input.Password placeholder="Enter OpenAI API key" />
                </Form.Item>

                <Form.Item label="Default Quality">
                  <Select defaultValue="hd">
                    <Option value="standard">Standard</Option>
                    <Option value="hd">HD</Option>
                  </Select>
                </Form.Item>

                <Button type="primary">Save Configuration</Button>
              </Form>
            </Card>

            {/* Stable Diffusion */}
            <Card
              title={
                <Space>
                  <PictureOutlined style={{ color: '#52c41a' }} />
                  Stable Diffusion (Stability AI)
                  <Tag color="green">Open Source</Tag>
                </Space>
              }
            >
              <Form layout="vertical">
                <Form.Item label="Stability AI API Key">
                  <Input.Password placeholder="Enter Stability AI API key" />
                </Form.Item>

                <Form.Item label="Model">
                  <Select defaultValue="sd3">
                    <Option value="sd3">Stable Diffusion 3</Option>
                    <Option value="sdxl">Stable Diffusion XL</Option>
                  </Select>
                </Form.Item>

                <Button type="primary">Save Configuration</Button>
              </Form>
            </Card>

            {/* Flux */}
            <Card
              title={
                <Space>
                  <PictureOutlined style={{ color: '#722ed1' }} />
                  Flux (Replicate)
                  <Tag color="purple">Photorealistic</Tag>
                </Space>
              }
            >
              <Form layout="vertical">
                <Form.Item label="Replicate API Key">
                  <Input.Password placeholder="Enter Replicate API key" />
                </Form.Item>

                <Form.Item label="Model">
                  <Select defaultValue="flux-1.1-pro">
                    <Option value="flux-1.1-pro">Flux 1.1 Pro</Option>
                    <Option value="flux-dev">Flux Dev</Option>
                  </Select>
                </Form.Item>

                <Button type="primary">Save Configuration</Button>
              </Form>
            </Card>
          </Space>
        </TabPane>

        {/* Model Comparison */}
        <TabPane tab="Model Comparison" key="comparison">
          <Card>
            <h3>Speed Comparison (tokens/sec)</h3>
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mercury Mini:</span>
                  <Tag color="blue">1109 tokens/sec</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Groq (Llama 3.3):</span>
                  <Tag color="green">800 tokens/sec</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mercury Small:</span>
                  <Tag color="blue">737 tokens/sec</Tag>
                </div>
              </Space>
            </div>

            <Divider />

            <h3>Context Window Comparison</h3>
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Claude 3.5 Sonnet:</span>
                  <Tag color="purple">200,000 tokens</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mistral Large:</span>
                  <Tag color="purple">128,000 tokens</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Groq (Llama 3.3):</span>
                  <Tag color="green">128,000 tokens</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mercury Coder:</span>
                  <Tag color="blue">16,384 tokens</Tag>
                </div>
              </Space>
            </div>

            <Divider />

            <h3>Recommended Use Cases</h3>
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Alert
                  message="Fast Code Generation"
                  description="Use Mercury Coder Mini or Groq for ultra-fast code suggestions"
                  type="info"
                  showIcon
                />
                <Alert
                  message="Complex Reasoning"
                  description="Use Claude 3.5 Sonnet or Opus for advanced analysis and reasoning"
                  type="info"
                  showIcon
                />
                <Alert
                  message="Long Documents"
                  description="Use Claude models with 200K context for processing large documents"
                  type="info"
                  showIcon
                />
                <Alert
                  message="Real-time Chat"
                  description="Use Groq or Mercury for instant responses in conversational AI"
                  type="info"
                  showIcon
                />
              </Space>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AIProvidersSettings
