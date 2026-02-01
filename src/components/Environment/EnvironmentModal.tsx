import React from 'react';
import { Modal, Input, Form, message } from 'antd';
import { Environment, KeyValuePair } from '../../types';

interface EnvironmentModalProps {
  open: boolean;
  environment?: Environment | null;
  onCancel: () => void;
  onOk: (data: { name: string; values: KeyValuePair[] }) => void;
}

const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  open,
  environment,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open && environment) {
      form.setFieldsValue({
        name: environment.name,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, environment, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk({
        name: values.name,
        values: environment?.values || [],
      });
    } catch (error) {
      message.warning('请输入环境名称');
    }
  };

  return (
    <Modal
      title={environment ? '编辑环境' : '新建环境'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="环境名称"
          rules={[{ required: true, message: '请输入环境名称' }]}
        >
          <Input placeholder="例如：开发环境、测试环境、生产环境" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EnvironmentModal;
