// store/storage.ts
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null)
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value)
    },
    removeItem(_key: string) {
      return Promise.resolve()
    }
  }
}

// Create storage that works on both client and server
const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

export default storage
