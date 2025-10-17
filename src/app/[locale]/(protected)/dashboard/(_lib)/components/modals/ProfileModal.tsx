'use client';

import { App, Form, Input, Modal } from 'antd';
import { useRecoilState } from 'recoil';

import { dashboardModalState } from '@/app/[locale]/(protected)/dashboard/(_lib)/store/projects.atoms';
import { authUserState } from '@/app/[locale]/(public)/auth/(_lib)/model/auth.atoms';

export function ProfileModal() {
  const { notification } = App.useApp();
  const [modals, setModals] = useRecoilState(dashboardModalState);
  const [user, setUser] = useRecoilState(authUserState);
  const open = modals.profile;

  const [form] = Form.useForm<{ name: string; email: string }>();

  const handleCancel = () => setModals(prev => ({ ...prev, profile: false }));

  const handleOk = async () => {
    const values = await form.validateFields();
    setUser(prev => (prev ? { ...prev, name: values.name } : prev));
    notification.success({
      message: 'Profile updated',
      placement: 'topRight',
    });
    handleCancel();
  };

  return (
    <Modal
      title="View Profile"
      open={open}
      onCancel={handleCancel}
      onOk={() => void handleOk()}
      centered
      maskClosable
      afterOpenChange={opened => {
        if (opened) {
          form.setFieldsValue({ name: user?.name ?? '', email: user?.email ?? '' });
        } else {
          form.resetFields();
        }
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Full name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
}
