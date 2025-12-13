export interface IStorageProvider {
    /**
     * Uploads a buffer to storage. Returns the public access path/URL.
     */
    upload(file: Buffer, fileName: string, mimeType: string): Promise<string>;

    /**
     * Permanently deletes the file from storage.
     */
    delete(path: string): Promise<void>;
}
