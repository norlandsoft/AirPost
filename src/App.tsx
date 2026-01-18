import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Table, Modal, Form, Input, message, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  // 加载所有文章
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await window.electronAPI.db.getAllPosts();
      setPosts(data);
    } catch (error) {
      message.error('加载文章失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 打开创建/编辑模态框
  const openModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      form.setFieldsValue(post);
    } else {
      setEditingPost(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 保存文章
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingPost) {
        // 更新
        const success = await window.electronAPI.db.updatePost(
          editingPost.id,
          values.title,
          values.content
        );
        if (success) {
          message.success('更新成功');
          setModalVisible(false);
          loadPosts();
        } else {
          message.error('更新失败');
        }
      } else {
        // 创建
        await window.electronAPI.db.createPost(values.title, values.content);
        message.success('创建成功');
        setModalVisible(false);
        loadPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 删除文章
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？',
      onOk: async () => {
        const success = await window.electronAPI.db.deletePost(id);
        if (success) {
          message.success('删除成功');
          loadPosts();
        } else {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<Post> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Title level={3} style={{ color: '#fff', margin: '16px 0' }}>
          🚀 AirPost
        </Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Card
          title="文章管理"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新建文章
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={posts}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title={editingPost ? '编辑文章' : '新建文章'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          okText="保存"
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请输入文章标题" />
            </Form.Item>
            <Form.Item
              name="content"
              label="内容"
              rules={[{ required: true, message: '请输入内容' }]}
            >
              <TextArea
                rows={6}
                placeholder="请输入文章内容"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default App;
