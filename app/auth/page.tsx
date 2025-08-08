'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { signIn, signUp } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin')

  // 表单校验 schema
  const signInSchema = z.object({
    email: z.string().email('请输入有效邮箱'),
    password: z.string().min(6, '密码至少6位')
  })

  const signUpSchema = z.object({
    email: z.string().email('请输入有效邮箱'),
    username: z.string().min(2, '用户名至少2位'),
    password: z.string().min(6, '密码至少6位'),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })

  type SignInFormValues = z.infer<typeof signInSchema>
  type SignUpFormValues = z.infer<typeof signUpSchema>

  const signInFormMethods = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  })

  const signUpFormMethods = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', username: '', confirmPassword: '' }
  })

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSignIn = signInFormMethods.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await signIn(values.email, values.password)
      toast.success('登录成功')
      router.push('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  })

  const handleSignUp = signUpFormMethods.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await signUp(values.email, values.password, values.username)
      toast.success('注册成功，请登录')
      setActiveTab('signin')
      signUpFormMethods.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  })

  if (isAuthenticated) {
    return null // 避免闪烁
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              欢迎使用 PromptHub
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              发现和分享优质 AI 提示词
            </p>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">登录</TabsTrigger>
                <TabsTrigger value="signup">注册</TabsTrigger>
              </TabsList>

              {/* 登录表单 */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        {...signInFormMethods.register('email')}
                      />
                    </div>
                    {signInFormMethods.formState.errors.email && (
                      <p className="text-sm text-red-600">{signInFormMethods.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入密码"
                        className="pl-10 pr-10"
                        {...signInFormMethods.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signInFormMethods.formState.errors.password && (
                      <p className="text-sm text-red-600">{signInFormMethods.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>

              {/* 注册表单 */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="请输入用户名"
                        className="pl-10"
                        {...signUpFormMethods.register('username')}
                      />
                    </div>
                    {signUpFormMethods.formState.errors.username && (
                      <p className="text-sm text-red-600">{signUpFormMethods.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        {...signUpFormMethods.register('email')}
                      />
                    </div>
                    {signUpFormMethods.formState.errors.email && (
                      <p className="text-sm text-red-600">{signUpFormMethods.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入密码（至少6位）"
                        className="pl-10 pr-10"
                        {...signUpFormMethods.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signUpFormMethods.formState.errors.password && (
                      <p className="text-sm text-red-600">{signUpFormMethods.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="请再次输入密码"
                        className="pl-10"
                        {...signUpFormMethods.register('confirmPassword')}
                      />
                    </div>
                    {signUpFormMethods.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{signUpFormMethods.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}