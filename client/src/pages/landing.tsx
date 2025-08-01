import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-rocket text-white text-xl"></i>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BoostBuddies
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            The social engagement platform that helps creators boost their content across 
            <span className="text-blue-600 font-semibold"> Twitter</span>, 
            <span className="text-blue-600 font-semibold"> Facebook</span>, 
            <span className="text-red-600 font-semibold"> YouTube</span>, and 
            <span className="text-purple-600 font-semibold"> TikTok</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <i className="fas fa-users mr-2"></i>
              Community Driven
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <i className="fas fa-star mr-2"></i>
              Points & Rewards
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <i className="fas fa-chart-line mr-2"></i>
              Real Analytics
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <i className="fas fa-mobile-alt mr-2"></i>
              Mobile First
            </Badge>
          </div>

          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/api/login'}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-share-alt text-blue-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Cross-Platform Boosting</h3>
              <p className="text-gray-600">
                Share your content links from Twitter, Facebook, YouTube, and TikTok to get genuine engagement from our community.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-users text-purple-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Moderation</h3>
              <p className="text-gray-600">
                Like 10 posts to get your content approved. Fair, community-driven moderation that prevents spam and promotes quality.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-coins text-green-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Points & Rewards</h3>
              <p className="text-gray-600">
                Earn points for engaging with others' content. Climb the leaderboard and unlock special features and recognition.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-bar text-orange-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track your engagement metrics, monitor performance, and see how your content performs across all platforms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-broadcast-tower text-red-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Events</h3>
              <p className="text-gray-600">
                Join live Q&A sessions, watch parties, and community events. Connect with creators in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-star text-yellow-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Collab Spotlight</h3>
              <p className="text-gray-600">
                Get featured in our weekly collaboration spotlight when you work with other creators on amazing projects.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to boost your social media presence?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who are already growing their audience with BoostBuddies.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Boosting Today
          </Button>
        </div>
      </div>
    </div>
  );
}
