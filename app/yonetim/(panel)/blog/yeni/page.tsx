import BlogEditor from "@/components/admin/BlogEditor";
import { getImages } from "@/lib/content-store";

export default async function NewBlogPostPage() {
  const images = await getImages();
  return <div className="mx-auto max-w-5xl"><BlogEditor images={images} /></div>;
}
