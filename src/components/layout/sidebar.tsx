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
  FaTimes,
  FaBars,
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(
    (item) => user?.userType && item.allowed.includes(user.userType)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen,
        }
      )}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-1 w-full">
              <Image
                className="mx-auto my-0 bg-white"
                src="/plk.jpg"
                alt="Municipality logo"
                width={100}
                height={50}
              />
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* User Role Badge */}
          <div className="px-4 py-2">
            {user && (
              <div className="text-center font-bold">Municipality -&nbsp;
                <span className="text-xs bg-municipal-secondary px-2 py-1 rounded capitalize">
                  {user.userType.toLowerCase()}
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when a link is clicked
                    if (window.innerWidth < 1024) {
                      onClose?.();
                    }
                  }}
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
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.fullName?.[0] || user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName || user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.userType.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};