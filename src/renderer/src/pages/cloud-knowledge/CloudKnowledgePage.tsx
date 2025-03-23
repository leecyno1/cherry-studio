import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { Navbar, NavbarCenter, NavbarRight } from '@renderer/components/app/Navbar'
import { HStack } from '@renderer/components/Layout'
import ListItem from '@renderer/components/ListItem'
import Scrollbar from '@renderer/components/Scrollbar'
import VisualizationViewer from '@renderer/components/VisualizationViewer'
import { isWindows } from '@renderer/config/constant'
import { useKnowledgeBases } from '@renderer/hooks/useKnowledge'
import { NavbarIcon } from '@renderer/pages/home/Navbar'
import CloudKnowledgeService from '@renderer/services/CloudKnowledgeService'
import { KnowledgeBase } from '@renderer/types'
import { Button, Empty, Modal, Spin, Tooltip, message } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const CloudKnowledgePage: FC = () => {
  const { t } = useTranslation()
  const { bases } = useKnowledgeBases()
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cloudBases, setCloudBases] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // 可视化相关状态
  const [visualizationModalVisible, setVisualizationModalVisible] = useState(false)
  const [visualizationData, setVisualizationData] = useState<string | undefined>()
  const [visualizationLoading, setVisualizationLoading] = useState(false)
  const [visualizationError, setVisualizationError] = useState<string | undefined>()
  const [selectedCloudBase, setSelectedCloudBase] = useState<any | null>(null)

  // 从云端获取知识库列表
  const fetchCloudBases = async () => {
    try {
      setIsLoading(true)
      const data = await CloudKnowledgeService.getCloudBases()
      setCloudBases(data)
    } catch (error) {
      console.error('获取云端知识库失败:', error)
      message.error(t('cloudKnowledge.fetch_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchCloudBases()
  }, [])

  const handleUploadToCloud = async () => {
    if (!selectedBase) {
      message.warning(t('message.error.enter.name'))
      return
    }

    try {
      setIsUploading(true)
      const result = await CloudKnowledgeService.uploadToCloud(selectedBase)
      if (result && result.success) {
        message.success(t('cloudKnowledge.upload_success'))
        // 刷新云端知识库列表
        await fetchCloudBases()
      } else {
        message.error(result.message || t('cloudKnowledge.upload_failed'))
      }
    } catch (error: any) {
      console.error('上传知识库失败:', error)
      message.error(error.message || t('cloudKnowledge.upload_failed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSyncFromCloud = async () => {
    try {
      setIsSyncing(true)
      const result = await CloudKnowledgeService.syncFromCloud()
      if (result && result.success) {
        message.success(t('cloudKnowledge.sync_success'))
        // 刷新云端知识库列表
        await fetchCloudBases()
      } else {
        message.error(result.message || t('cloudKnowledge.sync_failed'))
      }
    } catch (error: any) {
      console.error('同步知识库失败:', error)
      message.error(error.message || t('cloudKnowledge.sync_failed'))
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteCloudBase = async (baseId: string) => {
    try {
      const result = await CloudKnowledgeService.deleteCloudBase(baseId)
      if (result && result.success) {
        message.success(t('cloudKnowledge.delete_success'))
        // 刷新云端知识库列表
        await fetchCloudBases()
      } else {
        message.error(result.message || t('cloudKnowledge.delete_failed'))
      }
    } catch (error: any) {
      console.error('删除知识库失败:', error)
      message.error(error.message || t('cloudKnowledge.delete_failed'))
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchCloudBases()
      return
    }

    try {
      setIsLoading(true)
      const result = await CloudKnowledgeService.searchCloudBase(searchTerm)
      if (result && result.results) {
        setCloudBases(result.results)
      } else {
        setCloudBases([])
      }
    } catch (error) {
      console.error('搜索知识库失败:', error)
      message.error(t('cloudKnowledge.search_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 打开可视化查看器
  const openVisualization = async (cloudBase: any) => {
    setSelectedCloudBase(cloudBase)
    setVisualizationModalVisible(true)
    setVisualizationData(undefined)
    setVisualizationError(undefined)
    
    try {
      setVisualizationLoading(true)
      const svgData = await CloudKnowledgeService.getDataVisualization(cloudBase.id)
      setVisualizationData(svgData)
    } catch (error: any) {
      console.error('获取知识库可视化数据失败:', error)
      setVisualizationError(error.message || t('visualization.load_error'))
    } finally {
      setVisualizationLoading(false)
    }
  }

  // 刷新可视化数据
  const refreshVisualization = async () => {
    if (!selectedCloudBase) return
    
    try {
      setVisualizationLoading(true)
      setVisualizationError(undefined)
      const svgData = await CloudKnowledgeService.getDataVisualization(selectedCloudBase.id)
      setVisualizationData(svgData)
    } catch (error: any) {
      console.error('刷新知识库可视化数据失败:', error)
      setVisualizationError(error.message || t('visualization.load_error'))
    } finally {
      setVisualizationLoading(false)
    }
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter>
          <Title>{t('cloudKnowledge.title')}</Title>
        </NavbarCenter>
        <NavbarRight style={{ paddingRight: isWindows ? 140 : 20 }}>
          <HStack alignItems="center" gap={8}>
            <Tooltip title={t('cloudKnowledge.search')} mouseEnterDelay={0.5}>
              <NavbarIcon onClick={handleSearch}>
                <SearchOutlined />
              </NavbarIcon>
            </Tooltip>
            <Tooltip title={t('cloudKnowledge.sync')} mouseEnterDelay={0.5}>
              <NavbarIcon onClick={handleSyncFromCloud} disabled={isSyncing}>
                {isSyncing ? <Spin size="small" /> : <SyncOutlined />}
              </NavbarIcon>
            </Tooltip>
            <Tooltip title={t('cloudKnowledge.add')} mouseEnterDelay={0.5}>
              <NavbarIcon onClick={handleUploadToCloud} disabled={isUploading || !selectedBase}>
                <PlusOutlined />
              </NavbarIcon>
            </Tooltip>
          </HStack>
        </NavbarRight>
      </Navbar>

      <Content>
        <LeftPanel>
          <PanelTitle>{t('common.knowledge_base')}</PanelTitle>
          <Scrollbar>
            {bases.length > 0 ? (
              bases.map(base => (
                <ListItem
                  key={base.id}
                  active={selectedBase?.id === base.id}
                  onClick={() => setSelectedBase(base)}
                  title={base.name}
                  extra={
                    <Tooltip title={t('cloudKnowledge.upload')}>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloudUploadOutlined />}
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedBase(base)
                          handleUploadToCloud()
                        }}
                        loading={isUploading && selectedBase?.id === base.id}
                      />
                    </Tooltip>
                  }
                />
              ))
            ) : (
              <EmptyView>
                <Empty description={t('knowledge.empty')} />
              </EmptyView>
            )}
          </Scrollbar>
        </LeftPanel>

        <RightPanel>
          <PanelTitle>
            <HStack justifyContent="space-between" alignItems="center">
              <span>{t('cloudKnowledge.title')}</span>
              {isLoading && <Spin size="small" />}
            </HStack>
          </PanelTitle>
          <Scrollbar>
            {cloudBases.length > 0 ? (
              cloudBases.map(cloudBase => (
                <ListItem
                  key={cloudBase.id}
                  title={cloudBase.name}
                  subtitle={cloudBase.description}
                  extra={
                    <HStack gap={4}>
                      <Tooltip title={t('visualization.view')}>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<BarChartOutlined />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            openVisualization(cloudBase);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title={t('common.edit')}>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EditOutlined />} 
                        />
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <Button 
                          type="text" 
                          danger 
                          size="small" 
                          icon={<DeleteOutlined />} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCloudBase(cloudBase.id);
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  }
                />
              ))
            ) : (
              <EmptyView>
                {isLoading ? (
                  <Spin size="large" />
                ) : (
                  <>
                    <Empty description={t('cloudKnowledge.empty')} />
                    <UploadButton 
                      type="primary" 
                      icon={<CloudUploadOutlined />} 
                      onClick={handleUploadToCloud}
                      loading={isUploading}
                      disabled={!selectedBase}
                    >
                      {t('cloudKnowledge.upload')}
                    </UploadButton>
                    <Note>{t('common.select')} {t('common.knowledge_base')} {t('cloudKnowledge.upload')}</Note>
                  </>
                )}
              </EmptyView>
            )}
          </Scrollbar>
        </RightPanel>
      </Content>

      {/* 可视化查看器模态框 */}
      <Modal
        title={selectedCloudBase?.name}
        open={visualizationModalVisible}
        onCancel={() => setVisualizationModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 30 }}
        bodyStyle={{ padding: 0, height: 600 }}
      >
        <VisualizationViewer
          data={visualizationData}
          loading={visualizationLoading}
          error={visualizationError}
          onRefresh={refreshVisualization}
        />
      </Modal>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--color-background);
`

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const LeftPanel = styled.div`
  width: 240px;
  height: 100%;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`

const RightPanel = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const PanelTitle = styled.div`
  padding: 12px 15px;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
`

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
`

const EmptyView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
`

const UploadButton = styled(Button)`
  margin-top: 16px;
`

const Note = styled.div`
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-text-3);
  text-align: center;
`

export default CloudKnowledgePage 