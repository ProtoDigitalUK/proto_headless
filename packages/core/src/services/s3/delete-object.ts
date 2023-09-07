import { DeleteObjectCommand } from "@aws-sdk/client-s3";
// Utils
import getS3Client from "@utils/app/s3-client.js";
// Services
import Config from "@services/Config.js";

export interface ServiceData {
  key: string;
}

const deleteObject = async (data: ServiceData) => {
  const S3 = await getS3Client;

  const command = new DeleteObjectCommand({
    Bucket: Config.media.store.bucket,
    Key: data.key,
  });

  return S3.send(command);
};

export default deleteObject;