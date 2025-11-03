import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../contexts/AppContext';
import { demoCredentials } from '../lib/mockData';
import { Building2, AlertCircle, Sparkles, Shield, Users } from 'lucide-react';

export const LoginPage = () => {
  const { setCurrentUser, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check credentials
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (user && (user.password ? user.password === password : password === demoCredentials.citizen.password)) {
      setCurrentUser(user);
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const quickLogin = async (role: 'citizen' | 'staff' | 'admin') => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = users.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  };

  const features = [
    { icon: Users, title: 'For Citizens', desc: 'Report issues with photos & location' },
    { icon: Shield, title: 'Auto-Assignment', desc: 'Staff receive issues by department' },
    { icon: Sparkles, title: 'Track Progress', desc: 'Real-time updates & analytics' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Left side - Branding */}
        <motion.div
          className="hidden md:flex flex-col justify-center space-y-6 p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Civic Reporter
              </h1>
              <p className="text-muted-foreground">Municipal Issue Management</p>
            </div>
          </motion.div>

          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Empowering citizens to report local issues and enabling municipal staff to resolve them efficiently.
          </motion.p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your account
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleLogin}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02] border-2"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02] border-2"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.form>

              {/* Demo Credentials */}
              <motion.div
                className="mt-6 pt-6 border-t space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-center text-muted-foreground">Quick Demo Login</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'citizen' as const, label: 'Citizen', gradient: 'from-blue-500 to-blue-600' },
                    { role: 'staff' as const, label: 'Staff', gradient: 'from-purple-500 to-purple-600' },
                    { role: 'admin' as const, label: 'Admin', gradient: 'from-indigo-500 to-indigo-600' },
                  ].map((demo, index) => (
                    <motion.div
                      key={demo.role}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => quickLogin(demo.role)}
                        disabled={isLoading}
                        className={`w-full bg-gradient-to-r ${demo.gradient} text-white border-0 hover:opacity-90`}
                      >
                        {demo.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  All demo accounts use password: <span className="font-mono bg-muted px-2 py-1 rounded">demo123</span>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
