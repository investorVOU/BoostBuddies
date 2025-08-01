
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Star, Zap, Shield, TrendingUp, Infinity, Check, X, Copy } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const paymentSchema = z.object({
  gateway: z.enum(["flutterwave", "paystack", "crypto"]),
  cryptoType: z.string().optional(),
  transactionId: z.string().min(1, "Transaction ID is required"),
  amount: z.number().min(1, "Amount is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [cryptoAddresses, setCryptoAddresses] = useState<any>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      gateway: "flutterwave",
      cryptoType: "",
      transactionId: "",
      amount: 0,
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const response = await apiRequest("/api/premium/payment", "POST", JSON.stringify(data));
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted!",
        description: "Your payment is being processed. You'll receive confirmation shortly.",
      });
      setShowPaymentDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const plans = {
    monthly: { price: "$2", nairaPrice: "₦3,000", period: "month" },
    yearly: { price: "$20", nairaPrice: "₦30,000", period: "year", savings: "Save 17%" }
  };

  const features = [
    { title: "Ad-Free Experience", description: "No ads while browsing", icon: Shield, premium: true },
    { title: "Instant Post Approval", description: "No need to like posts for approval", icon: Zap, premium: true },
    { title: "Enhanced Reach", description: "5x more visibility for your posts", icon: TrendingUp, premium: true },
    { title: "Priority Support", description: "24/7 dedicated support", icon: Star, premium: true },
    { title: "Advanced Analytics", description: "Detailed performance insights", icon: TrendingUp, premium: true },
    { title: "Unlimited Submissions", description: "No daily post limits", icon: Infinity, premium: true },
    { title: "Basic Features", description: "Standard engagement tools", icon: Check, premium: false },
  ];

  const cryptoOptions = [
    { value: "btc", label: "Bitcoin (BTC)", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
    { value: "eth", label: "Ethereum (ETH)", address: "0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2" },
    { value: "usdt", label: "Tether (USDT)", address: "0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2" },
    { value: "matic", label: "Polygon (MATIC)", address: "0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2" },
  ];

  const onSubmit = (data: PaymentFormData) => {
    const amount = selectedPlan === "monthly" ? 2 : 20;
    paymentMutation.mutate({ ...data, amount });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of BoostBuddies with premium features designed for serious creators
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-xl shadow-lg border">
            <Button
              variant={selectedPlan === "monthly" ? "default" : "ghost"}
              onClick={() => setSelectedPlan("monthly")}
              className="px-8 py-3 rounded-lg font-semibold"
            >
              Monthly
            </Button>
            <Button
              variant={selectedPlan === "yearly" ? "default" : "ghost"}
              onClick={() => setSelectedPlan("yearly")}
              className="px-8 py-3 rounded-lg font-semibold relative"
            >
              Yearly
              {plans.yearly.savings && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  {plans.yearly.savings}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-700">Free Plan</CardTitle>
              <CardDescription>Your current plan</CardDescription>
              <div className="text-4xl font-bold text-gray-600">$0</div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.filter(f => !f.premium).map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{feature.title}</span>
                </div>
              ))}
              {features.filter(f => f.premium).map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 opacity-50">
                  <X className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">{feature.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-sm font-bold">
                MOST POPULAR
              </Badge>
            </div>
            <CardHeader className="text-center">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Premium
              </CardTitle>
              <CardDescription>Everything you need to succeed</CardDescription>
              <div className="space-y-2">
                <div className="text-5xl font-bold text-gray-900">{plans[selectedPlan].price}</div>
                <div className="text-2xl font-semibold text-purple-600">{plans[selectedPlan].nairaPrice}</div>
                <div className="text-gray-600">per {plans[selectedPlan].period}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <span className="text-gray-700 font-medium">{feature.title}</span>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-xl">
                    <Crown className="mr-2 h-5 w-5" />
                    Upgrade Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Choose Payment Method</DialogTitle>
                    <DialogDescription>
                      Select your preferred payment gateway to upgrade to Premium
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="gateway"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Gateway</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedGateway(value);
                            }}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                                <SelectItem value="paystack">Paystack</SelectItem>
                                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedGateway === "crypto" && (
                        <FormField
                          control={form.control}
                          name="cryptoType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cryptocurrency</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select cryptocurrency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cryptoOptions.map((crypto) => (
                                    <SelectItem key={crypto.value} value={crypto.value}>
                                      {crypto.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        )}
                      />

                      {selectedGateway === "crypto" && form.watch("cryptoType") && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">Send payment to this address:</p>
                          {cryptoOptions
                            .filter(crypto => crypto.value === form.watch("cryptoType"))
                            .map((crypto) => (
                              <div key={crypto.value} className="flex items-center space-x-2">
                                <code className="flex-1 text-xs bg-white p-2 rounded border">
                                  {crypto.address}
                                </code>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(crypto.address)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          <p className="text-xs text-gray-600">
                            Amount: {selectedPlan === "monthly" ? "$2 USD" : "$20 USD"}
                          </p>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="transactionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction ID / Reference</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter transaction ID or reference" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={paymentMutation.isPending}
                      >
                        {paymentMutation.isPending ? "Processing..." : "Submit Payment"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-700">Enterprise</CardTitle>
              <CardDescription>For teams and agencies</CardDescription>
              <div className="text-4xl font-bold text-gray-600">Custom</div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{feature.title}</span>
                </div>
              ))}
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Custom integrations</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Team management</span>
              </div>
              <Button variant="outline" className="w-full h-12 font-semibold">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does instant approval work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Premium users don't need to engage with other posts to get their content approved. 
                  Your posts go live immediately after submission.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is enhanced reach?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Premium posts get 5x more visibility in the feed and are shown to more community members, 
                  increasing your chances of engagement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can cancel your subscription at any time. Your premium features will remain 
                  active until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 7-day money-back guarantee. If you're not satisfied with Premium, 
                  contact support for a full refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
