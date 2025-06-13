import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@supabase/supabase-js";
import {
  createMessagingSession,
  getMessagingSessions,
  getSessionMessages,
  addMessageToSession,
} from "@/utils/matchingService";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const directSupabase = createClient(supabaseUrl, supabaseAnonKey);

interface MessagingDebugPanelProps {
  currentUserId?: string;
  friendId?: string;
}

const MessagingDebugPanel: React.FC<MessagingDebugPanelProps> = ({
  currentUserId = "test-user-1",
  friendId = "test-user-2",
}) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testMessage, setTestMessage] = useState(
    "Hello, this is a test message!",
  );
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Test 1: Check Supabase connection
      info.supabaseConnection = {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
      };

      // Test 2: Check if tables exist
      const { data: sessionTableCheck, error: sessionTableError } =
        await directSupabase.from("message_sessions").select("count").limit(1);
      info.sessionTableExists = !sessionTableError;
      info.sessionTableError = sessionTableError?.message;

      const { data: messageTableCheck, error: messageTableError } =
        await directSupabase.from("messages").select("count").limit(1);
      info.messageTableExists = !messageTableError;
      info.messageTableError = messageTableError?.message;

      // Test 3: Try to get existing sessions
      const sessions = await getMessagingSessions(currentUserId);
      info.existingSessions = sessions;
      info.sessionCount = sessions.length;

      // Test 4: Try to create a session
      const newSession = await createMessagingSession(currentUserId, friendId);
      info.sessionCreation = {
        success: !!newSession,
        session: newSession,
      };

      // Test 5: If session exists, try to get messages
      if (newSession) {
        const messages = await getSessionMessages(newSession.id);
        info.existingMessages = messages;
        info.messageCount = messages.length;
      }

      // Test 6: Check database schema
      const { data: sessionSchema, error: sessionSchemaError } =
        await directSupabase.from("message_sessions").select("*").limit(1);
      info.sessionSchema = {
        success: !sessionSchemaError,
        error: sessionSchemaError?.message,
        sampleData: sessionSchema?.[0],
      };

      const { data: messageSchema, error: messageSchemaError } =
        await directSupabase.from("messages").select("*").limit(1);
      info.messageSchema = {
        success: !messageSchemaError,
        error: messageSchemaError?.message,
        sampleData: messageSchema?.[0],
      };

      setDebugInfo(info);
    } catch (error) {
      info.generalError = error;
      setDebugInfo(info);
    }

    setLoading(false);
  };

  const sendTestMessage = async () => {
    if (!debugInfo.sessionCreation?.session) {
      alert("No session available. Run diagnostics first.");
      return;
    }

    setLoading(true);
    try {
      const message = await addMessageToSession(
        debugInfo.sessionCreation.session.id,
        currentUserId,
        testMessage,
        friendId,
      );

      if (message) {
        alert("Message sent successfully!");
        // Refresh diagnostics to show the new message
        await runDiagnostics();
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      alert(`Error sending message: ${error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-4 bg-white space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Messaging System Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? "Running..." : "Run Diagnostics"}
            </Button>
            <Button onClick={sendTestMessage} disabled={loading}>
              Send Test Message
            </Button>
          </div>

          <div className="space-y-2">
            <label>Test Message:</label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message"
            />
          </div>

          <div className="space-y-2">
            <label>Current User ID: {currentUserId}</label>
            <label>Friend ID: {friendId}</label>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingDebugPanel;
