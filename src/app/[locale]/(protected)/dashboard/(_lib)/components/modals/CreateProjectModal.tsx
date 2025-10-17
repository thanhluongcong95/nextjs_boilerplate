'use client';

import { UploadOutlined } from '@ant-design/icons';
import { App, Form, Input, Modal, Upload, type UploadFile } from 'antd';
import type { RcFile } from 'antd/es/upload';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';

import { useProjectMutations } from '@/app/[locale]/(protected)/dashboard/(_lib)/hooks/useProjectMutations';
import { dashboardModalState } from '@/app/[locale]/(protected)/dashboard/(_lib)/store/projects.atoms';

interface FormValues {
  name: string;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

/**
 * Modal component for creating a new project
 * Handles project name input and optional image upload
 */
export const CreateProjectModal = (): React.ReactElement => {
  const t = useTranslations('dashboard');
  const { notification } = App.useApp();
  const [modals, setModals] = useRecoilState(dashboardModalState);
  const { createProject, creating } = useProjectMutations();
  const [file, setFile] = useState<File | null>(null);
  const [form] = Form.useForm<FormValues>();

  const isOpen = modals.create;

  // Validate uploaded file before adding to form
  const beforeUpload = useCallback(
    (file: RcFile): boolean | typeof Upload.LIST_IGNORE => {
      // Check file type
      const isValidType = ALLOWED_FILE_TYPES.includes(file.type);
      if (!isValidType) {
        notification.error({
          message: t('modals.create.onlyTypes'),
          placement: 'topRight',
        });
        return Upload.LIST_IGNORE;
      }

      // Check file size (5MB max)
      const isValidSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
      if (!isValidSize) {
        notification.error({
          message: t('modals.create.sizeLimit', { size: MAX_FILE_SIZE_MB }),
          placement: 'topRight',
        });
        return Upload.LIST_IGNORE;
      }

      setFile(file);
      return false; // Prevent auto upload
    },
    [notification]
  );

  // Generate preview URL from selected file
  const previewUrl = useMemo((): string | null => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Close modal and reset state
  const handleCancel = useCallback((): void => {
    setModals(prev => ({ ...prev, create: false }));
    setFile(null);
    form.resetFields();
  }, [setModals, form]);

  // Handle form submission
  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      await createProject({ name: values.name, image: file ?? undefined });
      handleCancel();
    } catch {
      // Error is handled in useProjectMutations
      // Don't close modal on error
    }
  }, [form, file, createProject, handleCancel]);

  // Handle file removal
  const handleRemove = useCallback((): void => {
    setFile(null);
  }, []);

  return (
    <Modal
      title={<span className="text-lg font-semibold">{t('modals.create.title')}</span>}
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => void handleSubmit()}
      confirmLoading={creating}
      centered
      maskClosable={false}
      okText={t('modals.create.ok')}
      cancelText={t('modals.create.cancel')}
      width={600}
      className="[&_.ant-modal-header]:pb-3"
    >
      <Form form={form} layout="vertical" requiredMark={false} className="mt-4">
        <Form.Item
          name="name"
          label={<span className="font-medium">{t('modals.create.nameLabel')}</span>}
          rules={[
            { required: true, message: t('modals.create.nameRequired') },
            { min: 1, message: t('modals.create.nameEmpty') },
          ]}
        >
          <Input placeholder={t('modals.create.namePlaceholder')} size="large" className="rounded-lg" autoFocus />
        </Form.Item>

        <Form.Item label={<span className="font-medium">{t('modals.create.imageLabel')}</span>} className="mb-0">
          <div className="space-y-3">
            <Upload
              listType="picture-card"
              maxCount={1}
              accept={ALLOWED_FILE_TYPES.join(',')}
              beforeUpload={beforeUpload}
              onRemove={handleRemove}
              fileList={
                file
                  ? ([
                      {
                        uid: '-1',
                        name: file.name,
                        status: 'done',
                      } as UploadFile,
                    ] as UploadFile[])
                  : []
              }
              className="[&_.ant-upload-select]:rounded-lg"
            >
              {!file && (
                <div className="flex flex-col items-center gap-2">
                  <UploadOutlined className="text-2xl text-slate-400" />
                  <span className="text-sm text-slate-600">{t('modals.create.uploadHint')}</span>
                  <span className="text-xs text-slate-400">{t('modals.create.uploadTypes', { size: MAX_FILE_SIZE_MB })}</span>
                </div>
              )}
            </Upload>

            {previewUrl && (
              <div className="rounded-lg border border-slate-200 p-2">
                <Image
                  src={previewUrl}
                  alt={t('modals.create.previewAlt')}
                  className="h-32 w-full rounded-md object-cover"
                  width={400}
                  height={128}
                />
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
