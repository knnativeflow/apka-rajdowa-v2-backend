import {DeleteObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {config} from 'config/config';

const client = new S3Client({
    region: 'eu-central-1',
    credentials: {accessKeyId: config.awsAccessKey, secretAccessKey: config.awsSecretKey}
})

export const uploadPublicFile = async (key: string, buffer: Buffer, contentType: string): Promise<void> => {
    const command = new PutObjectCommand({
        Bucket: "apka-rajdowa-prod",
        Key: key,
        Body: buffer,
        ACL: 'public-read',
        ContentType: contentType,
    })
    await client.send(command);
}

export const removeFile = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: "apka-rajdowa-prod",
        Key: key,
    })
    await client.send(command);
}