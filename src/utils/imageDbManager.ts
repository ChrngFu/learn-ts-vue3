// IndexedDB图片管理工具类

// 图片对象接口定义
export interface ImageItem {
  id: string;
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
  createdAt: number;
}

class ImageDbManager {
  private dbName = 'imageGalleryDB';
  private dbVersion = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // 初始化数据库连接
    this.initPromise = this.initializeDB();
  }

  /**
   * 初始化数据库
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('浏览器不支持IndexedDB'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建存储对象
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: false
          });
          
          // 创建索引以支持按创建时间排序
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
  }

  /**
   * 添加图片到数据库
   */
  async addImage(file: File): Promise<string> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const imageId = crypto.randomUUID();
          const imageItem: ImageItem = {
            id: imageId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: arrayBuffer,
            createdAt: Date.now()
          };

          const transaction = this.db!.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.add(imageItem);

          request.onsuccess = () => resolve(imageId);
          request.onerror = () => reject(request.error);
          transaction.onerror = () => reject(transaction.error);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 获取所有图片
   */
  async getAllImages(): Promise<ImageItem[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('createdAt');
      const request = index.getAll(null); // 获取所有记录

      request.onsuccess = () => {
        // 按创建时间降序排列（最新的在前）
        const images = request.result.reverse();
        resolve(images);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除图片
   */
  async deleteImage(id: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清空所有图片
   */
  async clearAllImages(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 将ArrayBuffer转换为Data URL
   */
  arrayBufferToDataUrl(arrayBuffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    const base64 = window.btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  }
}

// 导出单例实例
const imageDbManager = new ImageDbManager();
export default imageDbManager;