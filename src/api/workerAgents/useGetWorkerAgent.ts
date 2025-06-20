import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EWorkerAgent, workerAgentKey } from "./config";

export const useGetWorkerAgent = (id: string) => {
  const { apiClient } = useApi();

  return useCreateQuery<Document>({
    queryKey: workerAgentKey[EWorkerAgent.FETCH_SINGLE] + id,
    apiClient,
    url: `/worker-agent/${id}`,
    queryOptions: {
      enabled: !!id,
    },
  });
};
