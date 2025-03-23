import { Button, Input, Spin, Switch, message } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { CheckOutlined, LinkOutlined } from '@ant-design/icons'
import { useTheme } from '@renderer/context/ThemeProvider'
import { VStack, HStack } from '@renderer/components/Layout'
import CloudKnowledgeService from '@renderer/services/CloudKnowledgeService'
import { 
  SettingRow, 
  SettingRowTitle, 
  SettingTitle, 
  SettingGroup, 
  SettingDivider 
} from '..'

const ZeaberSettings: FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isValidConnection, setIsValidConnection] = useState(false)

  // 加载保存的设置
  useEffect(() => {
    const savedApiKey = CloudKnowledgeService.getApiKey() || ''
    const savedApiUrl = CloudKnowledgeService.getBaseUrl() || ''
    setApiKey(savedApiKey)
    setApiUrl(savedApiUrl)
  }, [])

  // 保存API Key
  const handleSaveApiKey = () => {
    CloudKnowledgeService.setApiKey(apiKey.trim())
    message.success(t('settings.data.cloud.api_key_saved'))
  }

  // 保存API URL
  const handleSaveApiUrl = () => {
    CloudKnowledgeService.setBaseUrl(apiUrl.trim())
    message.success(t('settings.data.cloud.api_url_saved'))
  }

  // 测试连接
  const handleTestConnection = async () => {
    if (!apiKey) {
      message.warning(t('settings.data.cloud.empty_api_key'))
      return
    }

    if (!apiUrl) {
      message.warning(t('settings.data.cloud.empty_api_url'))
      return
    }

    try {
      setIsTestingConnection(true)
      setIsValidConnection(false)

      // 先保存当前设置
      CloudKnowledgeService.setApiKey(apiKey.trim())
      CloudKnowledgeService.setBaseUrl(apiUrl.trim())
      
      const result = await CloudKnowledgeService.verifyConnection()
      
      if (result.valid) {
        setIsValidConnection(true)
        message.success(t('settings.data.cloud.connection_successful'))
      } else {
        message.error(result.message || t('settings.data.cloud.connection_failed'))
      }
    } catch (error: any) {
      console.error('测试Zeaber连接失败:', error)
      message.error(error.message || t('settings.data.cloud.connection_failed'))
    } finally {
      setIsTestingConnection(false)
      setTimeout(() => setIsValidConnection(false), 3000)
    }
  }

  return (
    <div>
      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.data.cloud.title')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('settings.data.cloud.api_url')}</SettingRowTitle>
          <HStack alignItems="center" gap="5px" style={{ width: 315 }}>
            <Input
              placeholder={t('settings.data.cloud.api_url_placeholder')}
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              onBlur={handleSaveApiUrl}
              style={{ flex: 1 }}
            />
          </HStack>
        </SettingRow>
        <SettingRow>
          <SettingRowTitle>{t('settings.data.cloud.api_key')}</SettingRowTitle>
          <HStack alignItems="center" gap="5px" style={{ width: 315 }}>
            <Input.Password
              placeholder={t('settings.data.cloud.api_key_placeholder')}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onBlur={handleSaveApiKey}
              style={{ flex: 1 }}
            />
          </HStack>
        </SettingRow>
        <SettingRow>
          <SettingRowTitle>{t('settings.data.cloud.connection')}</SettingRowTitle>
          <HStack alignItems="center" gap="5px" style={{ width: 315 }}>
            <Button
              type="primary"
              icon={isTestingConnection ? <Spin size="small" /> : <LinkOutlined />}
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              style={{ marginRight: 10 }}
            >
              {t('settings.data.cloud.test_connection')}
            </Button>
            {isValidConnection && (
              <StatusText valid>
                <CheckOutlined /> {t('settings.data.cloud.valid')}
              </StatusText>
            )}
          </HStack>
        </SettingRow>
      </SettingGroup>

      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.data.cloud.help')}</SettingTitle>
        <SettingDivider />
        <HelpText>
          <p>{t('settings.data.cloud.help_text_1')}</p>
          <p>{t('settings.data.cloud.help_text_2')}</p>
          <ol>
            <li>{t('settings.data.cloud.help_step_1')}</li>
            <li>{t('settings.data.cloud.help_step_2')}</li>
            <li>{t('settings.data.cloud.help_step_3')}</li>
          </ol>
          <p>
            <a 
              href="https://zeaber.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t('settings.data.cloud.learn_more')}
            </a>
          </p>
        </HelpText>
      </SettingGroup>
    </div>
  )
}

const StatusText = styled.span<{ valid: boolean }>`
  color: ${props => (props.valid ? 'var(--color-success)' : 'var(--color-error)')};
  display: flex;
  align-items: center;
  gap: 5px;
`

const HelpText = styled.div`
  padding: 0 15px 15px;
  color: var(--color-text-2);
  font-size: 14px;
  line-height: 1.5;
  
  p {
    margin-bottom: 10px;
  }
  
  ol {
    margin-left: 20px;
    margin-bottom: 10px;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

export default ZeaberSettings 