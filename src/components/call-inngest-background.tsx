"use client";
import { Button } from "./ui/button";
import { api } from "@/trpc/client";


export function CallInngestBackgroundButton() {

  const { mutate: callBackgroundTask, isPending, error, data } = api.sample.callBackgroundTask.useMutation();
  return (
    <div>
      <Button onClick={() => {
        callBackgroundTask({ taskId: "123" });
      }}>
        Call Background Task (5s)
      </Button>
      {isPending && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>Data: {data.message}</div>}
    </div>
  );
}