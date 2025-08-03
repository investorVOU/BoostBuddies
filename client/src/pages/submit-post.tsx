import { PostForm } from "@/components/posts/post-form";
import { useLocation } from "wouter";

export default function SubmitPost() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    // Redirect to feed after successful submission
    setLocation("/feed");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Post</h1>
        <p className="text-gray-600">
          Share your content with the BoostBuddies community and get the engagement you need to grow your social media presence.
        </p>
      </div>
      
      <PostForm onSuccess={handleSuccess} />
    </div>
  );
}