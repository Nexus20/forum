const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer')
const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;

const connectionString = `DefaultEndpointsProtocol=https;AccountName=appstore2508;AccountKey=wP7USEVVDC/wc2jlXsKzlqW3y49/vM38jzrdlGqvBNpzst+gABXGk/68IxJXZ2Rjqzv4sMksK3de+ASt6EYlMg==;EndpointSuffix=core.windows.net`;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const resolveBlobName = (req, file) => {
    return new Promise((resolve, reject) => {
        const blobName = `${Date.now()}`;
        resolve(blobName);
    });
};

const azureStorage = new MulterAzureStorage({
    connectionString: connectionString,
    accessKey: 'wP7USEVVDC/wc2jlXsKzlqW3y49/vM38jzrdlGqvBNpzst+gABXGk/68IxJXZ2Rjqzv4sMksK3de+ASt6EYlMg==',
    accountName: 'appstore2508',
    containerName: 'attachments',
    blobName: resolveBlobName,
    containerAccessLevel: 'blob',
});

const upload = multer({ storage: azureStorage });

module.exports = { upload, blobServiceClient };