'use client';

import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { App, Avatar, Form, Input, Modal, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useProfile } from '@/app/[locale]/(protected)/profile/(_lib)/hooks/useProfile';
import type { TUpdateProfilePayload } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';

export function EditProfileModal() {
  const t = useTranslations('profile');
  const { notification } = App.useApp();
  const { profile, isUpdating, modalState, setModalState, updateProfile } = useProfile();
  const [form] = Form.useForm<TUpdateProfilePayload>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.error({
        message: 'You can only upload image files!',
        placement: 'topRight',
      });
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notification.error({
        message: 'Image must be smaller than 5MB!',
        placement: 'topRight',
      });
    }
    return isImage && isLt5M;
  };

  useEffect(() => {
    if (modalState.edit && profile) {
      form.setFieldsValue({
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      });
      setImageUrl(profile.avatarUrl);
    }
  }, [modalState.edit, profile, form]);

  const handleChange: UploadProps['onChange'] = info => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get the uploaded image URL from response
      const url = info.file.response?.url || info.file.response?.data?.url;
      setImageUrl(url);
      form.setFieldValue('avatarUrl', url);
      setUploading(false);
    }
  };

  const customUpload: UploadProps['customRequest'] = ({ file, onSuccess }) => {
    // Simulate upload - replace with actual S3 upload
    setTimeout(() => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const dataUrl = reader.result as string;
        setImageUrl(dataUrl);
        form.setFieldValue('avatarUrl', dataUrl);
        setUploading(false);
        onSuccess?.({ url: dataUrl });
      });
      reader.readAsDataURL(file as RcFile);
    }, 1000);
  };

  const handleSubmit = () => {
    void (async () => {
      try {
        const values = await form.validateFields();
        await updateProfile(values);
        form.resetFields();
        setImageUrl(undefined);
      } catch (error) {
        // Keep modal open on validation error
        // eslint-disable-next-line no-console
        console.error('Validation failed:', error);
      }
    })();
  };

  const handleClose = () => {
    form.resetFields();
    setImageUrl(undefined);
    setModalState(prev => ({ ...prev, edit: false }));
  };

  const uploadButton = (
    <div className="flex flex-col items-center">
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="mt-2 text-sm">{t('form.uploadAvatar') || 'Upload'}</div>
    </div>
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-indigo-600" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-semibold text-transparent">{t('editProfile')}</span>
        </div>
      }
      open={modalState.edit}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText={t('form.save')}
      cancelText={t('form.cancel')}
      confirmLoading={isUpdating}
      width={600}
      className="top-8"
    >
      <div className="py-4">
        <Form form={form} layout="vertical" size="large">
          {/* Avatar Upload */}
          <Form.Item label={t('form.avatar')} className="text-center">
            <div className="flex flex-col items-center gap-4">
              <Avatar size={120} src={imageUrl} icon={<UserOutlined />} className="border-4 border-indigo-100 shadow-lg" />
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                customRequest={customUpload}
              >
                {uploadButton}
              </Upload>
            </div>
          </Form.Item>

          {/* Full Name */}
          <Form.Item
            name="fullName"
            label={
              <span className="font-medium text-gray-700">
                {t('form.fullName')} <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input
              placeholder={t('form.fullNamePlaceholder') || 'Enter your full name'}
              prefix={<UserOutlined className="text-gray-400" />}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            name="phone"
            label={<span className="font-medium text-gray-700">{t('form.phone')}</span>}
            rules={[{ pattern: /^\d{10,}$/, message: t('validation.phoneInvalid') || 'Phone must be at least 10 digits' }]}
          >
            <Input placeholder={t('form.phonePlaceholder') || 'Enter phone number'} className="rounded-lg" />
          </Form.Item>

          {/* Avatar URL (hidden) */}
          <Form.Item name="avatarUrl" hidden>
            <Input />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
