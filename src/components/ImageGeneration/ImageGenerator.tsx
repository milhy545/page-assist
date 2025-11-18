/**
 * Image Generator Component
 * UI for generating images with DALL-E 3, Stable Diffusion, and Flux
 */

import React, { useState } from 'react'
import { Button, Input, Select, Form, Card, Image, Spin, Alert, Space, InputNumber } from 'antd'
import { PictureOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  createImageProvider,
  IMAGE_GENERATION_MODELS,
  type ImageGenerationParams,
  type ImageResult,
} from '@/models/ImageGeneration'

const { TextArea } = Input
const { Option } = Select

interface ImageGeneratorProps {
  onImageGenerated?: (images: ImageResult[]) => void
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<'dalle3' | 'stable-diffusion' | 'flux'>(
    'dalle3'
  )

  const handleGenerate = async (values: any) => {
    setLoading(true)
    setError(null)
    setImages([])

    try {
      const provider = createImageProvider(selectedProvider, values.apiKey, {
        model: values.model,
      })

      const params: ImageGenerationParams = {
        prompt: values.prompt,
        negativePrompt: values.negativePrompt,
        width: values.width,
        height: values.height,
        steps: values.steps,
        guidanceScale: values.guidanceScale,
        seed: values.seed,
        numImages: values.numImages || 1,
        quality: values.quality,
        style: values.style,
      }

      const results = await provider.generate(params)
      setImages(results)
      onImageGenerated?.(results)
    } catch (err: any) {
      setError(err.message || 'Failed to generate image')
      console.error('Image generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `generated-image-${index + 1}.png`
    link.click()
  }

  const renderProviderFields = () => {
    switch (selectedProvider) {
      case 'dalle3':
        return (
          <>
            <Form.Item
              name="quality"
              label="Quality"
              initialValue="standard"
            >
              <Select>
                <Option value="standard">Standard</Option>
                <Option value="hd">HD</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="style"
              label="Style"
              initialValue="vivid"
            >
              <Select>
                <Option value="vivid">Vivid</Option>
                <Option value="natural">Natural</Option>
              </Select>
            </Form.Item>

            <Alert
              message="DALL-E 3 generates 1 image per request"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </>
        )

      case 'stable-diffusion':
        return (
          <>
            <Form.Item
              name="negativePrompt"
              label="Negative Prompt"
              tooltip="What to avoid in the image"
            >
              <TextArea rows={2} placeholder="blurry, low quality, distorted" />
            </Form.Item>

            <Form.Item
              name="steps"
              label="Steps"
              initialValue={30}
              tooltip="Number of inference steps (higher = better quality, slower)"
            >
              <InputNumber min={1} max={150} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="guidanceScale"
              label="Guidance Scale"
              initialValue={7.5}
              tooltip="How closely to follow the prompt (higher = more literal)"
            >
              <InputNumber min={1} max={20} step={0.5} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="numImages"
              label="Number of Images"
              initialValue={1}
            >
              <InputNumber min={1} max={4} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )

      case 'flux':
        return (
          <>
            <Form.Item
              name="steps"
              label="Steps"
              initialValue={28}
            >
              <InputNumber min={1} max={50} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="guidanceScale"
              label="Guidance Scale"
              initialValue={3.5}
            >
              <InputNumber min={1} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card title="AI Image Generator" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={{
            provider: 'dalle3',
            width: 1024,
            height: 1024,
          }}
        >
          <Form.Item
            name="provider"
            label="Provider"
            rules={[{ required: true, message: 'Please select a provider' }]}
          >
            <Select onChange={(value) => setSelectedProvider(value)}>
              <Option value="dalle3">
                {IMAGE_GENERATION_MODELS.dalle3.name} - {IMAGE_GENERATION_MODELS.dalle3.provider}
              </Option>
              <Option value="stable-diffusion">
                {IMAGE_GENERATION_MODELS.sd3.name} - {IMAGE_GENERATION_MODELS.sd3.provider}
              </Option>
              <Option value="flux">
                {IMAGE_GENERATION_MODELS.flux_pro.name} - {IMAGE_GENERATION_MODELS.flux_pro.provider}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: 'Please enter your API key' }]}
          >
            <Input.Password placeholder="Enter your API key" />
          </Form.Item>

          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: 'Please enter a prompt' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the image you want to generate..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="width"
              label="Width"
            >
              <InputNumber min={256} max={2048} step={64} />
            </Form.Item>

            <Form.Item
              name="height"
              label="Height"
            >
              <InputNumber min={256} max={2048} step={64} />
            </Form.Item>

            <Form.Item
              name="seed"
              label="Seed (optional)"
              tooltip="For reproducible results"
            >
              <InputNumber min={0} max={999999} />
            </Form.Item>
          </Space>

          {renderProviderFields()}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PictureOutlined />}
              loading={loading}
              size="large"
              block
            >
              Generate Image
            </Button>
          </Form.Item>
        </Form>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginTop: 16 }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Generating your image...</p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              This may take a few seconds to a minute depending on the model
            </p>
          </div>
        )}

        {images.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3>Generated Images</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {images.map((image, index) => (
                <Card
                  key={index}
                  cover={
                    <Image
                      src={image.url || `data:image/png;base64,${image.b64_json}`}
                      alt={`Generated image ${index + 1}`}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  }
                  actions={[
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => downloadImage(image.url || '', index)}
                    >
                      Download
                    </Button>,
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => form.submit()}
                    >
                      Regenerate
                    </Button>,
                  ]}
                >
                  {image.revisedPrompt && (
                    <Card.Meta
                      description={
                        <div>
                          <strong>Revised Prompt:</strong>
                          <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            {image.revisedPrompt}
                          </p>
                        </div>
                      }
                    />
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ImageGenerator
