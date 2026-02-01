import React, { useState } from 'react';
import { Form, Input, Button, Space, Select, Row, Col, Empty, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { KeyValuePair, HttpMethod, BodyType } from '../../types';
import './KeyValueEditor.css';

interface KeyValueEditorProps {
  title: string;
  data: KeyValuePair[];
  onChange: (data: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyWidth?: number;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  title,
  data,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  keyWidth = 200,
}) => {
  const [localData, setLocalData] = useState<KeyValuePair[]>(
    data.length > 0 ? data : [{ id: generateId(), key: '', value: '', enabled: true }]
  );

  const handleAdd = () => {
    const newItem: KeyValuePair = {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    };
    const newData = [...localData, newItem];
    setLocalData(newData);
    onChange(newData);
  };

  const handleChange = (id: string, field: keyof KeyValuePair, value: any) => {
    const newData = localData.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setLocalData(newData);
    onChange(newData);
  };

  const handleDelete = (id: string) => {
    const newData = localData.filter((item) => item.id !== id);
    setLocalData(newData);
    onChange(newData);
  };

  const handleToggle = (id: string) => {
    const newData = localData.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setLocalData(newData);
    onChange(newData);
  };

  // 确保至少有一行
  React.useEffect(() => {
    if (localData.length === 0) {
      const newData = [{ id: generateId(), key: '', value: '', enabled: true }];
      setLocalData(newData);
      onChange(newData);
    }
  }, []);

  return (
    <div className="key-value-editor">
      <div className="key-value-editor-header">
        <span className="key-value-editor-title">{title}</span>
        <Button type="link" icon={<PlusOutlined />} onClick={handleAdd} size="small">
          添加
        </Button>
      </div>
      
      {localData.length === 0 ? (
        <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="key-value-editor-content">
          {localData.map((item, index) => (
            <Row key={item.id} gutter={8} className="key-value-row" align="middle">
              <Col flex="40px">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => handleToggle(item.id)}
                  className="key-value-checkbox"
                />
              </Col>
              <Col flex={`${keyWidth}px`}>
                <Input
                  placeholder={keyPlaceholder}
                  value={item.key}
                  onChange={(e) => handleChange(item.id, 'key', e.target.value)}
                  disabled={!item.enabled}
                  size="small"
                />
              </Col>
              <Col flex="1">
                <Input
                  placeholder={valuePlaceholder}
                  value={item.value}
                  onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                  disabled={!item.enabled}
                  size="small"
                />
              </Col>
              <Col flex="40px">
                <Tooltip title="删除">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.id)}
                    size="small"
                  />
                </Tooltip>
              </Col>
            </Row>
          ))}
        </div>
      )}
    </div>
  );
};

function generateId(): string {
  return `kv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default KeyValueEditor;
