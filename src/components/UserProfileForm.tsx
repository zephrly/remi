import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Camera,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Check,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfileFormProps {
  profile: {
    id: string;
    name: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    avatar: string;
    bio?: string;
    location?: string;
    dateOfBirth?: string;
    address?: {
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    connectedAccounts?: {
      facebook?: boolean;
      instagram?: boolean;
      linkedin?: boolean;
      google?: boolean;
      twitter?: boolean;
      phone?: boolean;
    };
  };
  isEditing: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleAddressChange: (field: string, value: string) => void;
  handleSocialToggle: (platform: string) => void;
  handleAvatarChange?: (file?: File) => void;
}

const UserProfileForm = ({
  profile,
  isEditing,
  handleChange,
  handleAddressChange,
  handleSocialToggle,
  handleAvatarChange,
}: UserProfileFormProps) => {
  // Ensure address and connectedAccounts objects exist
  const address = profile.address || {};
  const connectedAccounts = profile.connectedAccounts || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List of countries for the dropdown
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Other",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && handleAvatarChange) {
      console.log("File selected:", e.target.files[0].name);
      handleAvatarChange(e.target.files[0]);
    }
  };

  const SocialAccountItem = ({
    platform,
    icon,
    color,
    isConnected,
  }: {
    platform: string;
    icon: React.ReactNode;
    color: string;
    isConnected?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
        <div>
          <p className="font-medium capitalize">{platform}</p>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>
      {isEditing ? (
        <Switch
          checked={!!isConnected}
          onCheckedChange={() => handleSocialToggle(platform)}
        />
      ) : isConnected ? (
        <Badge variant="outline" className="flex items-center gap-1">
          <Check className="h-3 w-3" /> Connected
        </Badge>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                aria-label="Upload profile picture"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          {isEditing ? (
            <Input
              id="firstName"
              name="firstName"
              value={profile.firstName || ""}
              onChange={handleChange}
              className="w-full"
            />
          ) : (
            <p className="text-gray-900">
              {profile.firstName || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          {isEditing ? (
            <Input
              id="middleName"
              name="middleName"
              value={profile.middleName || ""}
              onChange={handleChange}
              className="w-full"
            />
          ) : (
            <p className="text-gray-900">
              {profile.middleName || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Last Name</Label>
          {isEditing ? (
            <Input
              id="lastName"
              name="lastName"
              value={profile.lastName || ""}
              onChange={handleChange}
              className="w-full"
            />
          ) : (
            <p className="text-gray-900">
              {profile.lastName || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          {isEditing ? (
            <Input
              id="username"
              name="username"
              value={profile.username || ""}
              onChange={handleChange}
              className="w-full"
            />
          ) : (
            <p className="text-gray-900">
              {profile.username || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input
              id="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              className="w-full"
              type="email"
            />
          ) : (
            <p className="text-gray-900">{profile.email || "Not provided"}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          {isEditing ? (
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              value={profile.dateOfBirth || ""}
              onChange={handleChange}
              className="w-full"
              type="date"
            />
          ) : (
            <p className="text-gray-900">
              {profile.dateOfBirth || "May 1, 2025"}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio</Label>
        {isEditing ? (
          <Textarea
            id="bio"
            name="bio"
            value={profile.bio || ""}
            onChange={handleChange}
            className="w-full min-h-[100px]"
          />
        ) : (
          <p className="text-gray-900">{profile.bio || "No bio provided"}</p>
        )}
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            {isEditing ? (
              <Input
                id="city"
                name="city"
                value={address.city || ""}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="w-full"
              />
            ) : (
              <p className="text-gray-900">{address.city || "Not provided"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State/Province</Label>
            {isEditing ? (
              <Input
                id="state"
                name="state"
                value={address.state || ""}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="w-full"
              />
            ) : (
              <p className="text-gray-900">{address.state || "Not provided"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="zipCode">Zip/Postal Code</Label>
            {isEditing ? (
              <Input
                id="zipCode"
                name="zipCode"
                value={address.zipCode || ""}
                onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                className="w-full"
              />
            ) : (
              <p className="text-gray-900">
                {address.zipCode || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            {isEditing ? (
              <Select
                value={address.country || ""}
                onValueChange={(value) => handleAddressChange("country", value)}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-gray-900">
                {address.country || "Not provided"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Connected Social Accounts */}
      <div>
        <h3 className="text-lg font-medium mb-4">Connected Social Accounts</h3>
        <div className="space-y-2">
          <SocialAccountItem
            platform="facebook"
            icon={<Facebook size={18} className="text-white" />}
            color="bg-blue-600"
            isConnected={connectedAccounts.facebook}
          />
          <SocialAccountItem
            platform="instagram"
            icon={<Instagram size={18} className="text-white" />}
            color="bg-pink-600"
            isConnected={connectedAccounts.instagram}
          />
          <SocialAccountItem
            platform="linkedin"
            icon={<Linkedin size={18} className="text-white" />}
            color="bg-blue-800"
            isConnected={connectedAccounts.linkedin}
          />
          <SocialAccountItem
            platform="twitter"
            icon={<Twitter size={18} className="text-white" />}
            color="bg-sky-500"
            isConnected={connectedAccounts.twitter}
          />
          <SocialAccountItem
            platform="google"
            icon={<Mail size={18} className="text-white" />}
            color="bg-red-500"
            isConnected={connectedAccounts.google}
          />
          <SocialAccountItem
            platform="phone"
            icon={<Phone size={18} className="text-white" />}
            color="bg-green-600"
            isConnected={connectedAccounts.phone}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
