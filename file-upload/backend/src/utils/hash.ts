import crypto from 'crypto';

export const calculateFileHash = async (file: Buffer | string, algorithm: string = 'sha256'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);

    if (typeof file === 'string') {
      // File path
      const fs = require('fs');
      const stream = fs.createReadStream(file);

      stream.on('data', (chunk: Buffer) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    } else {
      // Buffer
      hash.update(file);
      resolve(hash.digest('hex'));
    }
  });
};

export const calculateHash = (data: string | Buffer, algorithm: string = 'sha256'): string => {
  const hash = crypto.createHash(algorithm);
  hash.update(data);
  return hash.digest('hex');
};