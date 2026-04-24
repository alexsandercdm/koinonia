import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, Users } from 'lucide-react'
import { useAuthContext } from '../contexts/auth-context'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, loginLoading } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2d1345] to-[#1b0f23] overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4d0085]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4d0085]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col w-full max-w-[1200px] min-h-screen p-6 md:p-12">
        {/* Header */}
        <header className="flex items-center justify-between w-full mb-12">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#4d0085] rounded-xl text-white">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Koinonia</h2>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-slate-400">
              Novo por aqui?{' '}
              <Link to="/register" className="text-amber-accent font-semibold hover:underline">
                Crie uma conta
              </Link>
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-16 items-center">
            {/* Left side: welcome text */}
            <div className="hidden lg:flex flex-col gap-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-black leading-tight tracking-tight text-white">
                  Gestão com excelência{' '}
                  <br />
                  <span className="text-[#4d0085] bg-amber-accent px-2 rounded-md italic">
                    para o seu retiro
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                  Organize inscrições, logística e espiritualidade em um só lugar. A ferramenta
                  definitiva para comunidades e eventos religiosos.
                </p>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#4d0085]/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900&q=80"
                  alt="Pessoas reunidas em retiro espiritual"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b0f23]/60 to-transparent" />
              </div>
            </div>

            {/* Right side: form */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h3>
                  <p className="text-slate-400">Acesse sua conta para continuar a gestão</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">
                      Endereço de E-mail
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-accent transition-colors" />
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400 ml-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Sua Senha</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-accent transition-colors" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-accent/50 focus:border-amber-accent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400 ml-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-amber-accent hover:bg-yellow-400 text-[#4d0085] font-black py-4 rounded-xl shadow-lg shadow-amber-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'ENTRAR NO PAINEL'
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-sm text-slate-400">
                    Não tem uma conta?{' '}
                    <Link
                      to="/register"
                      className="text-amber-accent font-semibold hover:underline"
                    >
                      Crie uma conta
                    </Link>
                  </p>
                </div>
              </div>

              <footer className="mt-8 text-center text-slate-500 text-xs">
                © 2024 Koinonia Sistemas. Todos os direitos reservados.
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
