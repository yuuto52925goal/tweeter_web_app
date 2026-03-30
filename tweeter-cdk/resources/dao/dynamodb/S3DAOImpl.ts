import { PutObjectCommand, ObjectCannedACL, S3Client } from "@aws-sdk/client-s3";
import { IS3DAO } from "../IS3DAO";

const BUCKET = process.env.IMAGE_BUCKET!;
const REGION = process.env.AWS_REGION!;

export class S3DAOImpl implements IS3DAO {
  async putImage(fileName: string, imageStringBase64Encoded: string): Promise<string> {
    const decodedImageBuffer = Buffer.from(imageStringBase64Encoded, "base64");
    const client = new S3Client({ region: REGION });
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: "image/" + fileName,
        Body: decodedImageBuffer,
        ContentType: "image/png",
        ACL: ObjectCannedACL.public_read,
      })
    );
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`;
  }
}
