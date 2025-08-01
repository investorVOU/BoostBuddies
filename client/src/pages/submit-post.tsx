import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import PostForm from "@/components/posts/post-form";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function SubmitPost() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a Post</h1>
              <p className="text-gray-600">
                Share your content from Twitter, Facebook, YouTube, or TikTok to get community engagement.
                Remember, you need to like at least 10 other posts before yours gets approved!
              </p>
            </div>
            
            <PostForm />
          </div>
        </main>
      </div>
    </div>
  );
}
