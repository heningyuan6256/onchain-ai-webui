const fs = require('fs').promises;
const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');
const { resizeAvatar } = require('~/server/services/Files/images/avatar');
const { getFileStrategy } = require('~/server/utils/getFileStrategy');
const { filterFile } = require('~/server/services/Files/process');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('./minio-client');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const appConfig = req.config;
    filterFile({ req, file: req.file, image: true, isAvatar: true });
    const userId = req.user.id;
    const { manual } = req.body;
    const input = await fs.readFile(req.file.path);

    if (!userId) {
      throw new Error('User ID is undefined');
    }

    const fileStrategy = getFileStrategy(appConfig, { isAvatar: true });
    const desiredFormat = appConfig.imageOutputType;
    const resizedBuffer = await resizeAvatar({
      userId,
      input,
      desiredFormat,
    });

    const { processAvatar } = getStrategyFunctions(fileStrategy);
    const url = await processAvatar({ buffer: resizedBuffer, userId, manual });

    res.json({ url });
  } catch (error) {
    const message = 'An error occurred while uploading the profile picture';
    logger.error(message, error);
    res.status(500).json({ message });
  } finally {
    try {
      await fs.unlink(req.file.path);
      logger.debug('[/files/images/avatar] Temp. image upload file deleted');
    } catch {
      logger.debug('[/files/images/avatar] Temp. image upload file already deleted');
    }
  }
});

router.get('/presign-put', async (req, res) => {
  try {
    const { bucket, object, contentType } = req.query;
    if (!bucket || !object || !contentType) {
      return res.status(400).json({ message: '参数缺失' });
    }

    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: object,
        ContentType: contentType,
      }),
      { expiresIn: 60 },
    );

    return res.json({ url });
  } catch (err) {
    logger.error('[/presign-put] ', err);
    return res.status(500).json({ message: '上传错误' });
  }
});
module.exports = router;
