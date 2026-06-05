import React from 'react';
import { Layout, Menu, Breadcrumb, Dropdown, Avatar, ConfigProvider } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  PlaySquareOutlined,
  BankOutlined,
  BellOutlined,
  CarOutlined,
  FormOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice.ts';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { title: string }[];
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, breadcrumbs }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Dispatch Redux logout
    dispatch(logout());
    
    // Clear local storage completely as per our API service logic
    localStorage.clear();
    
    // Redirect
    navigate('/org/login');
  };

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const sidebarMenu = [
    {
      key: '/organization',
      icon: <BankOutlined />,
      label: 'Organization',
      onClick: () => navigate('/organization'),
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Enquiries',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/dashboard/notices',
      icon: <BellOutlined />,
      label: 'Notices',
      onClick: () => navigate('/dashboard/notices'),
    },
    {
      key: '/dashboard/assessments',
      icon: <FormOutlined />,
      label: 'Assessments',
      onClick: () => navigate('/dashboard/assessments'),
    },
    {
      key: '/dashboard/results',
      icon: <BookOutlined />,
      label: 'Results',
      onClick: () => navigate('/dashboard/results'),
    },
    {
      key: '/dashboard/library',
      icon: <BookOutlined />,
      label: 'Library',
      onClick: () => navigate('/dashboard/library'),
    },
    {
      key: '/dashboard/learning-resource',
      icon: <PlaySquareOutlined />,
      label: 'Learning Resource',
      onClick: () => navigate('/dashboard/learning-resource'),
    },
    {
      key: '/dashboard/vehicles',
      icon: <CarOutlined />,
      label: 'Vehicles',
      onClick: () => navigate('/dashboard/vehicles'),
    },
    // Future items can be added here
  ];

  // Map the current path to breadcrumb items
  const defaultBreadcrumbs = [
    { title: 'Home' },
    { title: 'Dashboard' },
    { title: 'Admissions' },
  ];
  
  const currentBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  // User state from localStorage
  let userInitials = 'U';
  try {
    const webUserStr = localStorage.getItem('webUser');
    if (webUserStr) {
      const webUser = JSON.parse(webUserStr);
      if (webUser.name) {
        userInitials = webUser.name.charAt(0).toUpperCase();
      }
    }
  } catch (e) {
    // Ignore JSON parse error
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0d9488', // Professional Teal
          fontFamily: 'var(--font-body)',
          borderRadius: 8,
        },
        components: {
          Menu: {
            itemSelectedBg: '#e6f7f6', // Light teal background
            itemSelectedColor: '#0d9488',
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          theme="light"
          style={{ borderRight: '1px solid var(--color-border)' }}
        >
          <div style={{ 
            height: '64px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488',
            fontWeight: 800,
            fontSize: collapsed ? '18px' : '22px',
            letterSpacing: '-0.5px',
            borderBottom: '1px solid var(--color-border)'
          }}>
            {collapsed ? 'SS' : 'SchoolSync'}
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={sidebarMenu}
          />
        </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: 'var(--color-surface)', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)'
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <Breadcrumb items={currentBreadcrumbs} />
          </div>

          <div style={{ paddingRight: '24px' }}>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
              <Avatar 
                style={{ backgroundColor: 'var(--color-primary)', cursor: 'pointer' }}
                icon={<UserOutlined />}
              >
                {userInitials}
              </Avatar>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: 'var(--color-surface)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            overflowY: 'auto'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
