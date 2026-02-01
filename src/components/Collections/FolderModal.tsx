import React from 'react';
import { Modal, Input, Form, message } from 'antd';
import { Collection } from '../../types';

interface FolderModalProps {
  open: boolean;
  folder?: Collection | null;
  onCancel: () => void;
  onOk: (data: { name: string; description?: string }) => void;
}

const FolderModal: React.FC<FolderModalProps> = ({
  open,
  folder,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open && folder) {
      form.setFieldsValue({
        name: folder.name,
        description: folder.description,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, folder, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      message.warning('请输入文件夹名称');
    }
  };

  return (
    <Modal
      title={folder ? '编辑文件夹' : '新建文件夹'}
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
          rules={[{ required: true, message: '请输入文件夹名称' }]}
        >
          <Input placeholder="文件夹名称" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="描述（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FolderModal;
