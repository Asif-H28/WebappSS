import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Select,
  Card,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Space,
  Tag,
  Popconfirm,
  Empty,
  Drawer
} from 'antd';
import {
  VideoCameraAddOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import AppLayout from '../../components/layout/AppLayout.tsx';
import {
  useGetClassroomsWithSubjectsQuery,
  useGetLessonVideosQuery,
  useAddLessonVideoMutation,
  useDeleteLessonVideoMutation
} from '../../store/apiSlice.ts';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper to extract YouTube ID
const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const LearningResourceIndex: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<any>(null);
  const [form] = Form.useForm();
  
  // Filter States
  const [filterVideoType, setFilterVideoType] = useState<string>('all');
  const [filterClassId, setFilterClassId] = useState<string | undefined>(undefined);
  const [filterSubjectId, setFilterSubjectId] = useState<string | undefined>(undefined);
  const [filterLessonId, setFilterLessonId] = useState<string | undefined>(undefined);

  // User State
  const [orgId, setOrgId] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');

  useEffect(() => {
    const webUserStr = localStorage.getItem('webUser');
    if (webUserStr) {
      const user = JSON.parse(webUserStr);
      setOrgId(user.orgId || '');
      // If admin, pass organization name, else staff name
      setTeacherName(user.role === 'admin' ? user.organizationName || 'Admin' : user.name || 'Staff');
      setTeacherId(user.id || user._id || 'unknown');
    }
  }, []);

  // API Hooks
  const { data: classroomRes, isLoading: classesLoading } = useGetClassroomsWithSubjectsQuery(orgId, { skip: !orgId });
  
  const queryParams: any = { orgId };
  if (filterVideoType !== 'all') queryParams.videoType = filterVideoType;
  if (filterClassId) queryParams.classId = filterClassId;
  if (filterSubjectId) queryParams.subjectId = filterSubjectId;
  if (filterLessonId) queryParams.lessonId = filterLessonId;

  const { data: videosRes, isLoading: videosLoading } = useGetLessonVideosQuery(queryParams, { skip: !orgId });
  const [addVideo, { isLoading: isAdding }] = useAddLessonVideoMutation();
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteLessonVideoMutation();

  const classrooms = classroomRes?.classrooms || [];
  const videos = videosRes?.data || videosRes?.videos || (Array.isArray(videosRes) ? videosRes : []);

  // Form Cascading Logic
  const watchVideoType = Form.useWatch('videoType', form);
  const watchClassId = Form.useWatch('classId', form);
  const watchSubjectId = Form.useWatch('subjectId', form);

  const formClass = classrooms.find((c: any) => c.classId === watchClassId);
  const formSubjects = formClass?.subjects || [];
  const formSubject = formSubjects.find((s: any) => s._id === watchSubjectId);
  const formLessons = formSubject?.lessons || [];

  // Filter Cascading Logic
  const filterClass = classrooms.find((c: any) => c.classId === filterClassId);
  const filterSubjects = filterClass?.subjects || [];
  const filterSubjectItem = filterSubjects.find((s: any) => s._id === filterSubjectId);
  const filterLessons = filterSubjectItem?.lessons || [];

  const handleAddVideo = async (values: any) => {
    try {
      const payload = {
        ...values,
        orgId,
        teacherName,
        teacherId
      };
      
      const res = await addVideo(payload).unwrap();
      if (res.success) {
        toast.success('Video added successfully!');
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to add video');
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const res = await deleteVideo(videoId).unwrap();
      if (res.success) {
        toast.success('Video deleted successfully!');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete video');
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Home' }, { title: 'Learning Resource' }]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Learning Resources</Title>
        <Button 
          type="primary" 
          icon={<VideoCameraAddOutlined />} 
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({ videoType: 'lesson' });
            setIsModalVisible(true);
          }}
        >
          Add Video
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">Video Type</Text>
            <Select 
              style={{ width: '100%', marginTop: 8 }} 
              value={filterVideoType} 
              onChange={(val) => {
                setFilterVideoType(val);
                if (val === 'general') {
                  setFilterSubjectId(undefined);
                  setFilterLessonId(undefined);
                }
              }}
            >
              <Option value="all">All Videos</Option>
              <Option value="general">General</Option>
              <Option value="lesson">Subject Lesson</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">Class</Text>
            <Select 
              style={{ width: '100%', marginTop: 8 }} 
              placeholder="Select Class"
              allowClear
              value={filterClassId}
              onChange={(val) => {
                setFilterClassId(val);
                setFilterSubjectId(undefined);
                setFilterLessonId(undefined);
              }}
              loading={classesLoading}
            >
              {classrooms.map((c: any) => (
                <Option key={c.classId} value={c.classId}>{c.className}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">Subject</Text>
            <Select 
              style={{ width: '100%', marginTop: 8 }} 
              placeholder="Select Subject"
              allowClear
              disabled={!filterClassId || filterVideoType === 'general'}
              value={filterSubjectId}
              onChange={(val) => {
                setFilterSubjectId(val);
                setFilterLessonId(undefined);
              }}
            >
              {filterSubjects.map((s: any) => (
                <Option key={s._id} value={s._id}>{s.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text type="secondary">Lesson</Text>
            <Select 
              style={{ width: '100%', marginTop: 8 }} 
              placeholder="Select Lesson"
              allowClear
              disabled={!filterSubjectId || filterVideoType === 'general'}
              value={filterLessonId}
              onChange={(val) => setFilterLessonId(val)}
            >
              {filterLessons.map((l: any) => (
                <Option key={l._id} value={l._id}>{l.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <div style={{ minHeight: 400 }}>
        {videosLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>Loading videos...</div>
        ) : videos.length === 0 ? (
          <Empty description="No videos found" />
        ) : (
          <Row gutter={[24, 24]}>
            {videos.map((video: any) => {
              const ytId = getYouTubeID(video.url);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={video._id}>
                  <Card 
                    hoverable
                    bodyStyle={{ padding: 16 }}
                    cover={
                      ytId ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                          <iframe 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            src={`https://www.youtube.com/embed/${ytId}`} 
                            title={video.title}
                            allowFullScreen 
                          />
                        </div>
                      ) : (
                        <div style={{ height: 180, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PlayCircleOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                        </div>
                      )
                    }
                    actions={[
                      <Button type="text" icon={<PlayCircleOutlined />} onClick={() => setPlayingVideo(video)}>
                        Play
                      </Button>,
                      <Popconfirm
                        title="Delete video"
                        description="Are you sure to delete this video?"
                        onConfirm={() => handleDelete(video._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} loading={isDeleting}>Delete</Button>
                      </Popconfirm>
                    ]}
                  >
                    <Card.Meta 
                      title={video.title} 
                      description={
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Added by {video.teacherName}</Text>
                          <Space wrap style={{ marginTop: 8 }}>
                            <Tag color={video.videoType === 'general' ? 'blue' : 'green'}>
                              {video.videoType === 'general' ? 'General' : 'Lesson'}
                            </Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <Modal
        title="Add Learning Resource"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddVideo}>
          <Form.Item 
            name="videoType" 
            label="Video Type" 
            rules={[{ required: true, message: 'Please select video type' }]}
          >
            <Select>
              <Option value="lesson">Subject Lesson</Option>
              <Option value="general">General Video</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="title" 
            label="Video Title" 
            rules={[{ required: true, message: 'Please enter video title' }]}
          >
            <Input placeholder="E.g., Laws of Motion Part 1" />
          </Form.Item>

          <Form.Item 
            name="url" 
            label="YouTube URL" 
            rules={[{ required: true, message: 'Please enter YouTube URL' }]}
          >
            <Input placeholder="https://www.youtube.com/watch?v=..." />
          </Form.Item>

          <Form.Item 
            name="classId" 
            label="Class" 
            rules={[{ required: true, message: 'Please select class' }]}
          >
            <Select placeholder="Select Class" loading={classesLoading} onChange={() => {
              form.setFieldsValue({ subjectId: undefined, lessonId: undefined });
            }}>
              {classrooms.map((c: any) => (
                <Option key={c.classId} value={c.classId}>{c.className}</Option>
              ))}
            </Select>
          </Form.Item>

          {watchVideoType === 'lesson' && (
            <>
              <Form.Item 
                name="subjectId" 
                label="Subject" 
                rules={[{ required: true, message: 'Please select subject' }]}
              >
                <Select placeholder="Select Subject" disabled={!watchClassId} onChange={() => {
                  form.setFieldsValue({ lessonId: undefined });
                }}>
                  {formSubjects.map((s: any) => (
                    <Option key={s._id} value={s._id}>{s.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="lessonId" 
                label="Lesson" 
                rules={[{ required: true, message: 'Please select lesson' }]}
              >
                <Select placeholder="Select Lesson" disabled={!watchSubjectId}>
                  {formLessons.map((l: any) => (
                    <Option key={l._id} value={l._id}>{l.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isAdding}>
                Save Video
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Video Player Drawer */}
      <Drawer
        title={playingVideo?.title || 'Video Player'}
        placement="bottom"
        height="100vh"
        onClose={() => setPlayingVideo(null)}
        open={!!playingVideo}
        bodyStyle={{ padding: 0, background: '#000' }}
        headerStyle={{ background: '#141414', borderBottom: 'none' }}
        closeIcon={<span style={{ color: '#fff' }}>X</span>}
      >
        {playingVideo && (
          <iframe
            style={{ width: '100%', height: '100%', border: 0 }}
            src={`https://www.youtube.com/embed/${getYouTubeID(playingVideo.url)}?autoplay=1`}
            title={playingVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </Drawer>
    </AppLayout>
  );
};

export default LearningResourceIndex;
