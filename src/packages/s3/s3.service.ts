// import { HttpService } from '@nestjs/axios';
// import {
//     BadRequestException,
//     Inject,
//     Injectable,
//     Logger,
//     Provider,
// } from '@nestjs/common';
// import {
//     S3Client,
//     PutObjectCommand,
//     DeleteObjectCommand,
// } from '@aws-sdk/client-s3';
// import { appSettings } from 'src/configs/app-settings';

// export const S3ServiceLib = 'lib:s3';

// export interface IUploadedMulterFile {
//     fieldName: string;
//     originalname: string;
//     encoding: string;
//     mimetype: string;
//     buffer: Buffer;
//     size: number;
// }

// const s3Client = new S3Client({
//     credentials: {
//         accessKeyId: appSettings.s3.accessKey,
//         secretAccessKey: appSettings.s3.secretKey,
//     },
//     region: appSettings.s3.region,
// });

// export const S3ServiceProvider: Provider<S3Client> = {
//     provide: S3ServiceLib,
//     useValue: s3Client,
// };

// @Injectable()
// export class S3Service {
//     private readonly logger = new Logger('S3Service');
//     constructor(
//         @Inject(S3ServiceLib) private readonly s3: S3Client,
//         private readonly httpService: HttpService,
//     ) {}

//     private returnKey(folder: string, originalname: string) {
//         return (
//             `${appSettings.s3.bucket}/` +
//             folder +
//             `/${Date.now().toString()}-${originalname}`
//         );
//     }

//     private returnUrl(key: string) {
//         return `https://${appSettings.s3.bucket}.s3.amazonaws.com/${key}`;
//     }

//     async uploadPublicFile(file: IUploadedMulterFile, folder: string) {
//         try {
//             const { buffer, originalname, mimetype } = file;
//             const key = this.returnKey(folder, originalname);

//             const command = new PutObjectCommand({
//                 Bucket: `${appSettings.s3.bucket}`,
//                 Body: buffer,
//                 Key: key,
//                 ACL: 'public-read',
//                 ContentType: mimetype,
//             });
//             await this.s3.send(command);

//             return {
//                 key: key,
//                 url: this.returnUrl(key),
//                 mimetype: mimetype,
//             };
//         } catch (error) {
//             this.logger.error(error);
//             throw new BadRequestException(error.message);
//         }
//     }

//     async deletePublicFile(fileName: string, folder: string) {
//         try {
//             const command = new DeleteObjectCommand({
//                 Bucket: `${appSettings.s3.bucket}/` + folder,
//                 Key: fileName,
//             });
//             const deleteResult = await this.s3.send(command);

//             return deleteResult;
//         } catch (error) {
//             this.logger.error(error);
//             throw new BadRequestException(error.message);
//         }
//     }

//     async uploadFileByUrl(url: string, folder: string, fileName: string) {
//         try {
//             const response = await this.httpService.axiosRef.get(url, {
//                 responseType: 'arraybuffer',
//             });
//             const key = this.returnKey(folder, fileName);
//             const buffer = Buffer.from(response.data, 'binary');
//             const mimetype = response.headers['content-type'];

//             const command = new PutObjectCommand({
//                 Bucket: `${appSettings.s3.bucket}/` + folder,
//                 Body: buffer,
//                 Key: key,
//                 ACL: 'public-read',
//                 ContentType: mimetype,
//             });

//             await this.s3.send(command);

//             return {
//                 key: key,
//                 url: this.returnUrl(key),
//                 mimetype: mimetype,
//             };
//         } catch (error) {
//             return {
//                 key: '',
//                 url: '',
//                 mimetype: '',
//             };
//         }
//     }
// }
