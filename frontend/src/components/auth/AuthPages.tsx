import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Shield, Key, Mail, Lock, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Input } from '../ui/Primitives';

// ==================== LOGIN VIEW ====================
export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Preset for demo
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !selectedRole) {
      error("Please fill in the fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const emailValue = email || `${selectedRole.toLowerCase().replace(/\s+/g, '')}@transitops.com`;
      await login(emailValue, selectedRole, rememberMe);
      success(`Welcome back! Logged in as ${selectedRole}`);
      navigate(from, { replace: true });
    } catch (err) {
      error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoRoles: { role: UserRole; desc: string }[] = [
    { role: 'Super Admin', desc: 'Full System Control' },
    { role: 'Fleet Manager', desc: 'Vehicles, Maintenance, Logs' },
    { role: 'Dispatcher', desc: 'Trips, Drivers, Dispatches' },
    { role: 'Driver', desc: 'Personal Route & Details' },
    { role: 'Safety Officer', desc: 'Compliance & Scores' },
    { role: 'Financial Analyst', desc: 'ROI, Costs & Auditing' }
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-slate-950 font-sans text-slate-100 overflow-y-auto">
      {/* Visual side panel - premium SaaS branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-950 flex items-center justify-center font-bold text-xl">
            T
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-50">TransitOps</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg my-auto">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Enterprise Fleet & Logistics, Automated.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            A secure, role-based platform designed to scale transportation operations, monitor driver safety, track vehicle maintenance, and maximize asset ROI.
          </p>
          
          <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-550">
            <span>Production Prototype v1.0.0</span>
            <span>Local DB Active</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          &copy; {new Date().getFullYear()} TransitOps Platform. All rights reserved.
        </div>
      </div>

      {/* Main Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-slate-900 bg-zinc-950/70 shadow-premium-lg">
            <CardHeader className="border-b-0 pb-2">
              <CardTitle className="text-2xl text-white font-bold tracking-tight">Access TransitOps</CardTitle>
              <CardDescription className="text-slate-400">
                Log in to your sandbox environment using role-based routing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Sandbox Role Quick Selector (Demo Mode) */}
                <div className="border border-slate-900 bg-zinc-900/40 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert size={10} />
                    <span>Role Selector Sandbox</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {demoRoles.map(item => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(item.role);
                          setEmail(`${item.role.toLowerCase().replace(/\s+/g, '')}@transitops.com`);
                        }}
                        className={`text-left p-2 rounded-lg text-xs transition border ${
                          selectedRole === item.role
                            ? 'bg-slate-50 border-white text-slate-950 font-bold'
                            : 'bg-zinc-900 border-slate-850 hover:bg-zinc-800 text-slate-400'
                        }`}
                      >
                        <span className="block font-medium truncate">{item.role}</span>
                        <span className={`block text-[9px] truncate ${selectedRole === item.role ? 'text-slate-600' : 'text-slate-500'}`}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <Input
                      type="email"
                      required
                      placeholder="e.g. admin@transitops.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-zinc-900 border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Security Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-zinc-900 border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-zinc-900 border-slate-800 text-slate-50 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                    Remember my credentials
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center font-bold"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
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
      success("Instructions sent successfully!");
      setIsSent(true);
    } catch {
      error("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-955 p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-900 bg-zinc-950/70 shadow-premium-lg">
          <CardHeader className="border-b-0">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-slate-800 flex items-center justify-center mb-4">
              <Key size={18} className="text-amber-500" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">Reset Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email to receive temporary security authorization coordinates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="space-y-4 text-center">
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-emerald-400 flex flex-col items-center">
                  <CheckCircle2 size={36} className="mb-2" />
                  <p className="text-xs font-semibold">Security Instructions Dispatched</p>
                  <p className="text-[10px] text-emerald-500 mt-1 leading-relaxed">
                    Check your sandbox console or inbox for verification coordinates.
                  </p>
                </div>
                <Link to="/reset-password">
                  <Button className="w-full mt-4">Proceed to Reset Screen</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-350">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                    <Input
                      type="email"
                      required
                      placeholder="driver@transitops.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-zinc-900 border-slate-800 text-white"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Dispatching..." : "Send Reset Code"}
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
      await resetPassword(email, code);
      success("Password updated successfully!");
      navigate('/login');
    } catch {
      error("Reset failed. Invalid code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-955 p-6 text-slate-105 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-900 bg-zinc-950/70 shadow-premium-lg">
          <CardHeader className="border-b-0">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-slate-800 flex items-center justify-center mb-4">
              <Shield size={18} className="text-violet-500" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">Create New Password</CardTitle>
            <CardDescription className="text-slate-400">
              Input verification credentials to reset your account key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-350">Work Email</label>
                <Input
                  type="email"
                  required
                  placeholder="admin@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-350">Verification Code</label>
                <Input
                  type="text"
                  required
                  placeholder="Verify 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-zinc-900 border-slate-800 text-white text-center tracking-widest font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-350">New Password</label>
                <Input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-900 border-slate-800 text-white"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Resetting Key..." : "Authorize Password Update"}
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
