import React from 'react';
import { Table, Button, Space, Tag, Tooltip, Empty, Modal, message, Dropdown } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  CopyOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import VariableEditor from './VariableEditor';
import EnvironmentModal from './EnvironmentModal';
import { Environment, KeyValuePair } from '../../types';
import {
  getEnvironments,
  addEnvironment as addEnvironmentToStorage,
  updateEnvironment as updateEnvironmentToStorage,
  deleteEnvironment as deleteEnvironmentFromStorage,
} from '../../services/storage';
import './EnvironmentPanel.css';

interface EnvironmentPanelProps {
  onVariableChange?: () => void;
}

const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({
  onVariableChange,
}) => {
  const [environments, setEnvironments] = React.useState<Environment[]>([]);
  const [activeEnvironmentId, setActiveEnvironmentId] = React.useState<string | undefined>();
  const [selectedEnvironment, setSelectedEnvironment] = React.useState<Environment | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editorOpen, setEditorOpen] = React.useState(false);

  React.useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = () => {
    const envs = getEnvironments();
    setEnvironments(envs);
    
    const active = envs.find(e => e.isActive);
    setActiveEnvironmentId(active?.id);
  };

  // 切换环境
  const handleSwitchEnvironment = (environmentId: string) => {
    // 取消之前的激活状态
    environments.forEach(e => {
      if (e.isActive) {
        updateEnvironmentToStorage(e.id, { isActive: false });
      }
    });

    // 激活新环境
    updateEnvironmentToStorage(environmentId, { isActive: true });
    setActiveEnvironmentId(environmentId);
    loadEnvironments();
    message.success('环境切换成功');
    onVariableChange?.();
  };

  // 添加环境
  const handleAddEnvironment = () => {
    setSelectedEnvironment(null);
    setModalOpen(true);
  };

  // 编辑环境
  const handleEditEnvironment = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setModalOpen(true);
  };

  // 删除环境
  const handleDeleteEnvironment = (environmentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此环境吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteEnvironmentFromStorage(environmentId);
        loadEnvironments();
        message.success('环境删除成功');
        onVariableChange?.();
      },
    });
  };

  // 保存环境
  const handleSaveEnvironment = (data: { name: string; values: KeyValuePair[] }) => {
    if (selectedEnvironment) {
      updateEnvironmentToStorage(selectedEnvironment.id, data);
      message.success('环境更新成功');
    } else {
      const newEnvironment: Environment = {
        id: `env_${Date.now()}`,
        name: data.name,
        values: data.values,
        isActive: environments.length === 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addEnvironmentToStorage(newEnvironment);
      message.success('环境创建成功');
    }
    loadEnvironments();
    setModalOpen(false);
    onVariableChange?.();
  };

  // 复制变量值
  const handleCopyValue = (key: string, value: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    message.success(`已复制 {{${key}}}`);
  };

  // 导出环境
  const handleExport = (environment: Environment) => {
    const json = JSON.stringify(environment, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environment_${environment.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('环境导出成功');
  };

  // 导入环境
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            const importedEnv = JSON.parse(json) as Environment;
            
            importedEnv.id = `env_${Date.now()}`;
            importedEnv.name = `${importedEnv.name} (导入)`;
            importedEnv.isActive = false;
            importedEnv.createdAt = Date.now();
            importedEnv.updatedAt = Date.now();

            addEnvironmentToStorage(importedEnv);
            loadEnvironments();
            message.success('环境导入成功');
            onVariableChange?.();
          } catch (error) {
            message.error('导入失败，文件格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 获取当前环境变量预览
  const getActiveVariables = (): KeyValuePair[] => {
    const env = environments.find(e => e.id === activeEnvironmentId);
    return env?.values || [];
  };

  // 变量表格列
  const columns: ColumnsType<KeyValuePair> = [
    {
      title: '变量名',
      dataIndex: 'key',
      key: 'key',
      width: '40%',
      render: (text, record) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{`{{${text}}}`}</span>
          {!record.enabled && <Tag color="default">禁用</Tag>}
        </Space>
      ),
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: '50%',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ color: '#666' }}>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Tooltip title="复制变量引用">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyValue(record.key, record.value)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 环境列表
  const envItems = environments.map(env => ({
    key: env.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          {env.isActive ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <EnvironmentOutlined />
          )}
          <span>{env.name}</span>
        </Space>
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditEnvironment(env);
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEnvironment(env.id);
            }}
          />
        </Space>
      </div>
    ),
  }));

  if (environments.length === 0) {
    return (
      <div className="environment-panel empty">
        <Empty description="暂无环境" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Space direction="vertical">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEnvironment}>
              创建环境
            </Button>
            <Button icon={<ImportOutlined />} onClick={handleImport}>
              导入环境
            </Button>
          </Space>
        </Empty>
      </div>
    );
  }

  return (
    <div className="environment-panel">
      {/* 环境切换 */}
      <div className="environment-header">
        <Dropdown
          menu={{
            items: envItems,
            onClick: ({ key }) => handleSwitchEnvironment(key),
          }}
          trigger={['click']}
        >
          <Button type="default" icon={<EnvironmentOutlined />} block>
            {environments.find(e => e.id === activeEnvironmentId)?.name || '选择环境'}
          </Button>
        </Dropdown>
        <Space>
          <Tooltip title="添加环境">
            <Button type="text" icon={<PlusOutlined />} onClick={handleAddEnvironment} />
          </Tooltip>
          <Tooltip title="编辑环境">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                const env = environments.find(e => e.id === activeEnvironmentId);
                if (env) handleEditEnvironment(env);
              }}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 当前环境变量列表 */}
      <div className="environment-content">
        <div className="environment-title">
          <span>环境变量</span>
          <Button
            type="link"
            size="small"
            onClick={() => {
              const env = environments.find(e => e.id === activeEnvironmentId);
              if (env) {
                setSelectedEnvironment(env);
                setEditorOpen(true);
              }
            }}
          >
            编辑变量
          </Button>
        </div>
        
        {getActiveVariables().length > 0 ? (
          <Table
            columns={columns}
            dataSource={getActiveVariables()}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
        ) : (
          <Empty description="此环境暂无变量" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      {/* 新建/编辑环境 Modal */}
      <EnvironmentModal
        open={modalOpen}
        environment={selectedEnvironment}
        onCancel={() => setModalOpen(false)}
        onOk={handleSaveEnvironment}
      />

      {/* 变量编辑器 */}
      {editorOpen && selectedEnvironment && (
        <VariableEditor
          environment={selectedEnvironment}
          onSave={(values) => {
            handleSaveEnvironment({ name: selectedEnvironment.name, values });
            setEditorOpen(false);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default EnvironmentPanel;
