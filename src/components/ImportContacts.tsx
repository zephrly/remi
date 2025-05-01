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
} from "lucide-react";

// Mock implementation of Facebook login component
const FacebookLogin = ({ callback }: { callback: (response: any) => void }) => {
  const handleFacebookLogin = () => {
    // Mock successful response
    callback({
      accessToken: "mock_access_token",
      userID: "mock_user_id",
      name: "Mock User",
      email: "mock@example.com",
    });
  };

  return (
    <Button onClick={handleFacebookLogin}>
      <Facebook className="mr-2 h-4 w-4" />
      Connect Facebook
    </Button>
  );
};

const ImportContacts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("phone");
  const [phoneContacts, setPhoneContacts] = useState<Contact[]>([]);
  const [googleContacts, setGoogleContacts] = useState<Contact[]>([]);
  const [facebookContacts, setFacebookContacts] = useState<Contact[]>([]);

  const [loading, setLoading] = useState<{
    phone: boolean;
    google: boolean;
    facebook: boolean;
  }>({
    phone: false,
    google: false,
    facebook: false,
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Import Contacts</h2>
      <p className="text-gray-600 mb-6">
        Connect your accounts to find friends who are already on Remi or invite
        them to join.
      </p>

      <Tabs defaultValue="phone" value={activeTab} onValueChange={setActiveTab}>
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
                                <h3 className="font-medium">{contact.name}</h3>
                                {contact.hasAccount && (
                                  <Badge variant="outline" className="text-xs">
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
  );
};

export default ImportContacts;
