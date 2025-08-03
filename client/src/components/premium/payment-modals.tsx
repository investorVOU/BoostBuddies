import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Copy, CreditCard, Smartphone, Bitcoin, Check } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: "monthly" | "yearly";
  amount: number;
}

export function PaymentModal({ isOpen, onClose, plan, amount }: PaymentModalProps) {
  const { toast } = useToast();
  const [selectedGateway, setSelectedGateway] = useState<"flutterwave" | "paystack" | "crypto">("flutterwave");
  const [paymentStep, setPaymentStep] = useState<"select" | "processing" | "success">("select");
  
  // Payment processing mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest("/api/premium/payments", {
        method: "POST",
        body: JSON.stringify(paymentData),
      });
    },
    onSuccess: async () => {
      // Create subscription after successful payment
      await subscriptionMutation.mutateAsync({ plan });
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error.message || "Payment processing failed. Please try again.",
        variant: "destructive",
      });
      setPaymentStep("select");
    },
  });

  // Subscription creation mutation
  const subscriptionMutation = useMutation({
    mutationFn: async (data: { plan: string }) => {
      return apiRequest("/api/premium/subscribe", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setPaymentStep("success");
      queryClient.invalidateQueries({ queryKey: ["/api/premium/subscription"] });
      toast({
        title: "Welcome to Premium!",
        description: "Your subscription has been activated successfully.",
      });
    },
  });

  // Get crypto addresses
  const { data: cryptoAddresses } = useQuery({
    queryKey: ["/api/crypto/addresses"],
    enabled: selectedGateway === "crypto",
  });

  const handleFlutterwavePayment = async () => {
    setPaymentStep("processing");
    
    try {
      // Generate unique transaction reference
      const transactionRef = `BB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record
      await processPaymentMutation.mutateAsync({
        gateway: "flutterwave",
        transactionId: transactionRef,
        amount: amount * 100, // Convert to cents
        currency: "USD",
      });
      
      // In a real implementation, you would redirect to Flutterwave
      // For demo purposes, we'll simulate success after a delay
      setTimeout(() => {
        setPaymentStep("success");
      }, 2000);
    } catch (error) {
      console.error("Flutterwave payment error:", error);
    }
  };

  const handlePaystackPayment = async () => {
    setPaymentStep("processing");
    
    try {
      // Generate unique transaction reference
      const transactionRef = `BB_PS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record
      await processPaymentMutation.mutateAsync({
        gateway: "paystack",
        transactionId: transactionRef,
        amount: amount * 100, // Convert to cents
        currency: "USD",
      });
      
      // In a real implementation, you would redirect to Paystack
      // For demo purposes, we'll simulate success after a delay
      setTimeout(() => {
        setPaymentStep("success");
      }, 2000);
    } catch (error) {
      console.error("Paystack payment error:", error);
    }
  };

  const handleCryptoPayment = async (cryptoType: string) => {
    setPaymentStep("processing");
    
    try {
      // Generate unique transaction reference
      const transactionRef = `BB_CRYPTO_${cryptoType.toUpperCase()}_${Date.now()}`;
      
      // Create payment record
      await processPaymentMutation.mutateAsync({
        gateway: "crypto",
        cryptoType,
        transactionId: transactionRef,
        amount: amount * 100, // Convert to cents
        currency: "USD",
      });
      
      // In a real implementation, you would wait for blockchain confirmation
      // For demo purposes, we'll simulate success after a delay
      setTimeout(() => {
        setPaymentStep("success");
      }, 3000);
    } catch (error) {
      console.error("Crypto payment error:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard.",
    });
  };

  const resetModal = () => {
    setPaymentStep("select");
    setSelectedGateway("flutterwave");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Premium Subscription
          </DialogTitle>
          <DialogDescription>
            Upgrade to Premium {plan} plan for ${amount}/{plan === "monthly" ? "month" : "year"}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "select" && (
          <Tabs value={selectedGateway} onValueChange={(value) => setSelectedGateway(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flutterwave" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Flutterwave
              </TabsTrigger>
              <TabsTrigger value="paystack" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Paystack
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flutterwave" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Pay with Flutterwave
                  </CardTitle>
                  <CardDescription>
                    Secure payment processing with support for cards, bank transfers, and mobile money
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Premium {plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        Full access to all premium features
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      ${amount}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleFlutterwavePayment}
                    className="w-full"
                    size="lg"
                    data-testid="button-flutterwave-pay"
                  >
                    Pay ${amount} with Flutterwave
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be redirected to Flutterwave to complete your payment securely
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paystack" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    Pay with Paystack
                  </CardTitle>
                  <CardDescription>
                    Fast and reliable payment processing for African markets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Premium {plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        Full access to all premium features
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      ${amount}
                    </Badge>
                  </div>
                  <Button
                    onClick={handlePaystackPayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    data-testid="button-paystack-pay"
                  >
                    Pay ${amount} with Paystack
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be redirected to Paystack to complete your payment securely
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                    Pay with Cryptocurrency
                  </CardTitle>
                  <CardDescription>
                    Send payment directly to our crypto wallets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Premium {plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        Full access to all premium features
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      ${amount}
                    </Badge>
                  </div>

                  {cryptoAddresses && cryptoAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {cryptoAddresses.map((address: any) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-medium text-sm uppercase">
                              {address.cryptoType} Address
                            </Label>
                            <Badge variant="outline">{address.cryptoType.toUpperCase()}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={address.address}
                              readOnly
                              className="font-mono text-sm"
                              data-testid={`input-${address.cryptoType}-address`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(address.address)}
                              data-testid={`button-copy-${address.cryptoType}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            onClick={() => handleCryptoPayment(address.cryptoType)}
                            className="w-full mt-3"
                            variant="outline"
                            data-testid={`button-pay-${address.cryptoType}`}
                          >
                            I've sent ${amount} in {address.cryptoType.toUpperCase()}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading crypto addresses...</p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Please send the exact amount of ${amount} USD equivalent. 
                      Your subscription will be activated once we confirm the transaction on the blockchain.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {paymentStep === "processing" && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-semibold mt-4">Processing Payment</h3>
            <p className="text-muted-foreground">
              {selectedGateway === "crypto" 
                ? "Waiting for blockchain confirmation..." 
                : "Please complete your payment in the redirected window..."}
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Welcome to BoostBuddies Premium! Your subscription has been activated.
            </p>
            <Button onClick={resetModal} className="w-full" data-testid="button-close-success">
              Start Using Premium Features
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}