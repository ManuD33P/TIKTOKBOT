import Component from "@/components/tiktok-bot-interface"

export default async function Page({ params }) {
    const { user } = await params
    

    return <Component user={user} />
  }