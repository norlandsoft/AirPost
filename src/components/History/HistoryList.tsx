import React from 'react';
import { List, Button, Space, Tag, Tooltip, Empty, Modal, message, Input, DatePicker } from 'antd';
import {
  SendOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { HistoryItem, ApiRequest, ApiResponse } from '../../types';
import { getHistory, clearHistory, deleteHistoryItem } from '../../services/storage';
import './HistoryList.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface HistoryListProps {
  onSelectRequest: (request: ApiRequest) => void;
  onRequestChange?: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
  onSelectRequest,
  onRequestChange,
}) => {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = React.useState<HistoryItem[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadHistory();
  }, []);

  React.useEffect(() => {
    filterHistory();
  }, [history, searchText, dateFilter]);

  const loadHistory = () => {
    const items = getHistory();
    setHistory(items);
  };

  const filterHistory = () => {
    let filtered = [...history];

    // 搜索过滤
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.request.name.toLowerCase().includes(search) ||
        item.request.url.toLowerCase().includes(search) ||
        item.request.method.toLowerCase().includes(search)
      );
    }

    // 日期过滤
    if (dateFilter) {
      const today = dayjs();
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.createdAt);
        switch (dateFilter) {
          case 'today':
            return itemDate.isSame(today, 'day');
          case 'week':
            return itemDate.isAfter(today.subtract(7, 'day'));
          case 'month':
            return itemDate.isAfter(today.subtract(30, 'day'));
          default:
            return true;
        }
      });
    }

    setFilteredHistory(filtered);
  };

  // 按日期分组
  const groupedHistory = React.useMemo(() => {
    const groups: { [key: string]: HistoryItem[] } = {};
    
    filteredHistory.forEach(item => {
      const date = dayjs(item.createdAt);
      let key: string;
      
      if (date.isSame(dayjs(), 'day')) {
        key = '今天';
      } else if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
        key = '昨天';
      } else if (date.isSame(dayjs(), 'week')) {
        key = '本周';
      } else if (date.isSame(dayjs(), 'month')) {
        key = '本月';
      } else {
        key = date.format('YYYY年M月');
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  }, [filteredHistory]);

  // 重新发送请求
  const handleResend = (item: HistoryItem) => {
    onSelectRequest(item.request);
    message.success('已加载请求');
    onRequestChange?.();
  };

  // 复制请求
  const handleCopy = (item: HistoryItem) => {
    const text = `${item.request.method} ${item.request.url}`;
    navigator.clipboard.writeText(text);
    message.success('已复制请求信息');
  };

  // 删除单条记录
  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    loadHistory();
    message.success('删除成功');
    onRequestChange?.();
  };

  // 清空历史
  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有历史操作不可恢复。记录吗？此',
      okText: '清空',
      okType: 'danger',
      onOk: () => {
        clearHistory();
        setHistory([]);
        message.success('历史记录已清空');
        onRequestChange?.();
      },
    });
  };

  // 清空较早的记录
  const handleClearOlder = (days: number) => {
    Modal.confirm({
      title: '确认清空',
      content: `确定要清空 ${days} 天前的历史记录吗？`,
      okText: '清空',
      okType: 'danger',
      onOk: () => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        const filtered = history.filter(item => item.createdAt > cutoff);
        setHistory(filtered);
        message.success('已清空较早的记录');
        onRequestChange?.();
      },
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'processing';
    if (status >= 400 && status < 500) return 'warning';
    return 'error';
  };

  if (history.length === 0) {
    return (
      <div className="history-list empty">
        <Empty description="暂无历史记录" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button icon={<SendOutlined />} onClick={() => message.info('发送请求后将自动记录历史')}>
            发送请求
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="history-list">
      {/* 搜索和过滤 */}
      <div className="history-search">
        <Input
          placeholder="搜索历史记录"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      {/* 操作按钮 */}
      <div className="history-actions">
        <Space wrap>
          <Button 
            size="small" 
            icon={<ClearOutlined />}
            onClick={() => handleClearOlder(7)}
          >
            7天前
          </Button>
          <Button 
            size="small" 
            icon={<ClearOutlined />}
            onClick={() => handleClearOlder(30)}
          >
            30天前
          </Button>
          <Button 
            size="small" 
            danger 
            icon={<ClearOutlined />}
            onClick={handleClearAll}
          >
            全部清除
          </Button>
        </Space>
      </div>

      {/* 历史列表 */}
      <div className="history-content">
        {Object.keys(groupedHistory).length > 0 ? (
          Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="history-group">
              <div className="history-group-title">{date}</div>
              <List
                dataSource={items}
                renderItem={(item) => (
                  <List.Item
                    className="history-item"
                    actions={[
                      <Tooltip title="重新发送" key="resend">
                        <Button
                          type="text"
                          size="small"
                          icon={<SendOutlined />}
                          onClick={() => handleResend(item)}
                        />
                      </Tooltip>,
                      <Tooltip title="复制" key="copy">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopy(item)}
                        />
                      </Tooltip>,
                      <Tooltip title="删除" key="delete">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(item.id)}
                        />
                      </Tooltip>,
                    ]}
                    onClick={() => handleResend(item)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={
                            item.request.method === 'GET' ? 'green' :
                            item.request.method === 'POST' ? 'blue' :
                            item.request.method === 'DELETE' ? 'red' :
                            item.request.method === 'PUT' ? 'orange' : 'purple'
                          }>
                            {item.request.method}
                          </Tag>
                          <span style={{ 
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.request.name || item.request.url}
                          </span>
                        </Space>
                      }
                      description={
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <span style={{ 
                            color: '#999',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px',
                          }}>
                            {item.request.url}
                          </span>
                          {item.response && (
                            <Tag color={getStatusColor(item.response.status)}>
                              {item.response.status}
                            </Tag>
                          )}
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            {dayjs(item.createdAt).fromNow()}
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          ))
        ) : (
          <Empty description="未找到匹配的历史记录" style={{ padding: '40px 0' }} />
        )}
      </div>
    </div>
  );
};

export default HistoryList;
