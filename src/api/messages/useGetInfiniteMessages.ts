import { useApi } from "../../providers/ApiProvider";
import { useCreateInfiniteQuery } from "../apiFactory";
import { EMessage, messageKey } from "./config";
import { Message, MessageParams } from "./types";

const DEAFULT_PAGE_LIMIT = 10;

export const useGetInfiniteMessages = (
  threadId: string,
  params: MessageParams,
) => {
  const { apiClient } = useApi();

  return useCreateInfiniteQuery<Message[], MessageParams>({
    queryKey: messageKey[EMessage.FETCH_ALL] + threadId,
    apiClient,
    url: `/threads/${threadId}/messages`,
    errorMessage: "Failed to fetch messages.",
    queryOptions: {
      enabled: !!threadId,
      // Treat the data as fresh forever, preventing automatic refetches
      // when switching back to a thread.
      staleTime: Infinity,
      // Keep the data in the cache forever for the duration of the session,
      // even if we navigate away from the thread.
      gcTime: Infinity,
    },
    queryParams: params,
    keysToRemoveFromQueryParams: ["order", "limit", "offset"],
    initialPageParam: 0, // Initial page number or cursor
    getNextPageParam: (lastPage, allPages) => {
      // If the last page is empty, there are no more messages
      if (lastPage.length < (params?.limit || DEAFULT_PAGE_LIMIT)) {
        return undefined;
      }

      // Calculate the next offset
      const nextOffset =
        Math.max(allPages.length, 1) * (params?.limit || DEAFULT_PAGE_LIMIT);

      // Return the next offset for the next page
      return nextOffset;
    },
  });
};
