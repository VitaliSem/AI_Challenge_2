import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarHeart, LogOut, Ticket, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-full text-sm font-semibold transition ${
      isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground">
              <CalendarHeart className="h-5 w-5" />
            </span>
            <span>Gather</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navClass}>Explore</NavLink>
            {user && <NavLink to="/tickets" className={navClass}>My Tickets</NavLink>}
            {user && <NavLink to="/my-events" className={navClass}>My Events</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <span className="hidden sm:inline text-sm">{user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/tickets")}>
                    <Ticket className="h-4 w-4 mr-2" /> My Tickets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-events")}>
                    <CalendarHeart className="h-4 w-4 mr-2" /> My Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/host/new")}>
                    Become a Host
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
                <Button size="sm" onClick={() => navigate("/auth?mode=signup")}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Made with care · Gather brings people together
      </footer>
    </div>
  );
}