import store, { RootState, useAppDispatch, useAppSelector } from '@renderer/store'
import {
  SendMessageShortcut,
  setSendMessageShortcut as _setSendMessageShortcut,
  setShowAssistantIcon,
  setSidebarIcons,
  setTargetLanguage,
  setTheme,
  SettingsState,
  setTopicPosition,
  setTray,
  setWindowStyle
} from '@renderer/store/settings'
import { SidebarIcon, ThemeMode, TranslateLanguageVarious } from '@renderer/types'
import * as React from 'react'
import { useSelector } from 'react-redux'

export function useSettings() {
  const settings = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  // 添加cloudKnowledge到侧边栏
  const updateSidebarIcons = () => {
    // 检查并添加cloudKnowledge
    if (!settings.sidebarIcons.visible.includes('cloudKnowledge')) {
      const newVisible = [...settings.sidebarIcons.visible, 'cloudKnowledge']
      dispatch(setSidebarIcons({
        visible: newVisible,
        disabled: settings.sidebarIcons.disabled
      }))
    }
  }
  
  // 在组件初始化时执行一次
  React.useEffect(() => {
    updateSidebarIcons()
  }, [])

  return {
    ...settings,
    setSendMessageShortcut(shortcut: SendMessageShortcut) {
      dispatch(_setSendMessageShortcut(shortcut))
    },
    setTray(isActive: boolean) {
      dispatch(setTray(isActive))
      window.api.setTray(isActive)
    },
    setTheme(theme: ThemeMode) {
      dispatch(setTheme(theme))
    },
    setWindowStyle(windowStyle: 'transparent' | 'opaque') {
      dispatch(setWindowStyle(windowStyle))
    },
    setTargetLanguage(targetLanguage: TranslateLanguageVarious) {
      dispatch(setTargetLanguage(targetLanguage))
    },
    setTopicPosition(topicPosition: 'left' | 'right') {
      dispatch(setTopicPosition(topicPosition))
    },
    updateSidebarIcons(icons: { visible: SidebarIcon[]; disabled: SidebarIcon[] }) {
      dispatch(setSidebarIcons(icons))
    },
    updateSidebarVisibleIcons(icons: SidebarIcon[]) {
      dispatch(setSidebarIcons({ visible: icons }))
    },
    updateSidebarDisabledIcons(icons: SidebarIcon[]) {
      dispatch(setSidebarIcons({ disabled: icons }))
    },
    setShowAssistantIcon(showAssistantIcon: boolean) {
      dispatch(setShowAssistantIcon(showAssistantIcon))
    }
  }
}

export function useMessageStyle() {
  const { messageStyle } = useSettings()
  const isBubbleStyle = messageStyle === 'bubble'

  return {
    isBubbleStyle
  }
}

export const getStoreSetting = (key: keyof SettingsState) => {
  return store.getState().settings[key]
}
