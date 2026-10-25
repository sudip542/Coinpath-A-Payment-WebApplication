import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme, setDemoMode } from "@/store/slices/uiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Moon, Sun, Sparkles, LogOut, Lock } from "lucide-react";

export const SecurityCard: React.FC = () => {
  const { logout } = useAuth();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const demoMode = useAppSelector((state) => state.ui.demoMode);

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500" />
          <CardTitle className="text-sm font-bold">Preferences & Security</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4 text-xs space-y-4">
        {/* Theme preference */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-semibold text-foreground">Interface Theme</p>
            <p className="text-muted-foreground text-[11px]">
              Toggle between light and dark visual presentation
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(toggleTheme())}
            className="gap-2 h-8 px-3"
          >
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            <span className="capitalize">{theme} mode</span>
          </Button>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-border/40 pt-3">
          <div>
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              Demo Mode Simulation
            </p>
            <p className="text-muted-foreground text-[11px]">
              Switch between simulated sandbox data and live Spring Boot backend
            </p>
          </div>
          <Button
            variant={demoMode ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch(setDemoMode(!demoMode))}
            className="h-8 px-3 text-xs"
          >
            {demoMode ? "Enabled" : "Disabled"}
          </Button>
        </div>

        {/* Cryptographic Session */}
        <div className="flex items-center justify-between py-1 border-t border-border/40 pt-3">
          <div>
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-indigo-500" />
              JWT Bearer Session
            </p>
            <p className="text-muted-foreground text-[11px]">
              Active token with Spring Security RBAC authorization
            </p>
          </div>
          <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 text-[10px]">
            ACTIVE
          </span>
        </div>

        {/* Logout action */}
        <div className="border-t border-border/40 pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="w-full gap-2 font-semibold"
          >
            <LogOut className="size-3.5" />
            Terminate Session & Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityCard;
