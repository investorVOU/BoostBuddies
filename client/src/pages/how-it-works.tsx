
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, UserPlus, Share, Heart, TrendingUp, Shield, Clock, Globe } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            How BoostBuddies Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join our community of creators and start boosting each other's content in just 4 simple steps.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500 text-white">Step 1</Badge>
            </div>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create your free account using Google, Twitter, or email. Join our community of creators instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-purple-500 text-white">Step 2</Badge>
            </div>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Share className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Submit Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share links to your Twitter, Facebook, YouTube, or TikTok posts that need engagement.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white">Step 3</Badge>
            </div>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Engage Others</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Like, share, and comment on other creators' content. Build genuine connections and friendships.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-pink-500 text-white">Step 4</Badge>
            </div>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Watch Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                See your engagement increase as the community discovers and interacts with your content.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose BoostBuddies?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">100% Safe & Authentic</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All engagement comes from real, verified users. No bots, no fake accounts, just genuine creators supporting each other.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Fast Results</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get engagement within minutes of posting. Our active community is online 24/7 across all time zones.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Multi-Platform Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Works with Twitter, Facebook, YouTube, TikTok, and more. Boost all your social media accounts in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Community Driven</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join communities of like-minded creators. Network, collaborate, and grow your audience together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white max-w-2xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Start Growing?</h3>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of creators who are already boosting their social media presence.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-12 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <p className="text-sm mt-4 opacity-75">No credit card required • Free forever plan available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
