import { ComboboxOption } from "@headlessui/react";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "motion/react";
import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Focusable } from "react-aria-components";
import { HiOutlineServerStack, HiServerStack } from "react-icons/hi2";
import {
  IoArrowBack,
  IoArrowForward,
  IoCall,
  IoEye,
  IoEyeOff,
  IoImage,
  IoLockClosed,
  IoMail,
  IoPerson,
  IoPersonCircleOutline,
} from "react-icons/io5";
import {
  RiGraduationCapFill,
  RiGraduationCapLine,
  RiHome7Fill,
  RiHome7Line,
  RiPencilRulerFill,
  RiPencilRulerLine,
  RiRobot3Fill,
  RiRobot3Line,
} from "react-icons/ri";
import {
  VscClose,
  VscLayoutSidebarLeft,
  VscLayoutSidebarLeftOff,
  VscSearch,
} from "react-icons/vsc";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { EUser, userKey } from "../api/user/config";
import { User } from "../api/user/types";
import { useChangePassword } from "../api/user/useChangePassword";
import { useGenerateAvatar } from "../api/user/useGenerateAvatar";
import { useGetUser } from "../api/user/useGetUser";
import { ChangePasswordSchema } from "../api/user/UserSchema";
import { useUpdateUser } from "../api/user/useUpdateUser";
import icon from "../assets/icon.png";
import Avatar from "../components/Avatar";
import BlurWrapper from "../components/BlurWrapper";
import { Button, ButtonWithLoader } from "../components/Button";
import Combobox from "../components/Combobox";
import Dropdown from "../components/dropdown";
import ErrorMessage from "../components/Forms/ErrorMessage";
import Field from "../components/Forms/Field";
import Form from "../components/Forms/Form";
import Input from "../components/Forms/Input";
import InputGroup from "../components/Forms/InputGroup";
import Label from "../components/Forms/Label";
import Switch from "../components/Forms/Switch";
import Modal from "../components/modal";
import SlidingContainer from "../components/SlidingContainer";
import Spinner from "../components/Spinner";
import Tooltip from "../components/tooltip";
import { COMMAND_KEY } from "../components/tooltip/TooltipKeyboardShortcut";
import { useAppHistory } from "../hooks/useAppHistory";
import useFileUpload from "../hooks/useFileUpload";
import { useAuth, useAuthActions } from "../store/authStore";
import { useCombobox, useComboboxActions } from "../store/comboboxStore";
import { useAppConfig, useAppConfigActions } from "../store/configurationStore";
import { useSidebar, useSidebarActions } from "../store/sidebarStore";
import { cn } from "../utilities/cn";
import Login from "./Login";
import UserLoading from "./UserLoading";

enum ActiveTab {
  PROFILE = 1,
  SECURITY = 2,
  CHANGE_NAME = 3,
  CHANGE_PHONE = 4,
  CHANGE_PASSWORD = 5,
}

type Picture = {
  url: string;
};

