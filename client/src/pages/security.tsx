
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, QrCode, Key, AlertTriangle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const otpSetupSchema = z.object({
  token: z.string().min(6, "OTP token must be 6 digits").max(6, "OTP token must be 6 digits"),
});

const otpVerifySchema = z.object({
  token: z.string().min(6, "OTP token must be 6 digits").max(6, "OTP token must be 6 digits"),
});

const otpDisableSchema = z.object({
  token: z.string().min(6, "OTP token must be 6 digits").max(6, "OTP token must be 6 digits"),
  password: z.string().optional(),
});

type OTPSetupFormData = z.infer<typeof otpSetupSchema>;
type OTPVerifyFormData = z.infer<typeof otpVerifySchema>;
type OTPDisableFormData = z.infer<typeof otpDisableSchema>;

export default function Security() {
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get OTP status
  const { data: otpStatus } = useQuery({
    queryKey: ["/api/auth/otp/status"],
    retry: false,
  });

  const setupForm = useForm<OTPSetupFormData>({
    resolver: zodResolver(otpSetupSchema),
    defaultValues: { token: "" },
  });

  const verifyForm = useForm<OTPVerifyFormData>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { token: "" },
  });

  const disableForm = useForm<OTPDisableFormData>({
    resolver: zodResolver(otpDisableSchema),
    defaultValues: { token: "", password: "" },
  });

  // Initialize OTP setup
  const initializeMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/otp/setup", "GET"),
    onSuccess: (data) => {
      setSetupData(data);
      setShowSetupDialog(true);
    },
    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to initialize OTP setup",
        variant: "destructive",
      });
    },
  });

  // Complete OTP setup
  const setupMutation = useMutation({
    mutationFn: (data: OTPSetupFormData) => 
      apiRequest("/api/auth/otp/verify-setup", "POST", data),
    onSuccess: () => {
      toast({
        title: "OTP Enabled",
        description: "Two-factor authentication has been enabled successfully",
      });
      setShowSetupDialog(false);
      setSetupData(null);
      setupForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/otp/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP token",
        variant: "destructive",
      });
    },
  });

  // Verify OTP (for testing)
  const verifyMutation = useMutation({
    mutationFn: (data: OTPVerifyFormData) => 
      apiRequest("/api/auth/otp/verify", "POST", data),
    onSuccess: () => {
      toast({
        title: "OTP Verified",
        description: "Your OTP token is valid",
      });
      verifyForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP token",
        variant: "destructive",
      });
    },
  });

  // Disable OTP
  const disableMutation = useMutation({
    mutationFn: (data: OTPDisableFormData) => 
      apiRequest("/api/auth/otp/disable", "POST", data),
    onSuccess: () => {
      toast({
        title: "OTP Disabled",
        description: "Two-factor authentication has been disabled",
      });
      setShowDisableDialog(false);
      disableForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/otp/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Disable failed",
        description: error.message || "Failed to disable OTP",
        variant: "destructive",
      });
    },
  });

  const handleSetupSubmit = (data: OTPSetupFormData) => {
    setupMutation.mutate(data);
  };

  const handleVerifySubmit = (data: OTPVerifyFormData) => {
    verifyMutation.mutate(data);
  };

  const handleDisableSubmit = (data: OTPDisableFormData) => {
    disableMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and authentication methods</p>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account using Google Authenticator or similar apps
                </CardDescription>
              </div>
            </div>
            <Badge variant={otpStatus?.otpEnabled ? "default" : "secondary"}>
              {otpStatus?.otpEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!otpStatus?.otpEnabled ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Enable two-factor authentication to secure your account. You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => initializeMutation.mutate()} 
                disabled={initializeMutation.isPending}
                className="flex items-center space-x-2"
              >
                <QrCode className="h-4 w-4" />
                <span>{initializeMutation.isPending ? "Setting up..." : "Enable 2FA"}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is enabled. Your account is protected with an additional security layer.
                </AlertDescription>
              </Alert>
              
              {/* Test OTP */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Test Your OTP</CardTitle>
                  <CardDescription>Verify that your authenticator app is working correctly</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...verifyForm}>
                    <form onSubmit={verifyForm.handleSubmit(handleVerifySubmit)} className="flex space-x-3">
                      <FormField
                        control={verifyForm.control}
                        name="token"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={verifyMutation.isPending}
                        variant="outline"
                      >
                        {verifyMutation.isPending ? "Verifying..." : "Test"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Button 
                variant="destructive" 
                onClick={() => setShowDisableDialog(true)}
                className="flex items-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Disable 2FA</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Setup Two-Factor Authentication</span>
            </DialogTitle>
          </DialogHeader>
          
          {setupData && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Scan this QR code with your authenticator app
                </p>
                <div className="flex justify-center">
                  <img 
                    src={setupData.qrCode} 
                    alt="QR Code" 
                    className="border rounded-lg"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>Or enter this code manually:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                    {setupData.manualEntryKey}
                  </code>
                </div>
              </div>

              <Form {...setupForm}>
                <form onSubmit={setupForm.handleSubmit(handleSetupSubmit)} className="space-y-4">
                  <FormField
                    control={setupForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter the 6-digit code from your app</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowSetupDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={setupMutation.isPending}
                      className="flex-1"
                    >
                      {setupMutation.isPending ? "Verifying..." : "Enable 2FA"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Disable Two-Factor Authentication</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA will make your account less secure. Make sure you have other security measures in place.
              </AlertDescription>
            </Alert>

            <Form {...disableForm}>
              <form onSubmit={disableForm.handleSubmit(handleDisableSubmit)} className="space-y-4">
                <FormField
                  control={disableForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter current OTP code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (if you have one)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDisableDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={disableMutation.isPending}
                    className="flex-1"
                  >
                    {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
