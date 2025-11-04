const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const { logger } = require('~/config');

/**
 * 使用自定义 OCR 接口 http://localhost:3000/api/ocr
 * 对图片执行 OCR
 *
 * @param {Object} params
 * @param {string} params.filePath 文件路径
 * @returns {Promise<Object>} OCR 结果
 */
async function performVisionOCR({ filePath}) {
  try {
    const formData = new FormData();

    const imageData =  fs.createReadStream(filePath)
    // 附加图片文件
    formData.append('image', imageData);
    formData.append('file', imageData);

    // 其他参数
    formData.append('mode', 'plain_ocr');
    formData.append('prompt', 'grounding');
    formData.append('false', ''); // 原参数结构不合理，这里按 key:value 对齐修正
    formData.append('include_caption', 'false');
    formData.append('find_term', 'schema');
    formData.append('base_size', '1024');
    formData.append('image_size', '640');
    formData.append('crop_mode', 'true');
    formData.append('test_compress', 'false');
    formData.append("prompt_type",'ocr')
    formData.append("grounding","true")

    const response = await axios.post(process.env.DEEPSEEK_OCR_URL, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });
    logger.info('结果:', response.data);

    return response.data;
  } catch (error) {
    logger.error(`[Custom OCR] Error: ${error.message}`, error);
    if (error.response) {
      logger.error(`[Custom OCR] Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * 上传文件并调用自定义 OCR
 * @param {Object} params
 * @param {ServerRequest} params.req
 * @param {Express.Multer.File} params.file
 * @returns {Promise<{ filename: string, bytes: number, text: string }>}
 */
const uploadOpenAIVisionOCR = async ({ req, file }) => {
  try {
    logger.info('[Custom OCR] Start processing file:', file.originalname);

    const result = await performVisionOCR({ filePath: file.path });

    logger.info('result.text:', result.text);

    // 假设你的接口返回结果结构如下：
    // { text: "识别出的文字", ... }
    const text = result?.text || JSON.stringify(result);

    return {
      filename: file.originalname,
      bytes: Buffer.byteLength(text, 'utf8'),
      filepath: 'custom_ocr',
      text,
      images: [],
    };
  } catch (error) {
    logger.error(`[Custom OCR] uploadCustomOCR failed: ${error.message}`, error);
    throw new Error(`OCR 识别失败: ${error.message}`);
  }
};

module.exports = {
  performVisionOCR,
  uploadOpenAIVisionOCR,
};
