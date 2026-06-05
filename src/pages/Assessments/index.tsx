import React, { useState, useEffect } from 'react';
import { Card, Select, Typography, Table, Button, Modal, Form, Input, InputNumber, Space, message, Tag } from 'antd';
import { FormOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout.tsx';
import { 
  useGetClassroomListQuery, 
  useGetAssessmentsByClassQuery, 
  useGetStudentNamesByClassQuery,
  useGetAssessmentDetailsQuery,
  useSubmitAssessmentResultMutation,
  useGetOrgBasicDetailsQuery
} from '../../store/apiSlice.ts';

const { Title, Text } = Typography;
const { Option } = Select;

const AssessmentsIndex: React.FC = () => {
  const [orgId, setOrgId] = useState<string>('');
  const [webUser, setWebUser] = useState<any>(null);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: classData, isLoading: isClassLoading } = useGetClassroomListQuery(orgId, { skip: !orgId });
  const classrooms = classData?.classrooms || [];

  const { data: assessmentData, isLoading: isAssessmentLoading } = useGetAssessmentsByClassQuery(selectedClassId || '', { skip: !selectedClassId });
  const assessments = assessmentData?.assessments || [];

  const { data: studentData, isLoading: isStudentLoading } = useGetStudentNamesByClassQuery(selectedClassId || '', { skip: !selectedClassId });
  const students = studentData?.students || [];

  const { data: detailsData, isLoading: isDetailsLoading } = useGetAssessmentDetailsQuery(selectedAssessment?.assessmentId || '', { skip: !selectedAssessment?.assessmentId });
  const assessmentDetails = detailsData || null;

  const { data: orgData } = useGetOrgBasicDetailsQuery(orgId, { skip: !orgId });

  const [submitResult, { isLoading: isSubmitting }] = useSubmitAssessmentResultMutation();

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

  const handleClassChange = (val: string) => {
    setSelectedClassId(val);
    setSelectedAssessment(null);
  };

  const handleAssessmentSelect = (assessmentId: string) => {
    const assessment = assessments.find((a: any) => a.assessmentId === assessmentId);
    setSelectedAssessment(assessment);
  };

  const openMarksModal = (student: any) => {
    setCurrentStudent(student);
    form.resetFields();
    
    let initialScholastic = [
        { subjectName: '', internalMarksScored: 0, externalMarksScored: 0, grade: '', remarks: '' }
    ];
    let initialCoScholastic = [
        { activityName: '', grade: '', remarks: '' }
    ];

    if (assessmentDetails) {
      if (assessmentDetails.scholasticSubjects && assessmentDetails.scholasticSubjects.length > 0) {
        initialScholastic = assessmentDetails.scholasticSubjects.map((sub: any) => ({
          subjectName: sub.subjectName,
          internalMarksScored: 0,
          externalMarksScored: 0,
          grade: '',
          remarks: ''
        }));
      }
      if (assessmentDetails.coScholasticActivities && assessmentDetails.coScholasticActivities.length > 0) {
        initialCoScholastic = assessmentDetails.coScholasticActivities.map((act: any) => ({
          activityName: act.activityName,
          grade: '',
          remarks: ''
        }));
      }
    }

    form.setFieldsValue({
      scholasticResults: initialScholastic,
      coScholasticResults: initialCoScholastic
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const finalScholasticResults = values.scholasticResults.map((result: any) => {
        const internal = result.internalMarksScored || 0;
        const external = result.externalMarksScored || 0;
        const total = internal + external;
        
        let passScore = 33; // Default fallback
        if (assessmentDetails && assessmentDetails.scholasticSubjects) {
          const matchingSubject = assessmentDetails.scholasticSubjects.find((s: any) => s.subjectName === result.subjectName);
          if (matchingSubject && matchingSubject.minimumPassScore !== undefined) {
            passScore = matchingSubject.minimumPassScore;
          }
        }
        
        return {
          ...result,
          totalMarksScored: total,
          status: total < passScore ? 'fail' : 'pass'
        };
      });

      const payload = {
        studentId: currentStudent.studentId,
        studentName: currentStudent.name,
        classId: selectedClassId,
        orgId: orgId,
        className: classrooms.find((c: any) => c.classId === selectedClassId)?.className || '',
        publishedBy: orgData?.schoolName || 'Organization',
        scholasticResults: finalScholasticResults,
        coScholasticResults: values.coScholasticResults
      };

      await submitResult({ assessmentId: selectedAssessment.assessmentId, payload }).unwrap();
      message.success('Marks published successfully for ' + currentStudent.name);
      setIsModalVisible(false);
    } catch (err: any) {
      if (err.errorFields) return; // Validation error
      message.error(err?.data?.message || err?.data?.error || 'Failed to submit results');
    }
  };

  const studentColumns = [
    { title: 'Student Name', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
    { 
      title: 'Action', 
      key: 'action', 
      render: (_: any, record: any) => (
        <Button type="primary" size="small" onClick={() => openMarksModal(record)}>
          Enter Marks
        </Button>
      ) 
    }
  ];

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Assessments' }]}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <FormOutlined style={{ marginRight: 12, color: '#0d9488' }} />
          Assessments & Results
        </Title>
        <Text type="secondary">Manage class assessments and enter student marks.</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <Space size="large" align="start" style={{ width: '100%' }}>
          <div style={{ minWidth: 300 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Class</Text>
            <Select 
              size="large"
              style={{ width: '100%' }}
              placeholder="Select a class"
              loading={isClassLoading}
              onChange={handleClassChange}
              value={selectedClassId}
            >
              {classrooms.map((cls: any) => (
                <Option key={cls.classId} value={cls.classId}>{cls.className}</Option>
              ))}
            </Select>
          </div>

          {selectedClassId && (
            <div style={{ minWidth: 300 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Assessment</Text>
              <Select 
                size="large"
                style={{ width: '100%' }}
                placeholder="Select an assessment"
                loading={isAssessmentLoading}
                onChange={handleAssessmentSelect}
                value={selectedAssessment?.assessmentId}
                disabled={assessments.length === 0}
              >
                {assessments.map((a: any) => (
                  <Option key={a.assessmentId} value={a.assessmentId}>
                    {a.title} ({a.type})
                  </Option>
                ))}
              </Select>
              {assessments.length === 0 && !isAssessmentLoading && (
                <Text type="danger" style={{ display: 'block', marginTop: 4 }}>No assessments found for this class.</Text>
              )}
            </div>
          )}
        </Space>
      </Card>

      {selectedAssessment && (
        <Card title={`Students in Class (Entering marks for: ${selectedAssessment.title})`} bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Table 
            dataSource={students} 
            columns={studentColumns} 
            rowKey="studentId" 
            loading={isStudentLoading}
            pagination={{ pageSize: 15 }}
          />
        </Card>
      )}

      <Modal
        title={`Enter Marks for ${currentStudent?.name}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleModalSubmit}
        confirmLoading={isSubmitting}
        width={800}
        okText="Publish Result"
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Form form={form} layout="vertical">
          <Card size="small" title="Scholastic Results (Subjects)" style={{ marginBottom: 16 }}>
            <Form.List name="scholasticResults">
              {(fields, { add, remove }) => (
                <>
                  {fields.length > 0 && (
                    <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <div style={{ width: 180 }}><Text strong>Subject</Text></div>
                      <div style={{ width: 100 }}><Text strong>Internal</Text></div>
                      <div style={{ width: 100 }}><Text strong>External</Text></div>
                      <div style={{ width: 100 }}><Text strong>Grade</Text></div>
                      <div style={{ width: 150 }}><Text strong>Remarks</Text></div>
                    </Space>
                  )}
                  {fields.map(({ key, name, ...restField }) => {
                    const subjectName = form.getFieldValue(['scholasticResults', name, 'subjectName']);
                    const subjectDetails = assessmentDetails?.scholasticSubjects?.find((s: any) => s.subjectName === subjectName);
                    const maxInternal = subjectDetails?.internalMaximumScore || 100;
                    const maxExternal = subjectDetails?.externalMaximumScore || 100;

                    return (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item {...restField} name={[name, 'subjectName']} rules={[{ required: true, message: 'Missing subject' }]} style={{ marginBottom: 0 }}>
                          <Input placeholder="Subject Name" style={{ width: 180 }} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'internalMarksScored']} rules={[{ required: true, message: 'Missing internal marks' }, { type: 'number', max: maxInternal, message: `Max ${maxInternal}` }]} style={{ marginBottom: 0 }}>
                          <InputNumber placeholder="Internal" min={0} max={maxInternal} style={{ width: 100 }} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'externalMarksScored']} rules={[{ required: true, message: 'Missing external marks' }, { type: 'number', max: maxExternal, message: `Max ${maxExternal}` }]} style={{ marginBottom: 0 }}>
                          <InputNumber placeholder="External" min={0} max={maxExternal} style={{ width: 100 }} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'grade']} rules={[{ required: true, message: 'Missing grade' }]} style={{ marginBottom: 0 }}>
                          <Input placeholder="Grade" style={{ width: 100 }} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'remarks']} style={{ marginBottom: 0 }}>
                          <Input placeholder="Remarks" style={{ width: 150 }} />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                        )}
                      </Space>
                    );
                  })}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Subject
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Card size="small" title="Co-Scholastic Results (Activities)" style={{ marginBottom: 16 }}>
            <Form.List name="coScholasticResults">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'activityName']} rules={[{ required: true, message: 'Missing activity' }]} style={{ marginBottom: 0 }}>
                        <Input placeholder="Activity Name (e.g. Physical Ed)" style={{ width: 250 }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'grade']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Input placeholder="Grade" style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'remarks']} style={{ marginBottom: 0 }}>
                        <Input placeholder="Remarks" style={{ width: 250 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item style={{ marginTop: 16 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Activity
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default AssessmentsIndex;
