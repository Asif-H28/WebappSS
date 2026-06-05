import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Typography, Tag, Alert, Button, Modal } from 'antd';
import { CarOutlined, EnvironmentOutlined, IdcardOutlined } from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout.tsx';
import {
  useGetOrgVehiclesQuery, 
  useGetActiveVehicleLocationsQuery,
  useGetVehicleLocationQuery
} from '../../store/apiSlice.ts';

const { Title, Text } = Typography;

const VehiclesIndex: React.FC = () => {
  const [orgId, setOrgId] = useState<string>('');

  useEffect(() => {
    try {
      const webUserStr = localStorage.getItem('webUser');
      if (webUserStr) {
        const user = JSON.parse(webUserStr);
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
      <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Vehicles' }]}>
        <div style={{ padding: 24 }}>Loading Organization Data...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Vehicles' }]}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <CarOutlined style={{ marginRight: 12, color: '#0d9488' }} />
          Fleet Management
        </Title>
        <Text type="secondary">View and track your organization's vehicles in real-time.</Text>
      </div>

      <Tabs 
        defaultActiveKey="directory" 
        items={[
          {
            key: 'directory',
            label: <span><IdcardOutlined />Vehicle Directory</span>,
            children: <VehicleDirectory orgId={orgId} />,
          },
          {
            key: 'tracking',
            label: <span><EnvironmentOutlined />Live Tracking</span>,
            children: <VehicleTracking orgId={orgId} />,
          }
        ]}
      />
    </AppLayout>
  );
};

const VehicleDirectory = ({ orgId }: { orgId: string }) => {
  const { data, isLoading } = useGetOrgVehiclesQuery(orgId);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const columns = [
    { title: 'Vehicle Name', dataIndex: 'vehicleName', key: 'vehicleName' },
    { title: 'Registration No.', dataIndex: 'vehicleNumber', key: 'vehicleNumber', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Driver', dataIndex: 'driverName', key: 'driverName' },
    { title: 'Driver Phone', dataIndex: 'driverPhoneNumber', key: 'driverPhoneNumber' },
    { title: 'Coordinator', dataIndex: 'coordinatorName', key: 'coordinatorName' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EnvironmentOutlined />} 
          onClick={() => setSelectedVehicleId(record.vehicleId)}
        >
          View Location
        </Button>
      )
    }
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Table 
        dataSource={data?.vehicles || []} 
        columns={columns} 
        rowKey="vehicleId" 
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      <VehicleLocationModal 
        vehicleId={selectedVehicleId} 
        onClose={() => setSelectedVehicleId(null)} 
      />
    </Card>
  );
};

const VehicleLocationModal = ({ vehicleId, onClose }: { vehicleId: string | null, onClose: () => void }) => {
  const { data, isLoading, isError } = useGetVehicleLocationQuery(vehicleId || '', { skip: !vehicleId });

  return (
    <Modal
      title="Live Vehicle Location"
      open={!!vehicleId}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ padding: 24, textAlign: 'center' }}>Loading location...</div>
      ) : isError || !data?.vehicle ? (
        <Alert type="warning" message="Driver Not Yet started the Trip." showIcon style={{ marginBottom: 16 }} />
      ) : (
        <div style={{ height: 400, width: '100%' }}>
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0, borderRadius: 8 }} 
            loading="lazy" 
            allowFullScreen 
            src={`https://maps.google.com/maps?q=${data.vehicle.latitude},${data.vehicle.longitude}&z=16&output=embed`}
          />
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">Last updated: {new Date(data.vehicle.updatedAt).toLocaleString()}</Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

const VehicleTracking = ({ orgId }: { orgId: string }) => {
  const { data, isLoading } = useGetActiveVehicleLocationsQuery(orgId, { pollingInterval: 15000 }); // Poll every 15s
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const activeVehicles = data?.vehicles || [];

  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: '600px' }}>
      {/* Sidebar List */}
      <Card 
        bordered={false} 
        style={{ width: '300px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowY: 'auto' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
          <Text strong>Active Vehicles ({activeVehicles.length})</Text>
        </div>
        {isLoading ? (
          <div style={{ padding: 16 }}>Loading locations...</div>
        ) : activeVehicles.length === 0 ? (
          <div style={{ padding: 16 }}>
            <Alert type="info" message="No active vehicles broadcasting location right now." showIcon />
          </div>
        ) : (
          <div>
            {activeVehicles.map((v: any) => (
              <div 
                key={v.vehicleId} 
                onClick={() => handleSelectVehicle(v)}
                style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  background: selectedVehicle?.vehicleId === v.vehicleId ? '#e6f7f6' : 'white',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontWeight: 500 }}>{v.vehicleName}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Driver: {v.driverName}</div>
                <Tag color="green" style={{ marginTop: 8 }}>Broadcasting</Tag>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Map Area */}
      <Card 
        bordered={false} 
        style={{ flex: 1, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ padding: 0, flex: 1, display: 'flex' }}
      >
        {selectedVehicle ? (
          <div style={{ flex: 1, width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, background: 'white', padding: '8px 16px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <Text strong>{selectedVehicle.vehicleName}</Text> <br/>
              <Text type="secondary">{selectedVehicle.vehicleNumber}</Text>
            </div>
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: 8 }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://maps.google.com/maps?q=${selectedVehicle.latitude},${selectedVehicle.longitude}&z=16&output=embed`}
            />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#aaa' }}>
            <EnvironmentOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
            <Text type="secondary" style={{ fontSize: '16px' }}>Select an active vehicle to view its location</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VehiclesIndex;
