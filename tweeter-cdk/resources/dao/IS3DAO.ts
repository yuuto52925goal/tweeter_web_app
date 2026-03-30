export interface IS3DAO {
  /** Upload a base64-encoded image and return its public URL. */
  putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;
}
