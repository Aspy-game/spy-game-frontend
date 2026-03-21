export const isMock = import.meta.env.VITE_DATA_SOURCE === 'mock';

/**
 * Giả lập độ trễ mạng từ 300ms đến 800ms cho Mock data.
 */
export const withDelay = <T>(data: T): Promise<T> => {
  if (!isMock) return Promise.resolve(data);
  
  const delay = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Wrapper để switch giữa Mock và API thật.
 */
export const serviceWrapper = async <T>(
  apiCall: () => Promise<T>,
  mockData: T
): Promise<T> => {
  if (isMock) {
    return withDelay(mockData);
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.error('[Service Error]:', error);
    // Có thể ném lỗi ra ngoài để component handle hoặc return fallback
    throw error;
  }
};
