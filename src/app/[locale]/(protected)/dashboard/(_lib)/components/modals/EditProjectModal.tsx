'use client';

import { UploadOutlined } from '@ant-design/icons';
import { App, Form, Input, Modal, Upload, type UploadFile } from 'antd';
import type { RcFile } from 'antd/es/upload';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useProjectMutations } from '@/app/[locale]/(protected)/dashboard/(_lib)/hooks/useProjectMutations';
import {
  dashboardModalState,
  selectedProjectIdState,
  selectedProjectSelector,
} from '@/app/[locale]/(protected)/dashboard/(_lib)/store/projects.atoms';

interface FormValues {
  name: string;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

/**
 * Modal component for editing an existing project
 * Pre-fills form with current project data and allows updating name and image
 */
export const EditProjectModal = (): React.ReactElement => {
  const t = useTranslations('dashboard');
  const { notification } = App.useApp();
  const [modals, setModals] = useRecoilState(dashboardModalState);
  const selected = useRecoilValue(selectedProjectSelector);
  const setSelectedId = useRecoilState(selectedProjectIdState)[1];
  const { updateProject, updating } = useProjectMutations();
  const [file, setFile] = useState<File | null>(null);
  const [form] = Form.useForm<FormValues>();

  const isOpen = modals.edit && Boolean(selected);

  // Get preview URL (prefer new file, fallback to existing image)
  const previewUrl = useMemo((): string | null => {
    if (file) return URL.createObjectURL(file);
    return selected?.avatar || selected?.imageUrl || null;
  }, [file, selected?.avatar, selected?.imageUrl]);

  // Validate uploaded file before adding to form
  const beforeUpload = useCallback(
    (file: RcFile): boolean | typeof Upload.LIST_IGNORE => {
      const isValidType = ALLOWED_FILE_TYPES.includes(file.type);
      if (!isValidType) {
        notification.error({
          message: t('modals.create.onlyTypes'),
          placement: 'topRight',
        });
        return Upload.LIST_IGNORE;
      }

      const isValidSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
      if (!isValidSize) {
        notification.error({
          message: t('modals.create.sizeLimit', { size: MAX_FILE_SIZE_MB }),
          placement: 'topRight',
        });
        return Upload.LIST_IGNORE;
      }

      setFile(file);
      return false;
    },
    [notification]
  );

  // Close modal and reset state
  const handleCancel = useCallback((): void => {
    setModals(prev => ({ ...prev, edit: false }));
    setSelectedId(null);
    setFile(null);
    form.resetFields();
  }, [setModals, setSelectedId, form]);

  // Handle form submission
  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!selected) return;

    try {
      const values = await form.validateFields();
      await updateProject(selected.id, {
        name: values.name,
        image: file ?? undefined,
      });
      handleCancel();
    } catch {
      // Error is handled in useProjectMutations
      // Don't close modal on error
    }
  }, [selected, form, file, updateProject, handleCancel]);

  // Handle file removal
  const handleRemove = useCallback((): void => {
    setFile(null);
  }, []);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && selected) {
      form.setFieldsValue({ name: selected.name });
    }
  }, [isOpen, selected, form]);

  return (
    <Modal
      title={<span className="text-lg font-semibold">{t('modals.edit.title')}</span>}
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => void handleSubmit()}
      confirmLoading={updating}
      centered
      maskClosable={false}
      okText={t('modals.edit.ok')}
      cancelText={t('modals.edit.cancel')}
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
                  <span className="text-sm text-slate-600">{t('modals.edit.uploadNew')}</span>
                  <span className="text-xs text-slate-400">{t('modals.create.uploadTypes', { size: MAX_FILE_SIZE_MB })}</span>
                </div>
              )}
            </Upload>

            {previewUrl && (
              <div className="rounded-lg border border-slate-200 p-2">
                <Image
                  src={previewUrl}
                  alt={t('modals.create.previewAlt')}
                  width={400}
                  height={128}
                  className="h-32 w-full rounded-md object-cover"
                />
                {selected && (selected.avatar || selected.imageUrl) && !file && (
                  <p className="mt-2 text-center text-xs text-slate-500">{t('modals.edit.currentImage')}</p>
                )}
                {file && <p className="mt-2 text-center text-xs text-indigo-600">{t('modals.edit.newImage')}</p>}
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
