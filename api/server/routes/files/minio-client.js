const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: 'http://192.168.0.61:9002',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'rag_flow',
    secretAccessKey: 'infini_rag_flow',
  },
  forcePathStyle: true,
});

module.exports = { s3Client };
