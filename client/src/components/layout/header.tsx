import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/profile/user-avatar";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, User, Settings, LogOut, Camera, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleChangePhoto = () => {
    setShowPhotoDialog(true);
  };

  const handleSettings = () => {
    window.location.href = "/settings";
  };

  const handleProfile = () => {
    window.location.href = "/profile";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4 lg:px-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors">
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome back, <span className="font-semibold text-blue-600">{user?.firstName || "Creator"}</span>!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Points Display */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full px-4 py-2 shadow-sm">
            <i className="fas fa-coins text-green-500"></i>
            <span className="font-bold text-gray-900">{user?.points || 0}</span>
            <span className="text-sm text-gray-600 font-medium">pts</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
            {/* Example Notification Badge */}
            {/* <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 border-2 border-white">
              3
            </Badge> */}
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative p-0 rounded-full">
                <UserAvatar user={user || {}} size="md" showBadge={true} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  {user?.isPremium && (
                    <PremiumBadge variant="crown" size="sm" />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuItem onClick={handleChangePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                <span>Change Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProfile}>
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Change Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
            <DialogDescription>
              Upload a new photo to update your profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="picture" className="text-right">
                Picture
              </Label>
              <Input id="picture" defaultValue="avatar.jpg" className="col-span-3" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}