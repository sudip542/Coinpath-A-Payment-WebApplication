import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/shadcn/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shadcn/ui/sidebar";
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  ShieldCheckIcon,
  LogInIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

interface NavUserProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

/**
 * Generates uppercase avatar initials from a full name.
 * Example: "sudip bhuniya" -> "SB"
 * Example: "Sudip Kumar Bhuniya" -> "SB"
 * Example: "Sudip" -> "SU"
 */
export function getInitials(name?: string): string {
  if (!name || typeof name !== "string") return "U";

  const trimmed = name.trim();
  if (!trimmed) return "U";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = words[0].charAt(0);
  const lastInitial = words[words.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function NavUser({ user: propUser }: NavUserProps = {}) {
  const { isMobile } = useSidebar();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const currentUser =
    propUser || (isAuthenticated && authUser ? authUser : null);

  const displayName = currentUser?.name || "Guest User";
  const displayEmail =
    currentUser?.email || (isAuthenticated ? "" : "Not signed in");
  const initials = getInitials(currentUser?.name);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isAdminOrManager =
    currentUser?.role === "ADMIN" || currentUser?.role === "THEATRE_MANAGER";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-red-600/20 text-red-400 font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-white">
                {displayName}
              </span>
              <span className="truncate text-xs text-slate-400">
                {displayEmail}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg bg-slate-900 border-slate-800 text-slate-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-red-600/20 text-red-400 font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      {displayName}
                    </span>
                    <span className="truncate text-xs text-slate-400">
                      {displayEmail}
                    </span>
                    {currentUser?.role && (
                      <span className="mt-1 inline-flex w-fit items-center rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                        {currentUser.role}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuGroup>
              {isAdminOrManager && (
                <DropdownMenuItem
                  onClick={() => navigate("/admin")}
                  className="cursor-pointer focus:bg-slate-800 text-slate-200"
                >
                  <ShieldCheckIcon className="mr-2 size-4 text-red-400" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              {isAuthenticated ? (
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer focus:bg-slate-800 text-red-400 focus:text-red-300"
                >
                  <LogOutIcon className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => navigate("/")}
                  className="cursor-pointer focus:bg-slate-800 text-slate-200"
                >
                  <LogInIcon className="mr-2 size-4 text-red-400" />
                  Sign In
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
