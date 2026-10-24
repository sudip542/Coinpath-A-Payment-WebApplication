import CustomRouterProvider from "./components/custom-router-provider";
import { ThemeProvider } from "./components/theme/theme-provider";
import { TooltipProvider } from "@/shadcn/ui/tooltip";
import { Toaster } from "./shadcn/ui/sonner"

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <CustomRouterProvider />
      </TooltipProvider>
      {/* Inside the provider: the toasts follow the app's light/dark theme. */}
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
