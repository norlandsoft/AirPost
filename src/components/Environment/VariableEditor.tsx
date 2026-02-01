import React from 'react';
import { Modal, Input, Table, Space, Button, Switch, message, Tooltip } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Environment, KeyValuePair } from '../../types';
import './VariableEditor.css';

interface VariableEditorProps {
  environment: Environment;
  onSave: (values: KeyValuePair[]) => void;
  onClose: () => void;
}

const VariableEditor: React.FC<VariableEditorProps> = ({
  environment,
  onSave,
  onClose,
}) => {
  const [variables, setVariables] = React.useState<KeyValuePair[]>(
    environment.values || []
  );

  // 添加变量
  const handleAdd = () => {
    const newVar: KeyValuePair = {
      id: `var_${Date.now()}`,
      key: '',
      value: '',
      enabled: true,
    };
    setVariables([...variables, newVar]);
  };

  // 更新变量
  const handleUpdate = (id: string, field: keyof KeyValuePair, val: any) => {
    setVariables(variables.map(v => 
      v.id === id ? { ...v, [field]: val } : v
    ));
  };

  // 删除变量
  const handleDelete = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
  };

  // 复制变量名
  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    message.success(`已复制 {{${key}}}`);
  };

  // 保存
  const handleSave = () => {
    onSave(variables);
  };

  const columns: ColumnsType<KeyValuePair> = [
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 60,
      render: (enabled, record) => (
        <Switch
          size="small"
          checked={enabled}
          onChange={(checked) => handleUpdate(record.id, 'enabled', checked)}
        />
      ),
    },
    {
      title: '变量名',
      dataIndex: 'key',
      key: 'key',
      width: '35%',
      render: (key, record) => (
        <Input
          placeholder="variable_name"
          value={key}
          onChange={(e) => handleUpdate(record.id, 'key', e.target.value)}
          prefix="{{"
          suffix="}}"
        />
      ),
    },
    {
      title: '初始值',
      dataIndex: 'value',
      key: 'value',
      width: '30%',
      render: (value, record) => (
        <Input
          placeholder="变量值"
          value={value}
          onChange={(e) => handleUpdate(record.id, 'value', e.target.value)}
        />
      ),
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: '20%',
      render: (_, record) => (
        <Input
          placeholder="当前值（可覆盖初始值）"
          value={record.value}
          disabled
          style={{ color: '#666' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="复制变量引用">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record.key)}
              disabled={!record.key}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`编辑环境变量 - ${environment.name}`}
      open={true}
      onCancel={onClose}
      onOk={handleSave}
      width={900}
      okText="保存"
      cancelText="取消"
    >
      <div className="variable-editor">
        <div className="variable-editor-header">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加变量
            </Button>
            <span style={{ color: '#999', fontSize: '12px' }}>
              使用 {'{{variableName}}'} 语法在请求中使用变量
            </span>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={variables}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </div>
    </Modal>
  );
};

export default VariableEditor;
