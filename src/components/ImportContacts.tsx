import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Contact } from "../types/user";
import { contactService } from "../services/contactService";
import { inviteService } from "../services/inviteService";
import {
  Phone,
  Mail,
  Facebook,
  Loader2,
  Instagram,
  Linkedin,
  Link,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FacebookLogin from "./FacebookLogin";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const ImportContacts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("phone");
  const [phoneContacts, setPhoneContacts] = useState<Contact[]>([]);
  const [googleContacts, setGoogleContacts] = useState<Contact[]>([]);
  const [facebookContacts, setFacebookContacts] = useState<Contact[]>([]);

  const [loading, setLoading] = useState<{
    phone: boolean;
    google: boolean;
    facebook: boolean;
    inviteLink: boolean;
  }>({
    phone: false,
    google: false,
    facebook: false,
    inviteLink: false,
  });

  const [connected, setConnected] = useState<{
    phone: boolean;
    google: boolean;
    facebook: boolean;
  }>({
    phone: true, // For demo purposes, assume phone is already connected
    google: false,
    facebook: false,
  });

  const [inviteSending, setInviteSending] = useState<Record<string, boolean>>(
    {},
  );

  const [inviteLink, setInviteLink] = useState<string>("");
  const [showInviteLinkDialog, setShowInviteLinkDialog] =
    useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    // Load phone contacts by default
    if (connected.phone && phoneContacts.length === 0) {
      loadPhoneContacts();
    }
  }, []);

  const loadPhoneContacts = async () => {
    setLoading((prev) => ({ ...prev, phone: true }));
    try {
      const contacts = await contactService.getPhoneContacts();
      setPhoneContacts(contacts);
    } catch (error) {
      console.error("Error loading phone contacts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, phone: false }));
    }
  };

  const loadGoogleContacts = async () => {
    setLoading((prev) => ({ ...prev, google: true }));
    try {
      const contacts = await contactService.getGoogleContacts();
      setGoogleContacts(contacts);
    } catch (error) {
      console.error("Error loading Google contacts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const loadFacebookContacts = async () => {
    setLoading((prev) => ({ ...prev, facebook: true }));
    try {
      const contacts = await contactService.getFacebookContacts();
      setFacebookContacts(contacts);
    } catch (error) {
      console.error("Error loading Facebook contacts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, facebook: false }));
    }
  };

  const handleFacebookLogin = (response: any) => {
    // Handle Facebook login response
    setLoading((prev) => ({ ...prev, facebook: true }));

    // In a real implementation, this would use the Facebook SDK
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, facebook: true }));
      loadFacebookContacts();
      setLoading((prev) => ({ ...prev, facebook: false }));
    }, 1500);
  };

  const connectService = async (service: "phone" | "google" | "facebook") => {
    setLoading((prev) => ({ ...prev, [service]: true }));
    try {
      await contactService.connectService(service);
      setConnected((prev) => ({ ...prev, [service]: true }));

      // Load contacts after connecting
      if (service === "phone") await loadPhoneContacts();
      if (service === "google") await loadGoogleContacts();
      if (service === "facebook") await loadFacebookContacts();
    } catch (error) {
      console.error(`Error connecting to ${service}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [service]: false }));
    }
  };

  const sendInvite = async (contact: Contact) => {
    setInviteSending((prev) => ({ ...prev, [contact.id]: true }));
    try {
      await inviteService.sendAnonymousInvite(contact);
      // In a real app, we might update the contact status or show a success message
    } catch (error) {
      console.error("Error sending invite:", error);
    } finally {
      setInviteSending((prev) => ({ ...prev, [contact.id]: false }));
    }
  };

  const getContactsForActiveTab = () => {
    switch (activeTab) {
      case "phone":
        return phoneContacts;
      case "google":
        return googleContacts;
      case "facebook":
        return facebookContacts;
      default:
        return [];
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "google":
        return <Mail className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const generateInviteLink = async () => {
    setLoading((prev) => ({ ...prev, inviteLink: true }));
    try {
      console.log("Generating invite link...");
      const link = await inviteService.generateInviteLink();
      console.log("Generated invite link:", link);
      setInviteLink(link);
      toast({
        title: "Invite link generated",
        description: "Your invite link has been created successfully.",
      });
    } catch (error: any) {
      console.error("Error generating invite link:", error);
      toast({
        title: "Error generating invite link",
        description:
          error.message || "Failed to generate invite link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, inviteLink: false }));
    }
  };

  const copyInviteLink = () => {
    try {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast({
        title: "Link copied to clipboard",
        description: "The invite link has been copied to your clipboard.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Could not copy to clipboard",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Import Contacts</h2>
        <p className="text-gray-600 mb-6">
          Connect your accounts to find friends who are already on Remi or
          invite them to join.
        </p>

        <div className="mb-6">
          <Button
            onClick={generateInviteLink}
            variant="outline"
            className="flex items-center gap-2 w-full justify-center py-6"
            disabled={loading.inviteLink}
          >
            {loading.inviteLink ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating invite link...
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" />
                Generate Shareable Invite Link
              </>
            )}
          </Button>

          {inviteLink && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p className="text-sm font-medium mb-2">Your invite link:</p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="font-mono text-sm flex-1"
                />
                <Button
                  onClick={copyInviteLink}
                  className="whitespace-nowrap"
                  variant={linkCopied ? "default" : "secondary"}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Tabs
          defaultValue="phone"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Phone
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Google
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" /> Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" /> Instagram
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </TabsTrigger>
          </TabsList>

          {["phone", "google", "facebook", "instagram", "linkedin"].map(
            (service) => (
              <TabsContent key={service} value={service}>
                {!connected[service as keyof typeof connected] ? (
                  <div className="text-center py-8">
                    {service === "facebook" ? (
                      <FacebookLogin callback={handleFacebookLogin} />
                    ) : (
                      <Button
                        onClick={() =>
                          connectService(
                            service as "phone" | "google" | "facebook",
                          )
                        }
                        disabled={loading[service as keyof typeof loading]}
                      >
                        {loading[service as keyof typeof loading] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            Connect{" "}
                            {service.charAt(0).toUpperCase() + service.slice(1)}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {loading[service as keyof typeof loading] ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : getContactsForActiveTab().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No contacts found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getContactsForActiveTab().map((contact) => (
                          <div
                            key={contact.id}
                            className="border rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarImage
                                  src={contact.avatar}
                                  alt={contact.name}
                                />
                                <AvatarFallback>
                                  {contact.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">
                                    {contact.name}
                                  </h3>
                                  {contact.hasAccount && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      On REMi
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {contact.email || contact.phone}
                                </p>
                              </div>
                            </div>
                            <div>
                              {contact.hasAccount ? (
                                contact.connectionStatus === "connected" ? (
                                  <Badge>Connected</Badge>
                                ) : contact.connectionStatus === "pending" ? (
                                  <Badge variant="outline">Pending</Badge>
                                ) : (
                                  <Button size="sm">Connect</Button>
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendInvite(contact)}
                                  disabled={inviteSending[contact.id]}
                                >
                                  {inviteSending[contact.id] ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Inviting...
                                    </>
                                  ) : (
                                    "Invite"
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ),
          )}
        </Tabs>
      </div>

      <Dialog
        open={showInviteLinkDialog}
        onOpenChange={setShowInviteLinkDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Unique Invite Link</DialogTitle>
            <DialogDescription>
              Share this link with friends to invite them to Remi. When they
              create an account, you'll be automatically connected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="font-mono text-sm"
              ></Input>
            </div>
            <Button
              size="icon"
              onClick={copyInviteLink}
              className="px-3"
              variant={linkCopied ? "default" : "secondary"}
            >
              {linkCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              You can share this link via:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Mail className="h-3 w-3" /> Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Facebook className="h-3 w-3" /> Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Instagram className="h-3 w-3" /> Instagram
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
};

export default ImportContacts;