const RootLayout = () => {
  const { pathname: path } = useLocation();
  const { config, showAnnouncement } = useAppConfig();
  const { setShowAnnouncement } = useAppConfigActions();
  const { user, accessToken } = useAuth();
  const { setAccessToken, refetchUser, logout, setMCP } = useAuthActions();

  useEffect(() => {
    // 1. Check for a token that might already be stored on disk.
    const initialToken = window.electronAPI.getToken();

    console.log({ initialToken });

    if (initialToken && !accessToken) {
      console.log("[RootLayout] Setting initial token from storage.");
      setAccessToken(initialToken);
    }

    // 2. If we have a token but no user data, fetch the user.
    // This handles both the initial load and cases where the user state might be cleared.
    if (accessToken && !user) {
      console.log("[RootLayout] Token found, fetching user...");
      refetchUser();
    }
  }, [accessToken, user, setAccessToken, refetchUser]);

  useEffect(() => {
    const handleTokenReceived = (token: string) => {
      setAccessToken(token);
      refetchUser();
    };

    const unsubscribe = window.electronAPI.onTokenReceived(handleTokenReceived);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [setAccessToken, refetchUser]);

  useEffect(() => {
    const handleTokenReceived = (token: string) => {
      setAccessToken(token);
      refetchUser();
    };

    const unsubscribe = window.electronAPI.onTokenReceived(handleTokenReceived);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [setAccessToken, refetchUser]);

  useEffect(() => {
    const handleTokensReceived = (
      tokens: Record<string, string | null> | null,
    ) => {
      if (!tokens) return;

      const expiresInValue = parseInt(tokens.expires_in || "", 10);

      setMCP({
        access_token: tokens.access_token || "",
        expires_in: !isNaN(expiresInValue) ? expiresInValue : "",
        refresh_token: tokens.refresh_token || "",
      });
    };

    const unsubscribe =
      window.electronAPI.onMCPTokensReceived(handleTokensReceived);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [setMCP]);

  const { canGoBack, canGoForward } = useAppHistory();
  const navigate = useNavigate();

  const { isSidebarExpanded } = useSidebar();
  const { setIsSidebarExpanded } = useSidebarActions();

  useEffect(() => {
    let cleanupToggleSidebarListener = () => {};

    if (window.electronAPI && window.electronAPI.onToggleSidebar) {
      cleanupToggleSidebarListener = window.electronAPI.onToggleSidebar(() => {
        setIsSidebarExpanded((prev) => !prev);
      });
    }

    return () => {
      cleanupToggleSidebarListener();
    };
  }, [setIsSidebarExpanded]);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { isLoading, isOpen, query } = useCombobox();
  const { setIsOpen, setQuery } = useComboboxActions();

  useEffect(() => {
    let cleanupToggleSearchBarListener = () => {};

    if (window.electronAPI && window.electronAPI.onToggleSearchBar) {
      cleanupToggleSearchBarListener = window.electronAPI.onToggleSearchBar(
        () => {
          setIsOpen((prev) => !prev);
        },
      );
    }

    return () => {
      cleanupToggleSearchBarListener();
    };
  }, [setIsOpen]);

  interface ComboboxResult {
    id: string;
    name: string;
    onClick?: () => void;
  }

  const defaultSearchOptions: ComboboxResult[] = useMemo(
    () => [
      {
        id: "1",
        name: "Sidebar: Toggle sidebar",
        onClick: () => {
          setIsSidebarExpanded((pv) => !pv);
        },
      },
      {
        id: "2",
        name: "Settings: Open user preferences",
        onClick: () => {
          setIsSettingsModalOpen((pv) => !pv);
        },
      },
    ],
    [setIsSidebarExpanded, setIsSettingsModalOpen],
  );

  const filteredSearchOptions = useMemo(() => {
    if (!query) return defaultSearchOptions;

    const filteredResults = defaultSearchOptions.filter((option) =>
      option.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (filteredResults.length <= 0) {
      return [
        {
          id: "default-no-results",
          name: `search: ${query}`,
        },
      ];
    }

    return filteredResults;
  }, [query, defaultSearchOptions]);

  const anouncement = useMemo(
    () => config?.global?.global_announcement || config?.version?.announcement,
    [config],
  );

  return (
    <main className="from-sidepanel-start to-sidepanel-end @container relative flex h-dvh w-full flex-col bg-linear-to-br/oklch font-sans">
      <div className="app-region-drag pointer-events-none absolute inset-x-0 z-20 h-10"></div>
      <nav className="absolute inset-x-0 top-0 z-10 flex h-10 flex-col items-center justify-center bg-transparent">
        {accessToken && user && (
          <div
            className={cn(
              "relative flex w-full flex-1 items-center justify-between px-1.5",
            )}
          >
            {/* center controls */}
            <div className="flex h-full w-full items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-1">
                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className={
                      "rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    }
                    disabled={!canGoBack}
                    onClick={() => navigate(-1)}
                  >
                    <IoArrowBack className="size-6" />
                  </Button>

                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Back in history"
                      shortcuts={[COMMAND_KEY, "["]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>

                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className={
                      "rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    }
                    disabled={!canGoForward}
                    onClick={() => navigate(+1)}
                  >
                    <IoArrowForward className="size-6" />
                  </Button>

                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Forward in history"
                      shortcuts={[COMMAND_KEY, "]"]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>
              </div>

              <div className="w-full max-w-lg">
                <Tooltip>
                  <Focusable>
                    <button
                      onClick={() => setIsOpen((prev) => !prev)}
                      className={
                        "app-region-no-drag flex w-full cursor-pointer items-center justify-start gap-2 rounded-md bg-white/15 px-2 py-1 text-sm font-light tracking-wide text-white/50"
                      }
                    >
                      <VscSearch className="size-4" />
                      <p>Spark Search...</p>
                    </button>
                  </Focusable>

                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Search Spark"
                      shortcuts={[COMMAND_KEY, "k"]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>
              </div>

              <div className="flex items-center justify-start gap-1">
                {/* sidebar toggle button */}
                <Tooltip>
                  <Button
                    variant={"unstyled"}
                    wrapperClass="app-region-no-drag flex items-center"
                    className={
                      "rounded-md bg-transparent p-1 text-white ring-white/10 hover:bg-white/10 disabled:text-white/15"
                    }
                    onClick={() => setIsSidebarExpanded((pv) => !pv)}
                  >
                    {isSidebarExpanded ? (
                      <VscLayoutSidebarLeft className="size-6" />
                    ) : (
                      <VscLayoutSidebarLeftOff className="size-6" />
                    )}
                  </Button>

                  <Tooltip.Content placement="bottom" offset={10}>
                    <Tooltip.Shorcut
                      title="Toggle sidebar"
                      shortcuts={[COMMAND_KEY, "b"]}
                    />
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip>
                {/* sidebar toggle button */}
              </div>
            </div>
            {/* center controls */}

            {/* far right controls */}
            {/* <div className=""></div> */}
            {/* far right controls */}
          </div>
        )}
      </nav>

      {!accessToken && !user && <Login />}

      {accessToken && !user && <UserLoading />}

      {/* Main content */}
      {accessToken && user && (
        <>
          <section className="mt-10 flex w-full flex-1 flex-col overflow-hidden">
            <AnimatePresence mode="popLayout">
              {anouncement && showAnnouncement && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full p-1.5 pt-0"
                >
                  <div className="bg-primary-600/20 dark:bg-primary-600/20 flex w-full items-center justify-between gap-10 rounded-xl p-3">
                    <div>
                      <h3 className="text-sm font-medium text-white">
                        {anouncement.title}
                      </h3>

                      <p className="text-xs text-white/60">
                        {anouncement.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      {anouncement && anouncement.cta && (
                        <Button
                          onClick={() => {
                            if (window.electronAPI && window.electronAPI.send) {
                              window.electronAPI.send(
                                "open-external-url",
                                anouncement.cta.link,
                              );
                            }
                          }}
                          variant={"ghost"}
                          className={
                            "text-primary rounded-lg bg-white p-3 py-1.5 hover:bg-white/90 data-[pressed]:bg-white/90 md:p-3 md:py-1.5 dark:bg-white dark:hover:bg-white/90 dark:data-[pressed]:bg-white/90"
                          }
                        >
                          {anouncement.cta.name}
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setShowAnnouncement(false);
                        }}
                        variant={"ghost"}
                        className={
                          "rounded-lg bg-transparent p-1.5 text-white hover:bg-white/5 data-[pressed]:bg-white/90 md:p-1.5 dark:bg-transparent dark:hover:bg-white/5 dark:data-[pressed]:bg-white/5"
                        }
                      >
                        <VscClose className="size-6" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-1.5 flex h-full w-full items-start justify-start overflow-hidden">
              {/* side panel */}
              <div className="mt-3 flex h-full w-20 flex-col items-center justify-between overflow-hidden pb-4">
                <div className="flex flex-1 flex-col items-center justify-start gap-3">
                  {/* logo */}
                  <div className="mb-2 aspect-square w-min rounded-xl bg-white/10 text-white">
                    <img
                      src={icon}
                      alt="Spark Logo"
                      className="size-12 object-cover"
                    />
                  </div>
                  {/* logo */}

                  {/* navigation links */}
                  <Link
                    to={"/home/chat"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/home") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        {path.includes("/home") ? (
                          <RiHome7Fill className="size-6" />
                        ) : (
                          <RiHome7Line className="size-6" />
                        )}
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Home
                    </span>
                  </Link>

                  <Link
                    to={"/worker-agents"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/worker-agents") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        {path.includes("/worker-agents") ? (
                          <RiRobot3Fill className="size-6" />
                        ) : (
                          <RiRobot3Line className="size-6" />
                        )}
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Agents
                    </span>
                  </Link>

                  <Link
                    to={"/mcp"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/mcp") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        {path.includes("/mcp") ? (
                          <HiServerStack className="size-6" />
                        ) : (
                          <HiOutlineServerStack className="size-6" />
                        )}
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      MCP
                    </span>
                  </Link>

                  <Link
                    to={"/blueprints"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/blueprints") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        {path.includes("/blueprints") ? (
                          <RiPencilRulerFill className="size-6" />
                        ) : (
                          <RiPencilRulerLine className="size-6" />
                        )}
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Blueprints
                    </span>
                  </Link>

                  <Link
                    to={"/academy"}
                    className={
                      "group flex flex-col items-center justify-center gap-1"
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2.5 text-white group-hover:bg-white/15",
                        { "bg-white/15": path.includes("/academy") },
                      )}
                    >
                      <div className="transition-all duration-300 group-hover:scale-110">
                        {path.includes("/academy") ? (
                          <RiGraduationCapFill className="size-6" />
                        ) : (
                          <RiGraduationCapLine className="size-6" />
                        )}
                      </div>
                    </div>
                    <span className="w-12 text-center text-[0.65rem] font-medium text-white">
                      Academy
                    </span>
                  </Link>
                  {/* navigation links */}
                </div>

                {/* user details */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <Dropdown
                    open={isUserMenuOpen}
                    onOpenChange={setIsUserMenuOpen}
                  >
                    <Tooltip delay={700}>
                      <Dropdown.Button asChild>
                        <Button
                          onClick={() => setIsUserMenuOpen((prev) => !prev)}
                          variant={"ghost"}
                          wrapperClass="flex items-center justify-center"
                          className="size-11 w-min cursor-pointer p-0 md:p-0"
                        >
                          <div className="aspect-square size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                            <Avatar
                              Fallback={() => (
                                <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs">
                                  {user?.first_name?.[0]} {user?.last_name?.[0]}
                                </Avatar.Fallback>
                              )}
                              className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-11 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                              src={
                                (user.is_avatar_enabled
                                  ? user.avatar_url
                                  : user?.original_profile_picture_url) || ""
                              }
                            />
                          </div>
                        </Button>
                      </Dropdown.Button>

                      <Tooltip.Content
                        className={"max-w-40"}
                        placement="right"
                        offset={10}
                      >
                        <h3 className="text-sm text-gray-800 dark:text-white">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Tooltip.Arrow className={"-mt-1.5"} />
                      </Tooltip.Content>
                    </Tooltip>

                    <Dropdown.Menu
                      side="right"
                      align="end"
                      className="dark:bg-primary-dark-foreground w-72 rounded-lg border border-gray-300 bg-white/90 p-1 shadow-xl backdrop-blur-lg dark:border-white/10"
                      sideOffset={-10}
                    >
                      <div className="flex w-full items-center justify-start gap-3 p-3">
                        <div className="aspect-square size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                          <Avatar
                            key={
                              (user.avatar_url || "") +
                              (user.original_profile_picture_url || "") +
                              user.id
                            }
                            Fallback={() => (
                              <Avatar.Fallback className="bg-secondary size-11 rounded-xl text-xs">
                                {user?.first_name?.[0]} {user?.last_name?.[0]}
                              </Avatar.Fallback>
                            )}
                            className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-11 w-full shrink-0 items-center justify-center rounded-none object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
                            src={
                              (user.is_avatar_enabled
                                ? user.avatar_url
                                : user?.original_profile_picture_url) || ""
                            }
                          />
                        </div>

                        <div className="select-none">
                          <h3 className="text-base font-medium text-gray-800 dark:text-white">
                            {user.first_name} {user?.last_name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-white/60">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Dropdown.Divider className="my-2 dark:border-white/10" />
                      <Dropdown.Item
                        onSelect={() => setIsSettingsModalOpen(true)}
                        className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                      >
                        Profile
                      </Dropdown.Item>

                      <Dropdown.Divider className="mt-2 mb-1 dark:border-white/10" />
                      <Dropdown.Item
                        className="flex items-center gap-2 rounded-[calc(var(--radius-lg)-(--spacing(1)))] py-1.5 dark:text-white/80 dark:data-[highlighted]:text-white"
                        onSelect={() => {
                          logout();
                        }}
                      >
                        Sign out of Spark
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {/* user details */}
              </div>
              {/* side panel */}

              {/* content panel */}
              <div className="mr-1.5 flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10">
                <Combobox<ComboboxResult>
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  placeholder="Spark Search"
                  query={query}
                  setQuery={setQuery}
                  isLoading={isLoading}
                  onSelect={(option) => {
                    console.log({ option });
                    option?.onClick?.();
                    setIsOpen(false);
                  }}
                  Option={({ optionValue }) => (
                    <ComboboxOption
                      key={optionValue.id}
                      className={
                        "dark:data-[focus]:bg-primary/30 data-[focus]:bg-primary -mx-3 cursor-pointer rounded-lg px-3 py-1.5 text-gray-800 data-[focus]:text-white dark:text-white"
                      }
                      value={optionValue}
                    >
                      <div className="flex flex-shrink-0 items-center justify-start gap-2">
                        <VscSearch className="size-4 flex-shrink-0" />
                        <span>{optionValue.name}</span>
                      </div>
                    </ComboboxOption>
                  )}
                  searchResults={filteredSearchOptions}
                />
                <Outlet />
              </div>
              {/* content panel */}
            </div>
          </section>

          <SettingsModal
            isOpen={isSettingsModalOpen}
            setIsOpen={setIsSettingsModalOpen}
          />
        </>
      )}
      {/* Main content */}
    </main>
  );
};

const SettingsModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setUser } = useAuthActions();
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.PROFILE);
  const [file, setFile] = useState<File[]>([]);
  const [picture, setPicture] = useState<Picture | null>();
  const { data: user, isPending: isUserLoading } = useGetUser();
  const { mutateAsync: generateAvatar, isPending: isGenerateAvatarLoading } =
    useGenerateAvatar({
      invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
    });

  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  const { getRootProps, getInputProps, open } = useFileUpload({
    files: file,
    setFiles: setFile,
    handleFileUpload: async (file) => {
      const url = URL.createObjectURL(file);
      setPicture({ url });
      setFile([]);

      const { avatar_url } = await generateAvatar({
        body: {
          uploaded_picture: file,
          regenerate_avatar: false,
        },
      });

      if (user?.is_avatar_enabled) {
        setPicture({ url: avatar_url || "" });
      }

      setUser((pv) =>
        pv
          ? {
              ...pv,
              avatar_url: avatar_url || "",
              original_profile_picture_url: url || "",
            }
          : null,
      );
    },
  });

  useEffect(() => {
    if (user && user?.avatar_url) {
      setPicture({
        url:
          (user.is_avatar_enabled
            ? user.avatar_url
            : user.original_profile_picture_url) || "",
      });
    }
  }, [user, setPicture]);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      desktopClassName="w-full h-dvh sm:max-w-screen-md"
      title="Settings"
      description={"User settings"}
      showClose
      Trigger={() => <></>}
    >
      <div className="scrollbar flex w-full flex-col items-start justify-start divide-gray-300 overflow-y-auto border-t border-gray-100 px-3 pt-5 md:h-full md:flex-row md:divide-x dark:divide-white/10 dark:border-white/10">
        {/* left section */}
        <div className="flex w-full flex-col pr-3 pl-3 md:w-[25%]">
          <div className="flex w-full flex-row gap-5 md:flex-col md:gap-2">
            <Button
              variant={"ghost"}
              onClick={() => setActiveTab(ActiveTab.PROFILE)}
              wrapperClass="w-full flex -mx-2"
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10",
                {
                  "dark:bg-secondary dark:data-[pressed]:bg-secondary dark:hover:bg-secondary dark:text-primary bg-gray-200":
                    activeTab === ActiveTab.PROFILE ||
                    activeTab === ActiveTab.CHANGE_NAME ||
                    activeTab === ActiveTab.CHANGE_PHONE,
                },
              )}
            >
              <IoPerson className="size-6" />
              <p className="text-sm font-medium">Profile</p>
            </Button>

            <Button
              variant={"ghost"}
              wrapperClass="w-full flex -mx-2"
              onClick={() => setActiveTab(ActiveTab.SECURITY)}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-lg p-2 text-gray-800 hover:bg-gray-200 data-[pressed]:bg-gray-200 md:p-2 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10",
                {
                  "dark:bg-secondary dark:data-[pressed]:bg-secondary dark:hover:bg-secondary dark:text-primary bg-gray-200":
                    activeTab === ActiveTab.SECURITY ||
                    activeTab === ActiveTab.CHANGE_PASSWORD,
                },
              )}
            >
              <IoLockClosed className="size-6" />
              <p className="text-sm font-medium">Security</p>
            </Button>
          </div>
        </div>
        {/* left section */}

        {/* right section */}
        {!isUserLoading && user && (
          <div
            {...getRootProps()}
            className="mt-5 flex h-full w-full flex-1 flex-col md:mt-0 md:w-[75%] md:flex-auto md:overflow-y-auto"
          >
            <SlidingContainer
              active={activeTab}
              className="p-1 md:pr-3 md:pl-5"
            >
              {activeTab === ActiveTab.PROFILE && (
                <div className="w-full flex-1">
                  <h3 className="text-base font-medium text-gray-800 dark:text-white">
                    Your profile picture
                  </h3>

                  <div className="mt-3 flex w-full flex-col justify-start gap-5 md:flex-row md:items-center">
                    <div className="relative aspect-square size-full overflow-hidden rounded-xl bg-gray-200 md:size-40 dark:bg-white/20">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {isGenerateAvatarLoading && (
                          <motion.div
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(10px)" }}
                            className="absolute inset-0 z-20 animate-pulse rounded-xl bg-white/70 backdrop-blur-xl"
                          ></motion.div>
                        )}
                      </AnimatePresence>

                      {picture && (
                        <BlurWrapper Key={picture.url}>
                          {picture.url ? (
                            <img
                              src={picture.url}
                              className="aspect-square w-full object-cover"
                              alt="user profile picture"
                            />
                          ) : (
                            <div className="flex aspect-square w-full items-center justify-center p-5">
                              <IoPersonCircleOutline className="size-20 text-gray-500" />
                            </div>
                          )}
                        </BlurWrapper>
                      )}
                    </div>

                    <AnimatePresence mode="popLayout" initial={false}>
                      {!isGenerateAvatarLoading && (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(10px)" }}
                        >
                          <input
                            className="sr-only"
                            type="file"
                            {...getInputProps()}
                          />

                          <Button
                            onClick={open}
                            wrapperClass="w-max flex items-center justify-center"
                            variant={"ghost"}
                            className={
                              "flex items-center justify-start gap-3 rounded-xl border p-3 hover:bg-gray-100 data-[pressed]:bg-gray-100 md:p-3 dark:border-white/10 dark:text-white dark:hover:bg-white/10 dark:data-[pressed]:bg-white/10"
                            }
                          >
                            <IoImage className="text-primary size-6 flex-shrink-0" />
                            {picture?.url ? "Update picture" : "Add picture"}
                          </Button>

                          <div className="mt-3">
                            <Form
                              validationSchema={z.object({
                                keepOriginal: z.boolean(),
                              })}
                            >
                              <Field>
                                <Switch
                                  isSelected={!user.is_avatar_enabled}
                                  value={!user.is_avatar_enabled ? "t" : ""}
                                  onChange={(val) => {
                                    if (val) {
                                      setPicture({
                                        url:
                                          user.original_profile_picture_url ||
                                          "",
                                      });
                                    } else {
                                      setPicture({
                                        url: user.avatar_url || "",
                                      });
                                    }
                                    updateUser({
                                      body: {
                                        ...user,
                                        is_avatar_enabled: !val,
                                      },
                                    });
                                  }}
                                >
                                  <p className="ml-3 text-sm font-medium text-gray-800 dark:text-white">
                                    Keep the original
                                  </p>
                                </Switch>
                              </Field>
                            </Form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout" initial={false}>
                      {isGenerateAvatarLoading && (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(10px)" }}
                        >
                          <div
                            className={
                              "group relative bg-white transition-shadow duration-500 ease-out [--bg-size:500%] dark:bg-transparent"
                            }
                          >
                            <span
                              className={
                                "animate-gradient from-accent via-primary-600 to-accent inline bg-gradient-to-r bg-[length:var(--bg-size)_100%] bg-clip-text text-base font-semibold text-transparent"
                              }
                            >
                              Generating a cool looking avatar for you.
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* name */}
                  <div className="mt-5">
                    <div className="flex w-full items-center justify-between gap-5">
                      <label
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        htmlFor="name"
                      >
                        Name
                      </label>

                      <Button
                        onClick={() => setActiveTab(ActiveTab.CHANGE_NAME)}
                        variant={"ghost"}
                        className={
                          "text-primary dark:text-secondary text-xs hover:underline"
                        }
                      >
                        Edit
                      </Button>
                    </div>

                    <p className="mt-1 text-sm text-gray-800 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-white/60">
                      Member
                    </p>
                  </div>
                  {/* name */}

                  {/* email */}
                  <div className="mt-5 border-t border-gray-300 pt-5 dark:border-white/10">
                    <label
                      className="text-sm font-medium text-gray-800 dark:text-white"
                      htmlFor="name"
                    >
                      Email
                    </label>

                    <div className="mt-1 flex items-center justify-start gap-2">
                      <IoMail className="text-primary dark:text-secondary size-6" />
                      <p className="text-sm text-gray-800 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {/* email */}

                  {/* phone number */}
                  <div className="mt-5 border-t border-gray-300 pt-5 dark:border-white/10">
                    <div className="flex w-full items-center justify-between gap-5">
                      <label
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        htmlFor="phone"
                      >
                        Phone
                      </label>

                      <Button
                        onClick={() => setActiveTab(ActiveTab.CHANGE_PHONE)}
                        variant={"ghost"}
                        wrapperClass="w-max"
                        className={
                          "text-primary dark:text-secondary text-xs hover:underline"
                        }
                      >
                        {user.phone_number ? "Edit" : "Add number"}
                      </Button>
                    </div>
                    {user.phone_number && (
                      <div className="mt-1 flex items-center justify-start gap-2">
                        <IoCall className="text-primary dark:text-secondary size-6" />

                        <p className="text-sm text-gray-800 dark:text-white">
                          +1 {user.phone_number}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* phone number */}
                </div>
              )}

              {activeTab === ActiveTab.SECURITY && (
                <div className="w-ful h-full min-h-full flex-1">
                  <div className="flex w-full items-start justify-between gap-5">
                    <div className="">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        Change Password
                      </p>
                      <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
                        Update your password for added security. Click here to
                        change it now. Didn't request this? Contact support.
                      </p>
                    </div>

                    <Button
                      onClick={() => setActiveTab(ActiveTab.CHANGE_PASSWORD)}
                      variant={"ghost"}
                      className={
                        "text-primary dark:text-secondary text-xs hover:underline"
                      }
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === ActiveTab.CHANGE_NAME && (
                <ChangeName user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === ActiveTab.CHANGE_PHONE && (
                <ChangeNumber user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === ActiveTab.CHANGE_PASSWORD && (
                <ChangePassword setActiveTab={setActiveTab} />
              )}
            </SlidingContainer>
          </div>
        )}

        {isUserLoading && (
          <div className="flex h-full w-full items-center justify-center md:w-[75%]">
            <Spinner className="size-4" />
          </div>
        )}
        {/* right section */}
      </div>
    </Modal>
  );
};

interface IChangeName extends ComponentProps<"div"> {
  user: User;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangeName = ({ user, setActiveTab }: IChangeName) => {
  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.PROFILE)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Name
          </p>
        </div>
      </div>

      <Form
        validationSchema={z.object({
          first_name: z
            .string({ required_error: "First name is required." })
            .trim()
            .min(1, "First name is required."),

          last_name: z
            .string({ required_error: "Last name is required." })
            .trim()
            .min(1, "Last name is required."),
        })}
        className="mt-5"
        onSubmit={(values) => {
          updateUser({
            body: { ...user, ...values },
          });

          setActiveTab(ActiveTab.PROFILE);
        }}
        defaultValues={{
          first_name: user.first_name,
          last_name: user.last_name,
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <>
            <Field>
              <Label>First name</Label>
              <Input
                placeholder={"Enter first name"}
                className="w-full"
                data-invalid={errors.first_name}
                {...register("first_name")}
              />
              <ErrorMessage>{errors.first_name?.message}</ErrorMessage>
            </Field>

            <Field>
              <Label>Last name</Label>
              <Input
                placeholder={"Enter last name"}
                className="w-full"
                data-invalid={errors.last_name}
                {...register("last_name")}
              />
              <ErrorMessage>{errors.last_name?.message}</ErrorMessage>
            </Field>

            <div className="mt-5 flex w-full justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

interface IChangeNumber extends ComponentProps<"div"> {
  user: User;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangeNumber = ({ user, setActiveTab }: IChangeNumber) => {
  const { mutate: updateUser } = useUpdateUser({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.PROFILE)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Number
          </p>
        </div>
      </div>

      <Form
        validationSchema={z
          .object({
            phone_number: z
              .string({ required_error: "Phone number is required." })
              .min(1, "Phone number is required.")
              .nullable(),
          })
          .superRefine((data, ctx) => {
            const phoneNumber = data.phone_number;

            if (phoneNumber) {
              // Check if phone number contains spaces
              if (/\s/.test(phoneNumber)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number must not contain spaces.",
                  path: ["phone_number"],
                });
              }

              // Check if phone number starts with '+1'
              if (phoneNumber.startsWith("+1")) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number should not start with '+1'.",
                  path: ["phone_number"],
                });
              }

              // Check if the phone number has exactly 10 digits
              if (phoneNumber.length !== 10) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Phone number must be exactly 10 digits.",
                  path: ["phone_number"],
                });
              }

              // Check if the phone number follows the valid US format
              if (!/^[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/.test(phoneNumber)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message:
                    "Invalid US phone number format (Area code and exchange code can't start with 1).",
                  path: ["phone_number"],
                });
              }
            }
          })}
        className="mt-5"
        onSubmit={(values) => {
          updateUser({
            body: { ...user, ...values },
          });

          setActiveTab(ActiveTab.PROFILE);
        }}
        defaultValues={{
          phone_number: user.phone_number,
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <>
            <Field>
              <Label>Contact number</Label>
              <Input
                placeholder={"Enter first name"}
                className="w-full"
                data-invalid={errors.phone_number}
                {...register("phone_number")}
              />
              <ErrorMessage>{errors.phone_number?.message}</ErrorMessage>
            </Field>

            <div className="mt-5 flex w-full justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

interface IChangePassword extends ComponentProps<"div"> {
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}
const ChangePassword = ({ setActiveTab }: IChangePassword) => {
  const { mutateAsync: changePassword } = useChangePassword({
    invalidateQueryKey: [userKey[EUser.FETCH_SINGLE]],
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-ful h-full min-h-full flex-1">
      <div className="w-full items-start justify-start gap-3">
        <Button
          variant={"ghost"}
          onClick={() => setActiveTab(ActiveTab.SECURITY)}
          className={
            "text-primary dark:text-secondary flex items-center justify-center gap-2 rounded-full text-xs hover:underline"
          }
        >
          <IoArrowBack className="size-4 flex-shrink-0" />
          <p>Back</p>
        </Button>

        <div className="mt-3">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            Change Password
          </p>
          <p className="max-w-sm text-xs text-gray-500 dark:text-white/60">
            Update your password for added security. Click here to change it
            now. Didn't request this? Contact support.
          </p>
        </div>
      </div>

      <Form
        validationSchema={ChangePasswordSchema}
        className="mt-5"
        onSubmit={async (values, methods) => {
          try {
            await changePassword({
              body: values,
            });
            setActiveTab(ActiveTab.SECURITY);
          } catch (error) {
            const err = error as AxiosError;

            if (err.response?.status === 400) {
              methods.setError("current_password", {
                message: "Invalid current password",
              });
            }
          }
        }}
      >
        {({ register, formState: { errors, isSubmitting } }) => (
          <div className="flex flex-col space-y-2">
            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  className="w-full"
                  data-invalid={errors.current_password?.message}
                  {...register("current_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.current_password?.message}</ErrorMessage>
            </Field>

            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full"
                  data-invalid={errors.new_password?.message}
                  {...register("new_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.new_password?.message}</ErrorMessage>
            </Field>

            <Field>
              <InputGroup>
                <IoLockClosed data-slot="icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="w-full"
                  data-invalid={errors.confirm_password?.message}
                  {...register("confirm_password")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
                  <Button
                    variant="ghost"
                    className="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-var(--spacing)*0.5)] p-3 text-gray-600 group-data-[disabled=true]:text-gray-400 hover:text-gray-700 data-[focus-visible]:border data-[focus-visible]:border-gray-200 data-[focus-visible]:bg-gray-100 data-[focus-visible]:ring-0 data-[focus-visible]:ring-offset-0 dark:text-white/60 dark:hover:text-white data-[focus-visible]:dark:border-white/20 data-[focus-visible]:dark:bg-white/10"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IoEye className="h-5 w-5 shrink-0" />
                    ) : (
                      <IoEyeOff className="h-5 w-5 shrink-0" />
                    )}
                  </Button>
                </div>
              </InputGroup>
              <ErrorMessage>{errors.confirm_password?.message}</ErrorMessage>
            </Field>

            <div className="flex w-full justify-end">
              <ButtonWithLoader
                isLoading={isSubmitting}
                type="submit"
                wrapperClass="w-full md:w-auto"
                className="flex w-full items-center justify-center rounded-md py-1 [--border-highlight-radius:var(--radius-md)] md:w-auto"
              >
                Save
              </ButtonWithLoader>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};

export default RootLayout;
