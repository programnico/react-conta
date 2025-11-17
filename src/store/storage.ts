// store/storage.ts
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null)
    },
    setItem() {
      return Promise.resolve()
    },
    removeItem() {
      return Promise.resolve()
    }
  }
}

// Create storage that works on both client and server
const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

export default storage
