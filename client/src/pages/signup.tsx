import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Users, TrendingUp, Star } from "lucide-react";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: Omit<SignupFormData, "confirmPassword">) => {
      return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to BoostBuddies. You can now start boosting your posts.",
      });
      setLocation("/feed");
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...signupData } = data;
      await signupMutation.mutateAsync(signupData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignup = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold">BoostBuddies</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Join the creator revolution</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connect with a community of passionate creators and boost your social media presence organically.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-lg">Connect with 10,000+ creators</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-lg">Boost your social reach organically</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <span className="text-lg">Get authentic engagement</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BoostBuddies
              </span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Join thousands of creators boosting their reach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...form.register("firstName")}
                    data-testid="input-firstname"
                    className={`pl-11 h-12 border-2 transition-all duration-200 ${
                      form.formState.errors.firstName 
                        ? "border-red-400 focus:border-red-500" 
                        : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    }`}
                  />
                </div>
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-firstname">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...form.register("lastName")}
                    data-testid="input-lastname"
                    className={`pl-11 h-12 border-2 transition-all duration-200 ${
                      form.formState.errors.lastName 
                        ? "border-red-400 focus:border-red-500" 
                        : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    }`}
                  />
                </div>
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500 mt-1" data-testid="error-lastname">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...form.register("email")}
                  data-testid="input-email"
                  className={`pl-11 h-12 border-2 transition-all duration-200 ${
                    form.formState.errors.email 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  }`}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1" data-testid="error-email">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...form.register("password")}
                  data-testid="input-password"
                  className={`pl-11 pr-11 h-12 border-2 transition-all duration-200 ${
                    form.formState.errors.password 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1" data-testid="error-password">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...form.register("confirmPassword")}
                  data-testid="input-confirm-password"
                  className={`pl-11 pr-11 h-12 border-2 transition-all duration-200 ${
                    form.formState.errors.confirmPassword 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1" data-testid="error-confirm-password">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <span className="text-gray-600">
                I agree to the{" "}
                <button type="button" className="text-purple-600 hover:text-purple-800 font-medium">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-purple-600 hover:text-purple-800 font-medium">
                  Privacy Policy
                </button>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSubmitting}
              data-testid="button-signup"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" message="Creating account..." />
              ) : (
                "Create Your Account"
              )}
            </Button>
            </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignup("google")}
              data-testid="button-google-signup"
              className="h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium"
            >
              <FaGoogle className="mr-2 h-5 w-5 text-red-500" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignup("twitter")}
              data-testid="button-twitter-signup"
              className="h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium"
            >
              <FaTwitter className="mr-2 h-5 w-5 text-blue-500" />
              Twitter
            </Button>
          </div>

          <div className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
              data-testid="link-login"
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}