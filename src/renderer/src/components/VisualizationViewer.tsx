import { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Spin, Button, Empty, Tooltip } from 'antd'
import { DownloadOutlined, FullscreenOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { download } from '@renderer/utils/download'

interface VisualizationViewerProps {
  data?: string
  loading?: boolean
  error?: string
  onRefresh?: () => void
}

/**
 * 知识库可视化查看器组件
 * 
 * 用于展示SVG格式的知识库可视化内容，支持缩放、下载等功能
 */
const VisualizationViewer: FC<VisualizationViewerProps> = ({ data, loading, error, onRefresh }) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  // 处理缩放
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  // 切换全屏
  const toggleFullscreen = () => {
    setFullscreen(prev => !prev)
  }

  // 下载SVG
  const handleDownload = () => {
    if (!data) return
    
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    download(url, `knowledge-visualization-${Date.now()}.svg`)
    URL.revokeObjectURL(url)
  }

  // 当全屏状态变化时调整容器
  useEffect(() => {
    if (containerRef.current) {
      if (fullscreen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [fullscreen])

  return (
    <Container ref={containerRef} fullscreen={fullscreen}>
      <Toolbar>
        <ToolbarTitle>{t('visualization.title')}</ToolbarTitle>
        <ToolbarActions>
          <Tooltip title={t('visualization.zoom_in')}>
            <Button 
              type="text" 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn} 
              disabled={scale >= 3}
            />
          </Tooltip>
          <Tooltip title={t('visualization.zoom_out')}>
            <Button 
              type="text" 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut} 
              disabled={scale <= 0.5}
            />
          </Tooltip>
          <Tooltip title={t('visualization.download')}>
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={handleDownload} 
              disabled={!data}
            />
          </Tooltip>
          <Tooltip title={fullscreen ? t('visualization.exit_fullscreen') : t('visualization.fullscreen')}>
            <Button 
              type="text" 
              icon={<FullscreenOutlined />} 
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </ToolbarActions>
      </Toolbar>
      
      <Content>
        {loading ? (
          <LoadingContainer>
            <Spin size="large" />
            <div>{t('common.loading')}</div>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <Empty 
              description={error || t('visualization.load_error')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            {onRefresh && (
              <Button onClick={onRefresh} style={{ marginTop: 16 }}>
                {t('common.retry')}
              </Button>
            )}
          </ErrorContainer>
        ) : !data ? (
          <EmptyContainer>
            <Empty description={t('visualization.no_data')} />
          </EmptyContainer>
        ) : (
          <SVGContainer 
            ref={svgContainerRef}
            scale={scale}
            dangerouslySetInnerHTML={{ __html: data }}
          />
        )}
      </Content>
    </Container>
  )
}

const Container = styled.div<{ fullscreen: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--color-background-2);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  
  ${props => props.fullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
    border: none;
  `}
`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background);
`

const ToolbarTitle = styled.div`
  font-weight: 600;
  color: var(--color-text);
`

const ToolbarActions = styled.div`
  display: flex;
  gap: 4px;
`

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SVGContainer = styled.div<{ scale: number }>`
  transform: scale(${props => props.scale});
  transform-origin: center center;
  transition: transform 0.2s ease;
  max-width: 100%;
  max-height: 100%;
  
  svg {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--color-text-2);
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`

export default VisualizationViewer 