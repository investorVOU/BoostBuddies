import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Users, TrendingUp, Zap, Shield, Globe, Heart } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">BB</span>
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BoostBuddies
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a 
            href="/how-it-works" 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            How It Works
          </a>
          <a 
            href="/about" 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            About
          </a>
          <Button 
            className="font-heading bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/login'}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-white/90 text-blue-600 border-blue-200 font-medium px-4 py-2">
            🚀 Join 10,000+ creators already boosting their content
          </Badge>

          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            Boost Your
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Social Reach
            </span>
          </h1>

          <p className="font-body text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect with a thriving community of creators. Share your content, engage authentically, 
            and watch your social media presence grow exponentially.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="font-heading bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 btn-glow"
              onClick={() => window.location.href = '/login'}
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Boosting Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="font-heading border-2 border-gray-300 hover:border-blue-400 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 mb-16">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">10k+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-medium">500% Avg Growth</span>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
              alt="Dashboard Preview"
              className="relative w-full rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-bold text-gray-900 mb-6">
              Why Creators Choose 
              <span className="text-blue-600"> BoostBuddies</span>
            </h2>
            <p className="font-body text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to grow your social media presence organically and build authentic engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">Cross-Platform Boosting</h3>
                <p className="font-body text-gray-600 leading-relaxed">
                  Share content from Twitter, Facebook, YouTube, and TikTok to get genuine engagement from our global community of creators.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">Instant Engagement</h3>
                <p className="font-body text-gray-600 leading-relaxed">
                  Get real likes, shares, and comments within minutes of posting. Our community is active 24/7 across all time zones.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">Authentic Community</h3>
                <p className="font-body text-gray-600 leading-relaxed">
                  Connect with real creators who understand your journey. Build meaningful relationships beyond just numbers.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">Growth Analytics</h3>
                <p className="font-body text-gray-600 leading-relaxed">
                  Track your progress with detailed analytics and insights. See which content performs best and optimize your strategy.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">Reward System</h3>
                <p className="font-body text-gray-600 leading-relaxed">
                  Earn points for engaging with others and unlock premium features. The more you give, the more you receive.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">Safe & Secure</h3>
                <p className="font-body text-gray-600 leading-relaxed">
                  Your data is protected with enterprise-grade security. We never ask for your social media passwords.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-5xl font-bold text-white mb-16">
            Trusted by Creators Worldwide
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="glass rounded-3xl p-8">
              <div className="font-heading text-4xl font-bold text-white mb-2">10k+</div>
              <div className="font-body text-blue-100">Active Creators</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="font-heading text-4xl font-bold text-white mb-2">2M+</div>
              <div className="font-body text-blue-100">Posts Boosted</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="font-heading text-4xl font-bold text-white mb-2">50M+</div>
              <div className="font-body text-blue-100">Engagements</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="font-heading text-4xl font-bold text-white mb-2">98%</div>
              <div className="font-body text-blue-100">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-5xl font-bold text-white mb-6">
            Ready to Boost Your Content?
          </h2>
          <p className="font-body text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Join thousands of creators who are already growing their social media presence with BoostBuddies.
          </p>
          <Button 
            size="lg" 
            className="font-heading bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 btn-glow"
            onClick={() => window.location.href = '/login'}
          >
            <Zap className="mr-3 h-6 w-6" />
            Get Started Free Today
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          <p className="font-body text-gray-400 mt-6">No credit card required • Free forever plan available</p>
        </div>
      </section>
    </div>
  );
}