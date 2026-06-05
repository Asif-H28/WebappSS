import React, { useState, useEffect } from 'react';
import { Card, Select, Typography, Table, Space, Tag, Row, Col, Empty, Spin, Divider } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout.tsx';
import { 
  useGetClassroomListQuery, 
  useGetStudentNamesByClassQuery,
  useGetStudentResultsQuery
} from '../../store/apiSlice.ts';

const { Title, Text } = Typography;
const { Option } = Select;

const ResultsIndex: React.FC = () => {
  const [orgId, setOrgId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

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

  const { data: classData, isLoading: isClassLoading } = useGetClassroomListQuery(orgId, { skip: !orgId });
  const classrooms = classData?.classrooms || [];

  const { data: studentData, isLoading: isStudentLoading } = useGetStudentNamesByClassQuery(selectedClassId || '', { skip: !selectedClassId });
  const students = studentData?.students || [];

  const { data: resultsData, isLoading: isResultsLoading } = useGetStudentResultsQuery(selectedStudentId || '', { skip: !selectedStudentId });
  const results = Array.isArray(resultsData) ? resultsData : [];

  const handleClassChange = (val: string) => {
    setSelectedClassId(val);
    setSelectedStudentId(null);
  };

  const scholasticColumns = [
    { title: 'Subject', dataIndex: 'subjectName', key: 'subjectName' },
    { title: 'Internal', dataIndex: 'internalMarksScored', key: 'internalMarksScored' },
    { title: 'External', dataIndex: 'externalMarksScored', key: 'externalMarksScored' },
    { title: 'Total', dataIndex: 'totalMarksScored', key: 'totalMarksScored', render: (t: number) => <Text strong>{t}</Text> },
    { title: 'Grade', dataIndex: 'grade', key: 'grade' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pass' ? 'success' : 'error'}>{status.toUpperCase()}</Tag>
      )
    },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  ];

  const coScholasticColumns = [
    { title: 'Activity', dataIndex: 'activityName', key: 'activityName' },
    { title: 'Grade', dataIndex: 'grade', key: 'grade' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  ];

  const customFilterOption = (input: string, option: any) => {
    let text = '';
    if (typeof option?.children === 'string') {
      text = option.children;
    } else if (Array.isArray(option?.children)) {
      text = option.children.join('');
    } else {
      text = String(option?.children || '');
    }
    const normalizedInput = input.replace(/\s+/g, '').toLowerCase();
    const normalizedText = text.replace(/\s+/g, '').toLowerCase();
    return normalizedText.includes(normalizedInput);
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Results' }]}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 12, color: '#0d9488' }} />
          Student Results
        </Title>
        <Text type="secondary">View published comprehensive assessment results for students.</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <Space size="large" align="start" style={{ width: '100%', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 300 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Class</Text>
            <Select 
              size="large"
              style={{ width: '100%' }}
              placeholder="Select a class"
              loading={isClassLoading}
              onChange={handleClassChange}
              value={selectedClassId}
              showSearch
              filterOption={customFilterOption}
            >
              {classrooms.map((cls: any) => (
                <Option key={cls.classId} value={cls.classId}>{cls.className}</Option>
              ))}
            </Select>
          </div>

          <div style={{ minWidth: 300 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Student</Text>
            <Select 
              size="large"
              style={{ width: '100%' }}
              placeholder="Select a student"
              loading={isStudentLoading}
              onChange={(val) => setSelectedStudentId(val)}
              value={selectedStudentId}
              disabled={!selectedClassId || students.length === 0}
              showSearch
              filterOption={customFilterOption}
            >
              {students.map((stu: any) => (
                <Option key={stu.studentId} value={stu.studentId}>{stu.name}</Option>
              ))}
            </Select>
            {students.length === 0 && selectedClassId && !isStudentLoading && (
              <Text type="danger" style={{ display: 'block', marginTop: 4 }}>No students found in this class.</Text>
            )}
          </div>
        </Space>
      </Card>

      {isResultsLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {!isResultsLoading && selectedStudentId && results.length === 0 && (
        <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Empty description="No results published for this student yet." />
        </Card>
      )}

      {!isResultsLoading && results.length > 0 && (
        <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: 8 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {results.map((result: any) => (
              <Card 
                key={result.resultId} 
                bordered={false} 
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#0d9488' }}>{result.title}</Title>
                    <Text type="secondary">
                      Published By: {result.publishedBy} | 
                      Updated: {new Date(result.updatedAt).toLocaleDateString()}
                    </Text>
                  </div>
                <div style={{ textAlign: 'right' }}>
                  <Title level={3} style={{ margin: 0, color: result.overallStatus === 'pass' ? '#52c41a' : '#ff4d4f' }}>
                    {result.percentage.toFixed(2)}%
                  </Title>
                  <Tag color={result.overallStatus === 'pass' ? 'success' : 'error'} style={{ marginTop: 4, marginRight: 0 }}>
                    {result.overallStatus.toUpperCase()} - Grade {result.overallGrade}
                  </Tag>
                </div>
              </div>

              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                  <Card size="small" type="inner">
                    <Text type="secondary">Total Internal</Text>
                    <Title level={4} style={{ margin: 0 }}>{result.totalInternalScored}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" type="inner">
                    <Text type="secondary">Total External</Text>
                    <Title level={4} style={{ margin: 0 }}>{result.totalExternalScored}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" type="inner">
                    <Text type="secondary">Grand Total</Text>
                    <Title level={4} style={{ margin: 0 }}>{result.overallTotalScored} / {result.overallTotalMaximum}</Title>
                  </Card>
                </Col>
              </Row>

              <Title level={5}>Scholastic Results</Title>
              <Table 
                dataSource={result.scholasticResults} 
                columns={scholasticColumns} 
                rowKey="subjectName" 
                pagination={false}
                size="small"
                bordered
              />

              {result.coScholasticResults && result.coScholasticResults.length > 0 && (
                <>
                  <Divider />
                  <Title level={5}>Co-Scholastic Results</Title>
                  <Table 
                    dataSource={result.coScholasticResults} 
                    columns={coScholasticColumns} 
                    rowKey="activityName" 
                    pagination={false}
                    size="small"
                    bordered
                  />
                </>
              )}

              {result.overallRemarks && (
                <>
                  <Divider />
                  <Text strong>Overall Remarks: </Text>
                  <Text>{result.overallRemarks}</Text>
                </>
              )}
            </Card>
          ))}
        </Space>
        </div>
      )}
    </AppLayout>
  );
};

export default ResultsIndex;
