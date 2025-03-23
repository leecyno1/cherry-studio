import { KnowledgeBase } from '@renderer/types'
import FileManager from './FileManager'
import axios from 'axios'

/**
 * 云端知识库服务 - 管理与Zeaber服务器的通信
 * 
 * 该服务处理本地知识库上传到云端、从云端获取知识库列表、搜索云端知识库等操作
 */
class CloudKnowledgeService {
  // Zeaber API基础URL，从localStorage获取或使用默认值
  private baseUrl: string
  private apiKey: string | null = null

  constructor() {
    this.baseUrl = localStorage.getItem('zeaber_api_url') || 'https://api.zeaber.com'
    this.apiKey = localStorage.getItem('zeaber_api_key')
  }

  /**
   * 设置API基础URL
   */
  setBaseUrl(url: string) {
    this.baseUrl = url
    localStorage.setItem('zeaber_api_url', url)
  }

  /**
   * 获取API基础URL
   */
  getBaseUrl(): string {
    return this.baseUrl
  }

  /**
   * 设置API密钥
   */
  setApiKey(key: string) {
    this.apiKey = key
    localStorage.setItem('zeaber_api_key', key)
  }

  /**
   * 获取API密钥
   */
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('zeaber_api_key')
    }
    return this.apiKey
  }

  /**
   * 创建API请求头
   */
  private createHeaders() {
    const apiKey = this.getApiKey()
    return {
      'Content-Type': 'application/json',
      'Authorization': apiKey ? `Bearer ${apiKey}` : ''
    }
  }

  /**
   * 验证API连接
   */
  async verifyConnection(): Promise<{ valid: boolean; message?: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/status`, {
        headers: this.createHeaders(),
        timeout: 10000
      })
      return { valid: response.status === 200, message: 'Connection successful' }
    } catch (error: any) {
      console.error('Zeaber API连接验证失败:', error)
      return { 
        valid: false, 
        message: error.response?.data?.message || error.message || 'Connection failed' 
      }
    }
  }

  /**
   * 上传知识库到云端
   */
  async uploadToCloud(base: KnowledgeBase): Promise<any> {
    try {
      // 1. 准备上传的数据
      const baseData = {
        id: base.id,
        name: base.name,
        description: base.description || '',
        model: base.model.id,
        dimensions: base.dimensions,
        items: []
      }

      // 2. 处理文件内容
      for (const item of base.items) {
        if (item.type === 'file' && typeof item.content === 'object') {
          // 获取文件内容
          const file = await FileManager.getFile(item.content.id)
          baseData.items.push({
            id: item.id,
            type: item.type,
            filename: item.content.name,
            content: file || item.content,
            created_at: item.created_at,
            updated_at: item.updated_at
          })
        } else if (item.type === 'url') {
          baseData.items.push({
            id: item.id,
            type: item.type,
            content: item.content,
            created_at: item.created_at,
            updated_at: item.updated_at
          })
        } else if (item.type === 'note') {
          baseData.items.push({
            id: item.id,
            type: item.type,
            content: item.content,
            created_at: item.created_at,
            updated_at: item.updated_at
          })
        }
      }

      // 3. 发送到云端
      const response = await axios.post(`${this.baseUrl}/api/v1/knowledge-base/upload`, baseData, {
        headers: this.createHeaders(),
        timeout: 60000 // 60秒超时，因为上传可能较慢
      })
      
      return response.data
    } catch (error: any) {
      console.error('上传知识库到云端失败:', error)
      throw new Error(error.response?.data?.message || error.message || '上传失败')
    }
  }

  /**
   * 获取云端知识库列表
   */
  async getCloudBases(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/knowledge-base/list`, {
        headers: this.createHeaders(),
        timeout: 15000
      })
      return response.data.data || []
    } catch (error: any) {
      console.error('获取云端知识库列表失败:', error)
      return []
    }
  }

  /**
   * 搜索云端知识库
   */
  async searchCloudBase(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/knowledge-base/search`, {
        params: { query },
        headers: this.createHeaders(),
        timeout: 15000
      })
      return response.data
    } catch (error: any) {
      console.error('搜索云端知识库失败:', error)
      throw new Error(error.response?.data?.message || error.message || '搜索失败')
    }
  }

  /**
   * 从云端同步知识库
   */
  async syncFromCloud(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/knowledge-base/sync`, {
        headers: this.createHeaders(),
        timeout: 30000
      })
      return response.data
    } catch (error: any) {
      console.error('从云端同步知识库失败:', error)
      throw new Error(error.response?.data?.message || error.message || '同步失败')
    }
  }

  /**
   * 删除云端知识库
   */
  async deleteCloudBase(baseId: string): Promise<any> {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/v1/knowledge-base/${baseId}`, {
        headers: this.createHeaders(),
        timeout: 15000
      })
      return response.data
    } catch (error: any) {
      console.error('删除云端知识库失败:', error)
      throw new Error(error.response?.data?.message || error.message || '删除失败')
    }
  }

  /**
   * 获取数据可视化内容
   * 
   * 使用轻量级可视化协议获取知识库的图形可视化展示
   * @param baseId 知识库ID
   * @param format 可视化格式, 默认为'svg'
   * @returns 可视化数据
   */
  async getDataVisualization(baseId: string, format: 'svg' | 'json' = 'svg'): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/knowledge-base/${baseId}/visualization`, {
        params: { format },
        headers: this.createHeaders(),
        timeout: 30000,
        responseType: format === 'svg' ? 'text' : 'json'
      })
      return response.data
    } catch (error: any) {
      console.error('获取知识库可视化数据失败:', error)
      throw new Error(error.response?.data?.message || error.message || '获取可视化数据失败')
    }
  }
}

export default new CloudKnowledgeService() 