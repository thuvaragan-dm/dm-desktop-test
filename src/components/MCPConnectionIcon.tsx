import { ComponentProps } from "react";
import { cn } from "../utilities/cn";
import { VscCircleFilled } from "react-icons/vsc";

export type AvailableMCPProviders =
  | "GitHubMCP"
  | "JiraMCP"
  | "SlackMCP"
  | "GoogleCalendarMCP";

interface IMCPConnectionIcon extends ComponentProps<"svg"> {
  icon: AvailableMCPProviders;
}
const MCPConnectionIcon = ({ icon, className }: IMCPConnectionIcon) => {
  if (icon.includes("GitHubMCP")) {
    return (
      <svg
        className={cn("size-8", className)}
        viewBox="0 0 98 96"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0112.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
          fill="#24292f"
        />
      </svg>
    );
  }

  if (icon.includes("JiraMCP")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn("size-8 text-[#2584FE]", className)}
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 00-.84-.84zM6.77 6.8a4.36 4.36 0 004.34 4.34h1.8v1.72a4.36 4.36 0 004.34 4.34V7.63a.84.84 0 00-.83-.83zM2 11.6c0 2.4 1.95 4.34 4.35 4.34h1.78v1.72c.01 2.39 1.95 4.34 4.34 4.34v-9.57a.84.84 0 00-.84-.84z"
        />
      </svg>
    );
  }

  if (icon.includes("SlackMCP")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn("size-8", className)}
        viewBox="0 0 128 128"
      >
        <path
          fill="#de1c59"
          d="M27.255 80.719c0 7.33-5.978 13.317-13.309 13.317S.63 88.049.63 80.719s5.987-13.317 13.317-13.317h13.309zm6.709 0c0-7.33 5.987-13.317 13.317-13.317s13.317 5.986 13.317 13.317v33.335c0 7.33-5.986 13.317-13.317 13.317-7.33 0-13.317-5.987-13.317-13.317zm0 0"
        />
        <path
          fill="#35c5f0"
          d="M47.281 27.255c-7.33 0-13.317-5.978-13.317-13.309S39.951.63 47.281.63s13.317 5.987 13.317 13.317v13.309zm0 6.709c7.33 0 13.317 5.987 13.317 13.317s-5.986 13.317-13.317 13.317H13.946C6.616 60.598.63 54.612.63 47.281c0-7.33 5.987-13.317 13.317-13.317zm0 0"
        />
        <path
          fill="#2eb57d"
          d="M100.745 47.281c0-7.33 5.978-13.317 13.309-13.317s13.317 5.987 13.317 13.317-5.987 13.317-13.317 13.317h-13.309zm-6.709 0c0 7.33-5.987 13.317-13.317 13.317s-13.317-5.986-13.317-13.317V13.946C67.402 6.616 73.388.63 80.719.63c7.33 0 13.317 5.987 13.317 13.317zm0 0"
        />
        <path
          fill="#ebb02e"
          d="M80.719 100.745c7.33 0 13.317 5.978 13.317 13.309s-5.987 13.317-13.317 13.317-13.317-5.987-13.317-13.317v-13.309zm0-6.709c-7.33 0-13.317-5.987-13.317-13.317s5.986-13.317 13.317-13.317h33.335c7.33 0 13.317 5.986 13.317 13.317 0 7.33-5.987 13.317-13.317 13.317zm0 0"
        />
      </svg>
    );
  }

  if (icon.includes("GoogleCalendarMCP")) {
    return (
      <svg
        className={cn("size-8", className)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
      >
        <path fill="#fff" d="M195.368 60.632H60.632v134.736h134.736z" />
        <path
          fill="#ea4335"
          d="M195.368 256L256 195.368l-30.316-5.172-30.316 5.172-5.533 27.73z"
        />
        <path
          fill="#188038"
          d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316-6.225-30.316-33.033-5.172z"
        />
        <path
          fill="#1967d2"
          d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196 0 10.641 5.533 27.436 20.115 5.76 30.316 5.76T256 60.631"
        />
        <path fill="#fbbc04" d="M256 60.632h-60.632v134.736H256z" />
        <path fill="#34a853" d="M195.368 195.368H60.632V256h134.736z" />
        <path
          fill="#4285f4"
          d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"
        />
        <path
          fill="#4285f4"
          d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816q1.59 6.063 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318q5.734 0 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875q0-5.508-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063q5.608 0 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303 0-3.132-1.145-5.625-3.435-7.494-2.29-1.87-5.188-2.813-8.708-2.813-3.436 0-6.164.91-8.185 2.745a16.1 16.1 0 00-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503s9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745 3.772 1.836 6.736 4.379 8.875 7.613 2.14 3.25 3.2 6.888 3.2 10.93 0 4.126-.993 7.613-2.98 10.476s-4.43 5.052-7.327 6.585v.69a22.25 22.25 0 019.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79 0 4.58-1.163 8.673-3.487 12.26-2.324 3.588-5.54 6.417-9.617 8.472-4.092 2.055-8.69 3.1-13.793 3.1-5.912.016-11.369-1.685-16.405-5.087m71.797-58.005l-12.833 9.28-6.417-9.734 23.023-16.607h8.825v78.333h-12.598z"
        />
      </svg>
    );
  }

  return <VscCircleFilled className="size-8" />;
};

export default MCPConnectionIcon;
