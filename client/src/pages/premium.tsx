import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Star,
  Sparkles,
  Rocket,
  Target
} from "lucide-react";

const premiumFeatures = [
  {
    icon: Crown,
    title: "Premium Badge",
    description: "Show off your premium status with a golden crown badge on your profile",
    color: "text-yellow-500"
  },
  {
    icon: Zap, 
    title: "Auto-Approval",
    description: "Your posts get automatically approved without waiting for manual review",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Get detailed insights into your post performance and engagement metrics",
    color: "text-green-500"
  },
  {
    icon: Target,
    title: "Unlimited Posts",
    description: "Submit unlimited posts without daily or monthly restrictions",
    color: "text-purple-500"
  },
  {
    icon: MessageCircle,
    title: "Priority Support",
    description: "Get priority customer support with faster response times",
    color: "text-indigo-500"
  },
  {
    icon: Users,
    title: "Exclusive Communities",
    description: "Access to premium-only communities and collaboration opportunities",
    color: "text-pink-500"
  },
  {
    icon: Rocket,
    title: "Boosted Visibility",
    description: "Your posts get 3x more visibility in the community feed",
    color: "text-orange-500"
  },
  {
    icon: Star,
    title: "Custom Features",
    description: "Early access to new features and custom profile customization",
    color: "text-cyan-500"
  }
];

const pricingPlans = [
  {
    name: "Monthly",
    price: 9.99,
    period: "month",
    description: "Perfect for trying out premium features",
    popular: false,
    savings: null
  },
  {
    name: "Yearly",
    price: 99.99,
    period: "year", 
    description: "Best value - save 2 months free!",
    popular: true,
    savings: "Save $19.99"
  }
];

export default function Premium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const subscribeMutation = useMutation({
    mutationFn: async (plan: string) => {
      return await apiRequest("/api/premium/subscribe", "POST", { plan });
    },
    onSuccess: () => {
      toast({
        title: "Premium Activated!",
        description: "Your premium subscription has been activated. Enjoy your new features!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate premium subscription",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to subscribe to premium",
        variant: "destructive",
      });
      return;
    }
    
    subscribeMutation.mutate(plan);
  };

  if (user?.isPremium) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PremiumBadge variant="crown" size="lg" showText />
          </div>
          <h1 className="text-4xl font-bold font-display text-gray-900 mb-4">
            You're Premium!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for being a premium member. Enjoy all your exclusive features!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading">{feature.title}</CardTitle>
                    <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold font-display gradient-text mb-4">
          Unlock Premium Features
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Supercharge your social media growth with exclusive premium features designed for serious creators
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative hover:shadow-xl transition-all duration-300 ${
              plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1 font-heading">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              {plan.savings && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {plan.savings}
                </Badge>
              )}
              <CardDescription className="text-base">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                className={`w-full h-12 font-heading font-semibold text-lg transition-all duration-300 ${
                  plan.popular 
                    ? 'gradient-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl' 
                    : 'border-2 border-gray-300 hover:border-blue-400'
                }`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? "Processing..." : `Get ${plan.name} Premium`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold font-display text-center text-gray-900 mb-8">
          Premium Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-heading">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">
          Ready to boost your social media presence?
        </h3>
        <p className="text-gray-600 mb-6">
          Join thousands of creators who are already growing faster with Premium
        </p>
        <Button
          size="lg"
          className="gradient-primary text-white font-heading font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => handleSubscribe("yearly")}
          disabled={subscribeMutation.isPending}
        >
          <Crown className="mr-2 h-5 w-5" />
          Start Premium Today
        </Button>
      </div>
    </div>
  );
}