
interface PostProps {
  title: string;
  image: string;
  description: string;
}

export function Posts({ title, image, description }: PostProps){
  return (
       <div className="border rounded-lg w-full max-w-100 dark:border-foreground">
            <img src={image} alt={title} className="w-full h-50 object-cover rounded-t-md" />
            <div className="p-4 relative">
              <h3 className="absolute font-bold text-white bg-blue-950 dark:bg-blue-700 w-auto max-w-max px-3 py-2 rounded-md top-[-22]">{title}</h3>
              <p className="pt-10 pb-10 font-semibold">{description}</p> 
              <div className="flex flex-row justify-end">
                <button className="mt-4 px-4 py-2 rounded-lg border border-foreground bg-background-500 text-foreground">Read More</button>
                 </div>
            </div>
            </div>
  )
}

const PostsSection = () => {
  return (
    <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 gap-2 flex-row items-center justify-center">
              <Posts title="March Champfest" image="/images/devotion1.jpeg" description="Join us on March 28."/>
              <Posts title="Soaking" image="/images/devotion2.jpeg" description="Join us for our Soaking event on April 15."/>
              <Posts title="Sunday Celebration" image="/images/devotion3.jpeg" description="See you on Sunday."/>
                </div>
            </div>
  )
}

export default PostsSection