import React from "react";
import { Filter } from "bad-words";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { MessageSquare, Plus, ChevronDown, ChevronUp } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

const generateDeviceId = () =>
  "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });


const CommunityThreads = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [threads, setThreads] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    author: "",
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const filter = new Filter();
  const [deviceId, setDeviceId] = useState(null);


  useEffect(() => {
    // assign device_id if not stored yet
    let storedId = localStorage.getItem("device_id");
    if (!storedId) {
      storedId = generateDeviceId();
      localStorage.setItem("device_id", storedId);
    }
    setDeviceId(storedId);

    fetchThreads();
  }, []);

  const onCaptchaChange = (value) => {
    if (value) setCaptchaVerified(true);
  };

  const fetchThreads = async () => {
    const { data, error } = await supabase
      .from("threads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setThreads(data);
  };

  const addThread = async () => {
    if (isPosting) return; // prevent multiple clicks
    setErrorMessage(""); // reset error
    setIsPosting(true);

    try {
      if (!captchaVerified) {
        setErrorMessage("Please verify that you are not a robot!");
        return;
      }

      if (!newThread.title || !newThread.content || !newThread.author) {
        setErrorMessage("All fields are required!");
        return;
      }

      // Profanity check
      if (
        filter.isProfane(newThread.title) ||
        filter.isProfane(newThread.content)
      ) {
        setErrorMessage(
          "Your post contains inappropriate language and cannot be submitted."
        );
        return;
      }

      const limit = new Date();
      limit.setHours(limit.getHours() - 1);

      const { data: recentThreads, error: fetchError } = await supabase
        .from("threads")
        .select("*")
        .eq("device_id", deviceId)
        .gte("created_at", limit.toISOString());

      if (recentThreads && recentThreads.length >= 3) {
        setErrorMessage("You can only post up to 3 threads per hour.");
        return; // stop further execution
      }

      // Insert thread
      const { data, error } = await supabase
        .from("threads")
        .insert([{ ...newThread, device_id: deviceId }])
        .select();

      if (error) {
        setErrorMessage("Failed to post thread. Try again.");
        console.log(error);
        return;
      }

      if (data && data.length > 0) {
        setThreads([data[0], ...threads]);
        setNewThread({ title: "", content: "", author: "" });
        setShowThreadForm(false);
      }
    } finally {
      setIsPosting(false);
    }
  };

  const toggleThread = (threadId) => {
    const newExpanded = new Set(expandedThreads);
    newExpanded.has(threadId)
      ? newExpanded.delete(threadId)
      : newExpanded.add(threadId);
    setExpandedThreads(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center space-x-3">
      <MessageSquare className="text-primary" size={24} />
      <div>
        <CardTitle className="text-base sm:text-lg">
          Community Suggestions & Feedback
        </CardTitle>
        <CardDescription className="text-sm">
          Share your ideas and feedback with the community
        </CardDescription>
      </div>
    </div>

    <Button
      onClick={() => setShowThreadForm(!showThreadForm)}
      className="self-start sm:self-auto"
    >
      <Plus className="h-4 w-4 mr-2" /> New Thread
    </Button>
  </div>
</CardHeader>


      {showThreadForm && (
        <CardContent className="border-t bg-muted/50 p-8">
          <div className="space-y-4">
            <Input
              placeholder="Thread title..."
              value={newThread.title}
              onChange={(e) =>
                setNewThread({ ...newThread, title: e.target.value })
              }
            />
            <Input
              placeholder="Your username..."
              value={newThread.author}
              onChange={(e) =>
                setNewThread({ ...newThread, author: e.target.value })
              }
            />
            <Textarea
              placeholder="Share your suggestions or feedback..."
              value={newThread.content}
              onChange={(e) =>
                setNewThread({ ...newThread, content: e.target.value })
              }
            />
            <div className="recaptcha-container">
            <ReCAPTCHA
              sitekey="6LcSysMrAAAAAHryuNdoVO42_hHMrxx5UUmsWO0b"
              onChange={onCaptchaChange}
            />
            </div>

            {errorMessage && (
              <p className="text-red-500 font-medium">{errorMessage}</p>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={addThread}
                disabled={
                  !newThread.title || !newThread.content || !newThread.author
                }
              >
                Post Thread
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowThreadForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      <CardContent>
        {threads.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No threads yet. Be the first to share your suggestions!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {threads.map((thread) => (
              <div key={thread.id} className="p-6">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-muted/50 -m-2 p-2 rounded-lg transition-colors"
                  onClick={() => toggleThread(thread.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {thread.author?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{thread.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{thread.author}</span>
                        <span>
                          {new Date(thread.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedThreads.has(thread.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {expandedThreads.has(thread.id) && (
                  <div className="mt-4 pl-14">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-sm">{thread.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityThreads;
