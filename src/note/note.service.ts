import { Injectable } from '@nestjs/common';
import { SecretKey, AccessKey, BucketName } from 'src/constant';
import * as qiniu from 'qiniu';

@Injectable()
export class NoteService {
  getUploadToken() {
    const mac = new qiniu.auth.digest.Mac(AccessKey, SecretKey);
    const options: qiniu.rs.PutPolicyOptions = {
      scope: BucketName,
      expires: 600,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const token = putPolicy.uploadToken(mac);
    return {
      token,
    };
  }
}
