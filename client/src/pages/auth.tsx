import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Chrome, Twitter, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: LoginFormData | RegisterFormData) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest(endpoint, "POST", data);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You have been logged in successfully." : "Your account has been created and you are now logged in.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: any) => {
      let errorMessage = "An unexpected error occurred.";
      if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleTwitterLogin = () => {
    window.location.href = "/api/auth/twitter";
  };

  const onLoginSubmit = (data: LoginFormData) => {
    authMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    authMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <Card className="w-full max-w-md glass-card shadow-2xl border-0 relative z-10 animate-fade-in-up">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-lg animate-fade-in-up-delay">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold font-display gradient-text">
              BoostBuddies
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium text-lg">
              {isLogin ? "Welcome back! Sign in to your account" : "Create your account and join thousands of creators"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          {/* Social Login Buttons */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-14 border-2 hover:bg-red-50 hover:border-red-300 transition-all duration-300 font-heading font-medium text-base btn-glow group rounded-xl"
              onClick={handleGoogleLogin}
            >
              <Chrome className="mr-3 h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 font-heading font-medium text-base btn-glow group rounded-xl"
              onClick={handleTwitterLogin}
            >
              <Twitter className="mr-3 h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>Continue with Twitter</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-6 text-gray-500 font-heading font-medium tracking-wide">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-heading font-medium text-sm tracking-wide">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="h-14 border-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 font-medium text-base rounded-xl"
                          autoComplete="email"
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-heading font-medium text-sm tracking-wide">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-14 border-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 font-medium text-base rounded-xl pr-14"
                            autoComplete="current-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 gradient-primary hover:opacity-90 text-white font-heading font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl btn-glow"
                  disabled={authMutation.isPending}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {authMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-heading font-medium text-sm tracking-wide">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John" 
                            className="h-14 border-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 font-medium text-base rounded-xl"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-heading font-medium text-sm tracking-wide">Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Doe" 
                            className="h-14 border-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 font-medium text-base rounded-xl"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-heading font-medium text-sm tracking-wide">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="h-14 border-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 font-medium text-base rounded-xl"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-heading font-medium text-sm tracking-wide">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="h-14 border-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 font-medium text-base rounded-xl pr-14"
                            autoComplete="new-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 gradient-primary hover:opacity-90 text-white font-heading font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl btn-glow"
                  disabled={authMutation.isPending}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {authMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-indigo-600 font-heading font-medium text-base transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </Button>
          </div>

          {isLogin && (
            <div className="text-center">
              <Button variant="link" className="text-gray-500 hover:text-indigo-600 text-sm font-heading transition-colors">
                Forgot your password?
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}