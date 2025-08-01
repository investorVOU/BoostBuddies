
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Zap, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About BoostBuddies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to help content creators grow their social media presence organically 
            through authentic community engagement and mutual support.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Community First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Building genuine connections between creators who support each other's growth.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Organic Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Focus on authentic engagement rather than artificial metrics and bot interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Fast Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get real engagement within minutes of posting, with our active global community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Authentic Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real people providing genuine likes, shares, and meaningful comments on your content.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                BoostBuddies was born from the frustration of small creators trying to break through 
                the noise on social media platforms. We realized that authentic engagement was becoming 
                increasingly difficult to achieve, especially for new creators.
              </p>
              <p>
                Instead of relying on expensive ads or questionable bot services, we created a platform 
                where real creators help each other grow. Every like, share, and comment comes from 
                genuine users who understand the creator journey.
              </p>
              <p>
                Today, we're proud to have helped thousands of creators amplify their voices and 
                build meaningful audiences across all major social media platforms.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600 font-medium">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
            <div className="text-gray-600 font-medium">Engagements Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">500%</div>
            <div className="text-gray-600 font-medium">Average Growth Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
