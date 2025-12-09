import { useState } from 'react';
import { Avatar, Upload, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Controller, useFormContext } from 'react-hook-form';
import { dataService } from 'librechat-data-provider';

import { useLocalize } from '~/hooks';
import request from '~/request/request';
const MINIO_ENDPOINT = 'http://192.168.0.61:9002';
const BUCKET_NAME = 'onchain-ai';
const DEFAULT_AVATAR = '/assets/defaultavatar.svg';

type Props = {};

const AvatarUploadField = ({}: Props) => {
  const { control, setValue, watch } = useFormContext();
  const localize = useLocalize();

  const avatarUrl = watch('agent_img') || '';
  const [loading, setLoading] = useState(false);
  const IMG_MIME_PREFIX = ['image/'];
  const IMG_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

  const isImageFile = (file: File): boolean => {
    const mimeOk = IMG_MIME_PREFIX.some((pre) => file.type.startsWith(pre));
    const name = (file.name || '').toLowerCase();
    const extOk = IMG_EXT.some((ext) => name.endsWith(ext));
    return mimeOk || extOk;
  };
  const getPresignUrl = async (fileName: string, contentType: string) => {
    const res = await dataService.customuploadAgentAvatar({
      bucket: BUCKET_NAME,
      object: `avatar/${fileName}`,
      contentType,
    });
    console.log('presignUrl', res);
    return res.url;
  };

  const handleChange = async (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (!file || file.size === 0) return;
    if (!isImageFile(file)) {
      message.warning('文件类型有误');
      return;
    }
    setLoading(true);
    try {
      const presignUrl = await getPresignUrl(file.name, file.type);

      const res = await fetch(presignUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const permanentUrl = `${MINIO_ENDPOINT}/${BUCKET_NAME}/avatar/${encodeURIComponent(file.name)}`;
      setValue('agent_img', permanentUrl);
      message.success(localize('com_ui_upload_success'));
    } catch (e) {
      message.error(localize('com_ui_upload_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Controller
      name="agent_img"
      control={control}
      render={() => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Upload
            style={{ height: 64, width: 64, border: 'none' }}
            accept="image/*"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleChange}
            multiple={false}
          >
            <Avatar
              shape="square"
              src={avatarUrl || DEFAULT_AVATAR}
              size={64}
              style={{ cursor: 'pointer' }}
            />
          </Upload>
        </div>
      )}
    />
  );
};

export default AvatarUploadField;
