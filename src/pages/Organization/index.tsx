import React, { useState, useEffect } from 'react';
import { 
  Tabs, Card, Form, Input, Button, Row, Col, Statistic, 
  Table, Modal, Space, Popconfirm, Typography, Divider, message
} from 'antd';
import { 
  BankOutlined, UserOutlined, TeamOutlined, TrophyOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined, DollarOutlined
} from '@ant-design/icons';
import {
  useGetOrgStatsQuery,
  useGetOrgBasicDetailsQuery,
  useUpdateOrgBasicDetailsMutation,
  useGetOrgFeeStructuresQuery,
  useCreateOrgFeeStructureMutation,
  useDeleteOrgFeeStructureMutation,
  useGetOrgRolesQuery,
  useCreateOrgRoleMutation,
  useDeleteOrgRoleMutation
} from '../../store/apiSlice.ts';

import AppLayout from '../../components/layout/AppLayout.tsx';

const { Title, Text } = Typography;

const OrganizationIndex: React.FC = () => {
  const [orgId, setOrgId] = useState<string>('');

  useEffect(() => {
    try {
      const webUserStr = localStorage.getItem('webUser');
      if (webUserStr) {
        const webUser = JSON.parse(webUserStr);
        if (webUser && webUser.orgId) {
          setOrgId(webUser.orgId);
        }
      }
    } catch (e) {
      console.error('Failed to parse webUser from localStorage');
    }
  }, []);

  if (!orgId) {
    return (
      <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Organization' }]}>
        <div style={{ padding: 24 }}>Loading Organization Data...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Organization' }]}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Organization Management</Title>
        <Text type="secondary">Manage your school's details, fee structures, and administrative roles.</Text>
      </div>

      <Tabs 
        defaultActiveKey="1" 
        items={[
          {
            key: '1',
            label: <span><BankOutlined />Overview</span>,
            children: <OverviewTab orgId={orgId} />,
          },
          {
            key: '2',
            label: <span><EditOutlined />Basic Details</span>,
            children: <BasicDetailsTab orgId={orgId} />,
          },
          {
            key: '3',
            label: <span><DollarOutlined />Fee Structures</span>,
            children: <FeeStructuresTab orgId={orgId} />,
          },
          {
            key: '4',
            label: <span><TeamOutlined />Roles</span>,
            children: <RolesTab orgId={orgId} />,
          },
        ]}
      />
    </AppLayout>
  );
};

// --- TABS COMPONENTS ---

const OverviewTab = ({ orgId }: { orgId: string }) => {
  const { data: stats, isLoading } = useGetOrgStatsQuery(orgId);

  return (
    <div style={{ padding: '24px 0' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} loading={isLoading} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic 
              title="Total Teachers" 
              value={stats?.totalTeachers || 0} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#0d9488' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} loading={isLoading} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic 
              title="Total Students" 
              value={stats?.totalStudents || 0} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#0d9488' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} loading={isLoading} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic 
              title="Total Classrooms" 
              value={stats?.totalClassrooms || 0} 
              prefix={<BankOutlined />} 
              valueStyle={{ color: '#0d9488' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} loading={isLoading} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic 
              title="Total Achievements" 
              value={stats?.totalAchievements || 0} 
              prefix={<TrophyOutlined />} 
              valueStyle={{ color: '#0d9488' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const BasicDetailsTab = ({ orgId }: { orgId: string }) => {
  const { data: basicDetails, isLoading } = useGetOrgBasicDetailsQuery(orgId);
  const [updateDetails, { isLoading: isUpdating }] = useUpdateOrgBasicDetailsMutation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (basicDetails) {
      form.setFieldsValue(basicDetails);
    }
  }, [basicDetails, form]);

  const onFinish = async (values: any) => {
    try {
      await updateDetails({ orgId, ...values }).unwrap();
      message.success('Basic details updated successfully');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update details');
    }
  };

  return (
    <Card loading={isLoading} bordered={false} style={{ borderRadius: 8, maxWidth: 800, marginTop: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="schoolName" label="School Name" rules={[{ required: true }]}>
              <Input placeholder="Enter school name" size="large" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="campusAddress" label="Campus Address">
              <Input.TextArea rows={3} placeholder="Enter full campus address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="schoolEmail" label="School Email" rules={[{ type: 'email' }]}>
              <Input placeholder="contact@school.edu" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="primaryContact" label="Primary Contact Number">
              <Input placeholder="+1234567890" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ margin: 0, textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" loading={isUpdating} size="large">
            Save Details
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const FeeStructuresTab = ({ orgId }: { orgId: string }) => {
  const { data: feeStructures, isLoading } = useGetOrgFeeStructuresQuery(orgId);
  const [createFee, { isLoading: isCreating }] = useCreateOrgFeeStructureMutation();
  const [deleteFee] = useDeleteOrgFeeStructureMutation();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        orgId,
        ...values,
        feeAmount: Number(values.feeAmount),
        hasBreakdown: values.breakdown && values.breakdown.length > 0,
      };
      await createFee(payload).unwrap();
      message.success('Fee structure created successfully');
      setIsModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create fee structure');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFee(id).unwrap();
      message.success('Fee structure deleted');
    } catch (err: any) {
      message.error('Failed to delete fee structure');
    }
  };

  const columns = [
    { title: 'Structure Name', dataIndex: 'structureName', key: 'structureName' },
    { title: 'Grade From', dataIndex: 'gradeFrom', key: 'gradeFrom' },
    { title: 'Grade To', dataIndex: 'gradeTo', key: 'gradeTo' },
    { 
      title: 'Total Amount', 
      dataIndex: 'feeAmount', 
      key: 'feeAmount',
      render: (val: number) => `₹${val.toLocaleString()}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete this fee structure?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          New Fee Structure
        </Button>
      </div>
      
      <Table 
        dataSource={feeStructures} 
        columns={columns} 
        rowKey="_id" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        expandable={{
          expandedRowRender: record => (
            <div style={{ padding: '8px 16px', background: '#fcfcfc' }}>
              <Text strong>Breakdown:</Text>
              {record.hasBreakdown && record.breakdown?.length > 0 ? (
                <ul style={{ marginTop: 8 }}>
                  {record.breakdown.map((b: any) => (
                    <li key={b._id || b.label}>
                      {b.label}: ₹{b.amount.toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <Text type="secondary" style={{ marginLeft: 8 }}>No breakdown defined.</Text>
              )}
            </div>
          ),
          rowExpandable: record => record.hasBreakdown,
        }}
      />

      <Modal
        title="Create Fee Structure"
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="structureName" label="Structure Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Standard Term 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gradeFrom" label="Grade From" rules={[{ required: true }]}>
                <Input placeholder="e.g. Class 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gradeTo" label="Grade To" rules={[{ required: true }]}>
                <Input placeholder="e.g. Class 5" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="feeAmount" label="Total Fee Amount" rules={[{ required: true }]}>
                <Input type="number" prefix="₹" placeholder="15000" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Fee Breakdown (Optional)</Divider>
          <Form.List name="breakdown">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'label']}
                      rules={[{ required: true, message: 'Missing label' }]}
                    >
                      <Input placeholder="e.g. Tuition" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      rules={[{ required: true, message: 'Missing amount' }]}
                    >
                      <Input type="number" placeholder="Amount" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Breakdown Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

import { MinusCircleOutlined } from '@ant-design/icons';

const RolesTab = ({ orgId }: { orgId: string }) => {
  const { data: roles, isLoading } = useGetOrgRolesQuery(orgId);
  const [createRole, { isLoading: isCreating }] = useCreateOrgRoleMutation();
  const [deleteRole] = useDeleteOrgRoleMutation();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createRole({ orgId, ...values }).unwrap();
      message.success('Role created successfully');
      setIsModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create role');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id).unwrap();
      message.success('Role deleted');
    } catch (err: any) {
      message.error('Failed to delete role');
    }
  };

  const columns = [
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete this role?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Assign New Role
        </Button>
      </div>
      
      <Table 
        dataSource={roles} 
        columns={columns} 
        rowKey="_id" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      />

      <Modal
        title="Assign New Role"
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="position" label="Position Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Head of Science" />
          </Form.Item>
          <Form.Item name="assignedTo" label="Assigned To (Name)" rules={[{ required: true }]}>
            <Input placeholder="e.g. John Doe" />
          </Form.Item>
          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Role
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationIndex;
