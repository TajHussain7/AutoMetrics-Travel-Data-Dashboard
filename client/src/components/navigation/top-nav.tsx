import { useState } from "react";
import {
  Home,
  Table,
  BarChart3,
  Download,
  Activity,
  Mail,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewUploadButton } from "../dashboard/new-upload-button";

type ScreenType = "dashboard" | "data-table" | "analytics" | "export";

interface TopNavProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

const navigation = [
  { id: "dashboard" as const, label: "Dashboard Overview", icon: Home },
  { id: "data-table" as const, label: "Data Management", icon: Table },
  { id: "analytics" as const, label: "Analytics Hub", icon: BarChart3 },
  { id: "export" as const, label: "Export Center", icon: Download },
];

export default function TopNav({ activeScreen, onScreenChange }: TopNavProps) {
  const [avatarError, setAvatarError] = useState(false);
  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-10"></div>
              <Activity className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoMetrics
              </h1>
              <p className="text-sm text-slate-500">
                Intelligent Travel Data Dashboard
              </p>
            </div>
          </div>

          {/* New Upload Button */}
          <div className="flex-shrink-0 mr-4">
            <NewUploadButton />
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onScreenChange(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="relative group">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-800 flex items-center gap-0.3">
                  Tajamal Hussain
                  <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </p>
                <p className="text-sm text-slate-500">Full Stack Developer</p>
              </div>
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-green-400 to-blue-500 ring-2 ring-white">
                {avatarError ? (
                  <div className="w-full h-full rounded-full bg-white/80 text-slate-700 flex items-center justify-center text-sm font-medium">
                    TH
                  </div>
                ) : (
                  <img
                    src="/profile.jpg"
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                )}
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">
                  Tajamal Hussain
                </p>
                <p className="text-xs text-slate-500">Full Stack Developer</p>
              </div>
              <div className="p-2">
                <a
                  href="mailto:tajamaltajamal702@gmail.com"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>tajamaltajamal702@gmail.com</span>
                </a>
                <a
                  href="https://wa.me/923438002540"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>+92 343 8002540</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
