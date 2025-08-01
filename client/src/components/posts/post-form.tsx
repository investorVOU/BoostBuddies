import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const postSchema = z.object({
  platform: z.enum(["twitter", "facebook", "youtube", "tiktok"]),
  url: z.string().url("Please enter a valid URL"),
  content: z.string().min(10, "Content must be at least 10 characters").max(500, "Content must be less than 500 characters"),
});

type PostFormData = z.infer<typeof postSchema>;

export default function PostForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      platform: undefined,
      url: "",
      content: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      
      toast({
        title: "Success!",
        description: "Your post has been submitted for community review.",
      });
      
      form.reset();
      window.location.href = "/";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-plus-circle text-primary"></i>
          <span>Submit New Post</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="twitter">
                        <div className="flex items-center space-x-2">
                          <i className="fab fa-twitter text-blue-500"></i>
                          <span>Twitter</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <div className="flex items-center space-x-2">
                          <i className="fab fa-facebook text-blue-600"></i>
                          <span>Facebook</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center space-x-2">
                          <i className="fab fa-youtube text-red-500"></i>
                          <span>YouTube</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tiktok">
                        <div className="flex items-center space-x-2">
                          <i className="fab fa-tiktok text-black"></i>
                          <span>TikTok</span>
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
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://twitter.com/username/status/123456789" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your post and why others should engage with it..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Community Moderation</h4>
                  <p className="text-sm text-blue-700">
                    Your post will be reviewed by the community. You need to like at least 10 other posts 
                    before your submission gets approved. This ensures fair engagement for everyone!
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-rocket mr-2"></i>
                  Submit Post
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
