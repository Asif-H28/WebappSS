import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Typography, message, Upload, Tabs, Table, Tag, Space } from 'antd';
import { BellOutlined, UploadOutlined, HistoryOutlined, SendOutlined, LinkOutlined } from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout.tsx';
import { useCreateAdminNoticeMutation, useGetClassroomListQuery, useGetAdminNoticesByOrgQuery } from '../../store/apiSlice.ts';

const { Title, Text } = Typography;
const { Option } = Select;

const NoticesIndex: React.FC = () => {
  const [orgId, setOrgId] = useState<string>('');
  const [webUser, setWebUser] = useState<any>(null);

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

  if (!orgId) {
    return (
      <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Notices' }]}>
        <div style={{ padding: 24 }}>Loading Organization Data...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Notices' }]}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 12, color: '#0d9488' }} />
          Notices Management
        </Title>
        <Text type="secondary">View previously sent notices and dispatch new ones.</Text>
      </div>

      <Tabs 
        defaultActiveKey="history" 
        items={[
          {
            key: 'history',
            label: <span><HistoryOutlined />Notice History</span>,
            children: <NoticesHistory orgId={orgId} />,
          },
          {
            key: 'dispatch',
            label: <span><SendOutlined />Dispatch Notice</span>,
            children: <DispatchNotice orgId={orgId} webUser={webUser} />,
          }
        ]}
      />
    </AppLayout>
  );
};

const NoticesHistory = ({ orgId }: { orgId: string }) => {
  const { data, isLoading } = useGetAdminNoticesByOrgQuery(orgId, { skip: !orgId });
  
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Audience', dataIndex: 'audience', key: 'audience', render: (a: string) => <Tag color="blue">{a ? a.replace(/_/g, ' ').toUpperCase() : '-'}</Tag> },
    { title: 'Target Scope', dataIndex: 'targetScope', key: 'targetScope', render: (s: string) => s ? <Tag>{s.replace(/_/g, ' ')}</Tag> : '-' },
    { title: 'Created By', dataIndex: 'creatorName', key: 'creatorName' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
    { 
      title: 'Attachments', 
      key: 'attachments', 
      render: (_: any, record: any) => (
        <Space>
          {record.attachments && record.attachments.length > 0 ? (
            record.attachments.map((att: any, idx: number) => (
              <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer">
                <LinkOutlined /> {att.type || 'File'}
              </a>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
        </Space>
      ) 
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Table 
        dataSource={data?.notices || []} 
        columns={columns} 
        rowKey="noticeId" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

const DispatchNotice = ({ orgId, webUser }: { orgId: string, webUser: any }) => {
  const [createNotice, { isLoading }] = useCreateAdminNoticeMutation();
  const [form] = Form.useForm();
  
  const audience = Form.useWatch('audience', form);
  const targetScope = Form.useWatch('targetScope', form);
  
  const { data: classData, isLoading: isClassLoading } = useGetClassroomListQuery(orgId, { skip: !orgId });
  const classrooms = classData?.classrooms || [];

  const onFinish = async (values: any) => {
    if (!orgId || !webUser) {
      message.error('Organization or user context not found');
      return;
    }

    try {
      // normFile returns the array directly, so values.files is the array
      const fileList = Array.isArray(values.files) ? values.files : (values.files?.fileList || []);
      
      let finalTargetScope = values.targetScope || 'all_classes';
      let finalTargetClassIds = values.targetClassIds;

      if (values.audience === 'teachers_only') {
        finalTargetScope = 'all_classes';
        finalTargetClassIds = undefined;
      }

      const payloadObj: any = {
        orgId,
        title: values.title,
        description: values.description,
        audience: values.audience,
        targetScope: finalTargetScope,
        createdBy: webUser.id || webUser._id || 'unknown',
        creatorRole: webUser.role || 'support_staff',
        creatorName: webUser.name || 'Admin',
      };

      let payload: any;

      if (fileList.length > 0) {
        payload = new FormData();
        Object.keys(payloadObj).forEach(key => {
          if (payloadObj[key] !== undefined && payloadObj[key] !== null) {
            payload.append(key, payloadObj[key]);
          }
        });
        
        if (finalTargetScope === 'selected_classes' && finalTargetClassIds) {
          payload.append('targetClassIds', JSON.stringify(finalTargetClassIds));
        }

        fileList.forEach((f: any) => {
          payload.append('files', f.originFileObj);
        });
      } else {
        payload = { ...payloadObj };
        if (finalTargetScope === 'selected_classes' && finalTargetClassIds) {
          payload.targetClassIds = finalTargetClassIds;
        }
      }

      await createNotice(payload).unwrap();
      message.success('Notice successfully created and dispatched!');
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create notice');
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
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
          </Select>
        </Form.Item>

        {audience === 'teachers_and_students' && (
          <Form.Item 
            name="targetScope" 
            label="Target Scope" 
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="all_classes">All Classes</Option>
              <Option value="selected_classes">Specific Classes</Option>
            </Select>
          </Form.Item>
        )}

        {audience === 'teachers_and_students' && targetScope === 'selected_classes' && (
          <Form.Item
            name="targetClassIds"
            label="Select Classes"
            rules={[{ required: true, message: 'Please select at least one class' }]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder="Select classes"
              loading={isClassLoading}
            >
              {classrooms.map((cls: any) => (
                <Option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="files"
          label="Attachments (Up to 5 files)"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload name="file" beforeUpload={() => false} maxCount={5} multiple>
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" size="large" loading={isLoading}>
            Dispatch Notice
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NoticesIndex;
