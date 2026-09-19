import SparkMD5 from 'spark-md5'

// 分片大小：2MB，避免单次 FileReader 占用过大内存
const CHUNK_SIZE = 2 * 1024 * 1024

/**
 * 分片流式计算文件 MD5（spark-md5），大文件不阻塞主线程。
 * @param onProgress 可选进度回调 (loadedBytes, totalBytes)
 */
export function computeFileMd5(
  file: File,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    let offset = 0

    reader.onerror = () => reject(reader.error || new Error('文件读取失败'))
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        spark.append(reader.result)
      }
      offset += CHUNK_SIZE
      onProgress?.(Math.min(offset, file.size), file.size)
      if (offset < file.size) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    const loadNext = () => {
      const blob = file.slice(offset, offset + CHUNK_SIZE)
      reader.readAsArrayBuffer(blob)
    }
    loadNext()
  })
}
