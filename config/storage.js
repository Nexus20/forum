const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer')
const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;

const dotenv = require('dotenv');
dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const resolveBlobName = (req, file) => {
    return new Promise((resolve, reject) => {
        const blobName = `${Date.now()}`;
        resolve(blobName);
    });
};

const azureStorage = new MulterAzureStorage({
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    accessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    blobName: resolveBlobName,
    containerAccessLevel: 'blob',
});

const upload = multer({ storage: azureStorage });

module.exports = { upload, blobServiceClient };