import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Languages, Check } from 'lucide-react';
import { Language, languageNames } from '../i18n/translations';

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileSettings = ({ open, onOpenChange }: ProfileSettingsProps) => {
  const { currentUser, language, setLanguage, t } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const handleSave = () => {
    if (selectedLanguage !== language) {
      setLanguage(selectedLanguage);
    }
    onOpenChange(false);
  };

  const languages: Language[] = ['en', 'hi', 'ta', 'te', 'es', 'fr'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.profileSettings}
          </DialogTitle>
          <DialogDescription>
            Customize your profile preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">User Information</Label>
            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <span className="text-sm font-medium capitalize">{currentUser?.role}</span>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="space-y-3">
            <Label htmlFor="language" className="text-base font-semibold flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              {t.languageSettings}
            </Label>
            
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder={t.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>{languageNames[lang]}</span>
                      {lang === selectedLanguage && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedLanguage !== language && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-muted-foreground italic"
              >
                Click save to apply the new language
              </motion.p>
            )}
          </div>

          {/* Language Preview */}
          <div className="rounded-lg border p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <Label className="text-sm font-medium mb-2 block">Preview</Label>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">{t.appName}</span></p>
              <p className="text-muted-foreground">{t.appSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {t.save}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
