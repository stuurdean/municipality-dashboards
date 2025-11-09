"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaChartBar,
  FaChartLine,
  FaMap,
  FaFileAlt,
  FaUsers,
  FaUser,
  FaCog,
} from "react-icons/fa";
import Image from "next/image";
const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: <FaChartBar className="h-4 w-4" />,
    allowed: ["ADMIN", "EMPLOYEE"],
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: <FaFileAlt className="h-4 w-4" />,
    allowed: ["ADMIN"],
  },
  {
    name: "Assignments",
    href: "/dashboard/assignments",
    icon: <FaUsers className="h-4 w-4" />,
    allowed: ["ADMIN", "EMPLOYEE"],
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: <FaUser className="h-4 w-4" />,
    allowed: ["ADMIN"], // Only ADMIN can see Users
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: <FaChartLine className="h-4 w-4" />,
    allowed: ["ADMIN", "EMPLOYEE"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <FaCog className="h-4 w-4" />,
    allowed: ["ADMIN"], // Only ADMIN can see Settings
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(
    (item) => user?.userType && item.allowed.includes(user.userType)
  );

  return (
    <div className="w-64 bg-white text-gray-700">
      <div className="flex flex-col h-full">
              <Image
            className="dark:invert"
            src="/logo.png"
            alt="Municipality logo"
            width={100}
            height={70}
          />
        <div className="flex items-center justify-center h-16 shrink-0 px-4 ">
    
          <br />
          <span className="text-xl font-bold">Municipality</span>
          {user && (
            <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded capitalize">
              {user.userType.toLowerCase()}
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-municipal-primary text-white"
                    : "text-gray-600 hover:bg-municipal-primary hover:text-white"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.fullName?.[0] || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs text-gray-300 capitalize">
                  {user.userType.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
