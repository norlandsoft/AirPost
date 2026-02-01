import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

export function useShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// 预设快捷键配置
export const defaultShortcuts = (sendAction: () => void, saveAction: () => void) => [
  {
    key: 'enter',
    ctrl: true,
    action: sendAction,
    description: '发送请求 (Ctrl + Enter)',
  },
  {
    key: 's',
    ctrl: true,
    action: saveAction,
    description: '保存请求 (Ctrl + S)',
  },
  {
    key: 's',
    ctrl: true,
    shift: true,
    action: saveAction,
    description: '另存为新请求 (Ctrl + Shift + S)',
  },
  {
    key: 'Escape',
    action: () => {
      // 取消操作
    },
    description: '取消/关闭 (Escape)',
  },
];
