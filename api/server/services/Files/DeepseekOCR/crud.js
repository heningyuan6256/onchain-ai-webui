const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const { logger } = require('~/config');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

/**
 * 根据文件类型自动选择接口：
 * - 图片：走 OCR（process.env.DEEPSEEK_OCR_URL）
 * - 其他：走 http://localhost:7080/convert/markdown
 *
 * @param {Object} params
 * @param {string} params.filePath 文件路径
 * @returns {Promise<Object>} 处理结果
 */
async function performVisionOCR({ filePath }) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const isImage = IMAGE_EXTENSIONS.includes(ext);
    const formData = new FormData();

    formData.append('file', fs.createReadStream(filePath));

    let apiUrl;
    if (isImage) {
      apiUrl = process.env.DEEPSEEK_OCR_URL;
      // 附加图片 OCR 参数
      formData.append('image', fs.createReadStream(filePath));
      formData.append('mode', 'plain_ocr');
      formData.append('prompt', 'grounding');
      formData.append('include_caption', 'false');
      formData.append('find_term', 'schema');
      formData.append('base_size', '1024');
      formData.append('image_size', '640');
      formData.append('crop_mode', 'true');
      formData.append('test_compress', 'false');
      formData.append('prompt_type', 'ocr');
      formData.append('grounding', 'false');
    } else {
      apiUrl = process.env.DEEPSEEK_CONVERT_URL;
    }

    logger.info(`[performVisionOCR] Uploading to: ${apiUrl}`);

    const response = await axios.post(apiUrl, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    logger.info(`[performVisionOCR] Success from ${isImage ? 'OCR' : 'Markdown'} API`);

    return response.data;
  } catch (error) {
    logger.error(`[performVisionOCR] Error: ${error.message}`, error);
    if (error.response) {
      logger.error(`[performVisionOCR] Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * 上传文件并调用 performVisionOCR
 * @param {Object} params
 * @param {ServerRequest} params.req
 * @param {Express.Multer.File} params.file
 * @returns {Promise<{ filename: string, bytes: number, text: string }>}
 */
const uploadOpenAIVisionOCR = async ({ req, file }) => {
  try {
    logger.info('[Custom OCR] Start processing file:', file.originalname);

    const result = await performVisionOCR({ filePath: file.path });
    const text = result?.text || result?.content?.markdown || JSON.stringify(result);

    return {
      filename: file.originalname,
      bytes: Buffer.byteLength(text, 'utf8'),
      filepath: 'auto_ocr_or_convert',
      text,
      images: [],
    };
  } catch (error) {
    logger.error(`[Custom OCR] uploadOpenAIVisionOCR failed: ${error.message}`, error);
    throw new Error(`OCR/转换失败: ${error.message}`);
  }
};

module.exports = {
  performVisionOCR,
  uploadOpenAIVisionOCR,
};
