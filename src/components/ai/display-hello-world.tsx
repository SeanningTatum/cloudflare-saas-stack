"use client";

import { api } from "@/trpc/client";


export function DisplayHelloWorld() {
  const { data, isLoading } = api.sample.hello.useQuery({ text: "world" });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>{data?.aiResponse}</p>
    </div>
  );
}