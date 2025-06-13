

export default async function Page({ params }) {
    const { user } = await params
    return <div>My Post: {user}</div>
  }