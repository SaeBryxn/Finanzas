import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ email: string } | null>(null)
  const isAuthenticated = ref(false)

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const response = await api.get('/users')
      const foundUser = response.data.find((u: any) => 
        u.email === email && password === 'demo'
      )
      
      if (foundUser) {
        user.value = { email: foundUser.email }
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
  }

  function initAuth() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    initAuth
  }
})