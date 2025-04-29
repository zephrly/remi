import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IcebreakerPromptsProps {
  onSelectPrompt?: (prompt: string) => void;
  category?: string;
}

const IcebreakerPrompts: React.FC<IcebreakerPromptsProps> = ({
  onSelectPrompt = () => {},
  category = "general",
}) => {
  // Define different categories of icebreaker prompts
  const prompts = {
    general: [
      "What's the most interesting thing that's happened to you since we last saw each other?",
      "What's your favorite memory from when we used to hang out?",
      "If you could go back to one day from when we knew each other, which would it be?",
      "What's something you've always wanted to ask me but never did?",
      "How has your life path been different than what you expected back then?",
    ],
    school: [
      "Who was your favorite teacher and why?",
      "What class did you enjoy the most?",
      "Do you remember that time in [class/event]?",
      "What was your most embarrassing school moment?",
      "If you could redo one thing from school, what would it be?",
    ],
    work: [
      "What's been your favorite job since we worked together?",
      "Do you remember that impossible deadline we had?",
      "Who was the most memorable coworker from our time at [workplace]?",
      "What skills from our old job do you still use today?",
      "What's the biggest career lesson you've learned since then?",
    ],
    shared: [
      "Remember when we [specific shared experience]?",
      "Do you still [shared hobby/interest]?",
      "What do you think about [mutual friend] these days?",
      "Do you ever go back to [shared location]?",
      "What's your favorite memory of us hanging out?",
      "I remember when...",
      "I appreciate how you...",
      "A place I miss...",
      "My favorite memory of you/us is...",
      "I wish we could go back to...",
      "Something that made us laugh...",
      "An adventure we had...",
      "I still owe you for that time...",
      "You always had the best...",
      "I regret that I...",
      "I wish I had done better at...",
    ],
  };

  // Get the appropriate prompts based on category
  const categoryPrompts =
    prompts[category as keyof typeof prompts] || prompts.general;

  return (
    <Card className="w-full bg-white">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Conversation Starters</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Not sure what to say? Try one of these icebreakers to restart the
          conversation.
        </p>
        <div className="space-y-2">
          {categoryPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IcebreakerPrompts;
