import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalmMode } from '@/context/CalmModeContext';
import { useLanguage } from '@/context/language/useLanguage';
import { Video } from 'lucide-react';

interface StartLiveSessionDialogProps {
  onStartSession: (sessionData: {
    title: string;
    description: string;
    language: string;
  }) => void;
}

const StartLiveSessionDialog = ({ onStartSession }: StartLiveSessionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const { calmMode } = useCalmMode();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return;
    }

    onStartSession({
      title: title.trim(),
      description: description.trim(),
      language
    });

    // Reset form and close dialog
    setTitle('');
    setDescription('');
    setLanguage('en');
    setOpen(false);
  };

  const languages = [
    { value: 'en', label: 'English 🇺🇸' },
    { value: 'es', label: 'Español 🇪🇸' },
    { value: 'fr', label: 'Français 🇫🇷' },
    { value: 'de', label: 'Deutsch 🇩🇪' },
    { value: 'pt', label: 'Português 🇵🇹' },
    { value: 'zh', label: '中文 🇨🇳' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`${calmMode ? 'bg-calm-primary hover:bg-calm-primary/90 text-calm-text' : 'bg-social-blue hover:bg-social-darkblue'}`}>
          <Video className="h-4 w-4 mr-2" />
          Start Live Session
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-md ${calmMode ? 'bg-calm-card border-calm-border' : ''}`}>
        <DialogHeader>
          <DialogTitle className={calmMode ? 'text-calm-text' : ''}>
            Start New Live Session
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className={calmMode ? 'text-calm-text' : ''}>
              Session Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter session title..."
              className={calmMode ? 'bg-calm-bg border-calm-border text-calm-text' : ''}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className={calmMode ? 'text-calm-text' : ''}>
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this session will cover..."
              className={`resize-none ${calmMode ? 'bg-calm-bg border-calm-border text-calm-text' : ''}`}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="language" className={calmMode ? 'text-calm-text' : ''}>
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className={calmMode ? 'bg-calm-bg border-calm-border text-calm-text' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className={`flex-1 ${calmMode ? 'border-calm-border text-calm-text hover:bg-calm-bg' : ''}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${calmMode ? 'bg-calm-primary hover:bg-calm-primary/90 text-calm-text' : 'bg-social-blue hover:bg-social-darkblue'}`}
              disabled={!title.trim() || !description.trim()}
            >
              Start Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartLiveSessionDialog;