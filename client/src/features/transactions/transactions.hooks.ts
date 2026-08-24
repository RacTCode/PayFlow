import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTransaction,
  getTransactions,
  createTransaction,
  updateTransactionStatus,
  type TransactionFilters,
} from "./transactions.api";

export function useTransactions(
  filters: TransactionFilters,
) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTransaction(
  transactionId: string,
) {
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransaction(transactionId),
    enabled: Boolean(transactionId),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      status,
    }: {
      transactionId: string;
      status: "SUCCESSFUL" | "FAILED";
    }) =>
      updateTransactionStatus(
        transactionId,
        status,
      ),

    onSuccess: (transaction) => {
      queryClient.setQueryData(
        ["transaction", transaction.transactionId],
        transaction,
      );

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });
}