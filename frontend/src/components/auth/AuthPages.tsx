import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Shield, Key, Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Input } from '../ui/Primitives';

// ==================== LOGIN VIEW ====================
export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-slate-950 font-sans text-slate-100 overflow-y-auto">
      {/* Visual side panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-950 flex items-center justify-center font-bold text-xl">
            T
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-50">TransitOps</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg my-auto">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Enterprise Fleet &amp; Logistics, Automated.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            A secure, role-based platform designed to scale transportation operations, monitor driver safety, track vehicle maintenance, and maximize asset ROI.
          </p>

          {/* Credential hints for demo */}
          <div className="mt-4 border border-slate-800 rounded-xl p-4 bg-slate-900/40 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Demo Accounts</p>
            {[
              { label: 'Super Admin', email: 'admin@transitops.com', pw: 'Admin@1234' },
              { label: 'Fleet Manager', email: 'fleetmanager@transitops.com', pw: 'Test@1234' },
              { label: 'Dispatcher', email: 'dispatcher@transitops.com', pw: 'Test@1234' },
              { label: 'Driver', email: 'driver@transitops.com', pw: 'Test@1234' },
              { label: 'Safety Officer', email: 'safetyofficer@transitops.com', pw: 'Test@1234' },
              { label: 'Financial Analyst', email: 'analyst@transitops.com', pw: 'Test@1234' },
            ].map((item) => (
              <button
                key={item.email}
                type="button"
                onClick={() => { setEmail(item.email); setPassword(item.pw); }}
                className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-xs group"
              >
                <span className="font-semibold text-slate-300 group-hover:text-white">{item.label}</span>
                <span className="text-slate-500 font-mono group-hover:text-slate-400">{item.email}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
            <span>TransitOps v1.0.0</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          &copy; {new Date().getFullYear()} TransitOps Platform. All rights reserved.
        </div>
      </div>

      {/* Main Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center space-x-3 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-950 flex items-center justify-center font-bold text-xl">T</div>
            <span className="font-bold text-lg tracking-tight text-slate-50">TransitOps</span>
          </div>

          <Card className="border-slate-800 bg-zinc-950/70 shadow-2xl">
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-2xl text-white font-bold tracking-tight">Sign In</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your credentials to access the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <Input
                      type="email"
                      required
                      placeholder="admin@transitops.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-zinc-900 border-slate-700 text-white placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-zinc-900 border-slate-700 text-white placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-zinc-900 border-slate-700 text-slate-50 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                    Remember me for 7 days
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center font-bold"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==================== FORGOT PASSWORD VIEW ====================
export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      success('Reset code sent! Check your email.');
      setIsSent(true);
    } catch (err: any) {
      error(err?.message || 'Request failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-800 bg-zinc-950/70 shadow-2xl">
          <CardHeader className="border-b-0">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-slate-800 flex items-center justify-center mb-4">
              <Key size={18} className="text-amber-500" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">Reset Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your work email to receive a 6-digit reset code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="space-y-4 text-center">
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-emerald-400 flex flex-col items-center">
                  <CheckCircle2 size={36} className="mb-2" />
                  <p className="text-sm font-semibold">Reset Code Sent!</p>
                  <p className="text-xs text-emerald-500 mt-1 leading-relaxed">
                    Check your inbox for the 6-digit verification code.
                  </p>
                </div>
                <Link to="/reset-password">
                  <Button className="w-full mt-4">Enter Reset Code</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <Input
                      type="email"
                      required
                      placeholder="driver@transitops.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-zinc-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-slate-900/50 bg-zinc-900/10 rounded-b-xl pt-4">
            <Link to="/login" className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft size={12} />
              <span>Back to Login</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// ==================== RESET PASSWORD VIEW ====================
export const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) return;

    setIsSubmitting(true);
    try {
      await resetPassword(email, code, newPassword);
      success('Password updated successfully!');
      navigate('/login');
    } catch (err: any) {
      error(err?.message || 'Reset failed. Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-800 bg-zinc-950/70 shadow-2xl">
          <CardHeader className="border-b-0">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-slate-800 flex items-center justify-center mb-4">
              <Shield size={18} className="text-violet-500" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">Create New Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter the code from your email and choose a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Work Email</label>
                <Input
                  type="email"
                  required
                  placeholder="admin@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">6-Digit Reset Code</label>
                <Input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-zinc-900 border-slate-700 text-white text-center tracking-widest font-mono font-bold text-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <Input
                  type="password"
                  required
                  placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 special"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-900 border-slate-700 text-white"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-slate-900/50 bg-zinc-900/10 rounded-b-xl pt-4">
            <Link to="/login" className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft size={12} />
              <span>Back to Login</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
