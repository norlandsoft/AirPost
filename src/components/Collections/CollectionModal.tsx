import React from 'react';
import { Modal, Input, Form, message } from 'antd';
import { Collection } from '../../types';

interface CollectionModalProps {
  open: boolean;
  collection?: Collection | null;
  onCancel: () => void;
  onOk: (data: { name: string; description?: string }) => void;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
  open,
  collection,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open && collection) {
      form.setFieldsValue({
        name: collection.name,
        description: collection.description,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, collection, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      message.warning('请输入 Collection 名称');
    }
  };

  return (
    <Modal
      title={collection ? '编辑 Collection' : '新建 Collection'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入 Collection 名称' }]}
        >
          <Input placeholder="Collection 名称" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="描述（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CollectionModal;
