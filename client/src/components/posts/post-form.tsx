import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Send, 
  Link, 
  Target, 
  TrendingUp, 
  Twitter, 
  Youtube, 
  Facebook,
  Clock,
  CheckCircle,
  Zap
} from "lucide-react";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  url: z.string().url("Please enter a valid URL"),
  platform: z.enum(["twitter", "facebook", "youtube", "tiktok", "instagram"], {
    required_error: "Please select a platform",
  }),
  likesNeeded: z.number().min(1).max(1000).default(10),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  onSuccess?: () => void;
}

export function PostForm({ onSuccess }: PostFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      platform: "twitter",
      likesNeeded: 10,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      return apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      
      form.reset();
      setIsSubmitting(false);
      
      const isAutoApproved = data.autoApproved || user?.isPremium;
      
      toast({
        title: isAutoApproved ? "Post Published!" : "Post Submitted!",
        description: isAutoApproved 
          ? "Your post has been automatically approved and is now live."
          : "Your post has been submitted for review and will be approved soon.",
      });
      
      onSuccess?.();
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    setIsSubmitting(true);
    createPostMutation.mutate(data);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      case "youtube":
        return <Youtube className="w-4 h-4" />;
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      default:
        return <Link className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "text-blue-500";
      case "youtube":
        return "text-red-500";
      case "facebook":
        return "text-blue-600";
      case "tiktok":
        return "text-pink-500";
      case "instagram":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Submit Your Post</CardTitle>
            <CardDescription>
              Share your content with the community to get engagement and boost your social media presence
            </CardDescription>
          </div>
        </div>
        
        {user?.isPremium && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Premium Auto-Approval: Your posts will be automatically approved!
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Post Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a catchy title for your post..."
                      {...field}
                      className="h-12"
                      data-testid="input-post-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your post and what kind of engagement you're looking for..."
                      className="min-h-[100px] resize-none"
                      {...field}
                      data-testid="textarea-post-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Post URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://twitter.com/username/status/..."
                      {...field}
                      className="h-12"
                      data-testid="input-post-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12" data-testid="select-platform">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="twitter">
                          <div className="flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-blue-500" />
                            Twitter
                          </div>
                        </SelectItem>
                        <SelectItem value="facebook">
                          <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4 text-blue-600" />
                            Facebook
                          </div>
                        </SelectItem>
                        <SelectItem value="youtube">
                          <div className="flex items-center gap-2">
                            <Youtube className="w-4 h-4 text-red-500" />
                            YouTube
                          </div>
                        </SelectItem>
                        <SelectItem value="tiktok">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-pink-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">T</span>
                            TikTok
                          </div>
                        </SelectItem>
                        <SelectItem value="instagram">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-sm"></span>
                            Instagram
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="likesNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Target Engagement</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                        className="h-12"
                        data-testid="input-likes-needed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">How it works</h4>
                  <p className="text-sm text-blue-700">
                    Once approved, community members will engage with your post to help you reach your target. 
                    You'll earn points that you can use to boost other creators' content too!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {user?.isPremium ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Auto-approved</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>Pending review</span>
                  </>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 h-12"
                data-testid="button-submit-post"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}