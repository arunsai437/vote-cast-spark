import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Calendar } from "lucide-react";
import { Poll } from "./VotingDashboard";

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePoll: (poll: Omit<Poll, 'id' | 'votes' | 'totalVotes'>) => void;
}

export const CreatePollDialog = ({ open, onOpenChange, onCreatePoll }: CreatePollDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [endDate, setEndDate] = useState("");

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = options.filter(option => option.trim() !== "");
    
    if (title.trim() && validOptions.length >= 2) {
      onCreatePoll({
        title: title.trim(),
        description: description.trim(),
        options: validOptions,
        status: 'active',
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy: 'user'
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      setEndDate("");
    }
  };

  const isValid = title.trim() && options.filter(option => option.trim()).length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gradient-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Poll</DialogTitle>
          <DialogDescription>
            Create a new poll for voting. Add at least 2 options for participants to choose from.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Poll Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter poll title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this poll is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Options *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddOption}
                disabled={options.length >= 10}
                className="text-primary hover:text-primary-hover"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${index + 1}...`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="h-10"
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date (Optional)
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={!isValid}
              className="min-w-[120px]"
            >
              Create Poll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};