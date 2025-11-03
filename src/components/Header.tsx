import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Building2, LogOut, User, Languages } from 'lucide-react';
import { Badge } from './ui/badge';
import { NotificationCenter } from './NotificationCenter';
import { ProfileSettings } from './ProfileSettings';
import { languageNames } from '../i18n/translations';

export const Header = () => {
  const { currentUser, logout, t, language } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  if (!currentUser) return null;

  const roleColors = {
    citizen: 'default',
    staff: 'secondary',
    admin: 'destructive',
  } as const;

  const roleGradients = {
    citizen: 'from-blue-500 to-blue-600',
    staff: 'from-purple-500 to-purple-600',
    admin: 'from-red-500 to-red-600',
  };

  return (
    <motion.header
      className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <div className={`h-11 w-11 bg-gradient-to-br ${roleGradients[currentUser.role]} rounded-xl flex items-center justify-center shadow-lg`}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.appName}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">{t.appSubtitle}</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Indicator */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50"
          >
            <Languages className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {languageNames[language].split(' ')[0]}
            </span>
          </motion.div>

          {/* Notification Center */}
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="gap-2 hover:bg-accent/50">
                  <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-primary/20">
                    <AvatarFallback className={`bg-gradient-to-br ${roleGradients[currentUser.role]} text-white`}>
                      {currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <div className="text-sm">{currentUser.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {currentUser.role}
                    </div>
                  </div>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  <Badge variant={roleColors[currentUser.role]} className="w-fit capitalize">
                    {t[currentUser.role as keyof typeof t] || currentUser.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                {t.profileSettings}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
                <Languages className="mr-2 h-4 w-4" />
                {t.languageSettings}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                {t.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Settings Dialog */}
      <ProfileSettings open={showSettings} onOpenChange={setShowSettings} />
    </motion.header>
  );
};
