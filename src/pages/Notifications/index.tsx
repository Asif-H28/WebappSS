import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Typography, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout.tsx';
import { useCreateAdminNoticeMutation } from '../../store/apiSlice.ts';

const { Title, Text } = Typography;
const { Option } = Select;

const NotificationsIndex: React.FC = () => {
  const [orgId, setOrgId] = useState<string>('');
  const [webUser, setWebUser] = useState<any>(null);
  const [createNotice, { isLoading }] = useCreateAdminNoticeMutation();
  const [form] = Form.useForm();

  useEffect(() => {
    try {
      const webUserStr = localStorage.getItem('webUser');
      if (webUserStr) {
        const user = JSON.parse(webUserStr);
        setWebUser(user);
        if (user && user.orgId) {
          setOrgId(user.orgId);
        }
      }
    } catch (e) {
      console.error('Failed to parse webUser');
    }
  }, []);

  const onFinish = async (values: any) => {
    if (!orgId || !webUser) {
      message.error('Organization or user context not found');
      return;
    }

    try {
      const payload = {
        orgId,
        title: values.title,
        description: values.description,
        audience: values.audience,
        targetScope: values.targetScope,
        createdBy: webUser.id || webUser._id || 'unknown',
        creatorRole: webUser.role || 'support_staff',
        creatorName: webUser.name || 'Admin',
      };

      await createNotice(payload).unwrap();
      message.success('Notice successfully created and dispatched!');
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create notice');
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Notifications' }]}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 12, color: '#0d9488' }} />
          Dispatch Notifications
        </Title>
        <Text type="secondary">Send important announcements to teachers, students, and staff.</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, maxWidth: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            audience: 'teachers_and_students',
            targetScope: 'all_classes'
          }}
        >
          <Form.Item 
            name="title" 
            label="Notice Title" 
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g. Exam Schedule Update" size="large" />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="Notice Description" 
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={4} placeholder="Detailed information about the announcement..." />
          </Form.Item>

          <Form.Item 
            name="audience" 
            label="Target Audience" 
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="teachers_and_students">Teachers & Students</Option>
              <Option value="teachers_only">Teachers Only</Option>
              <Option value="students_only">Students Only</Option>
              <Option value="staff_only">Support Staff Only</Option>
              <Option value="everyone">Everyone</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="targetScope" 
            label="Target Scope" 
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="all_classes">All Classes (Institution Wide)</Option>
              <Option value="specific_classes">Specific Classes (Requires Setup)</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="large" loading={isLoading}>
              Dispatch Notice
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default NotificationsIndex;
