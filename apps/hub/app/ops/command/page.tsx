import { headers } from "next/headers"
import { CommandClient } from "./client"

export const dynamic = "force-dynamic"
export const metadata = { title: "Ops Command — BizLegal AI", robots: { index: false } }

export default async function Page({ searchParams }: { searchParams: { t?: string } }) {
  // Token guard at server level
  return <CommandClient token={searchParams.t} />
}
