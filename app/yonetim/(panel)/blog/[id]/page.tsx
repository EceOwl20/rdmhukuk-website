import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";
import { getImages, getSiteContent } from "@/lib/content-store";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [content, images] = await Promise.all([getSiteContent(), getImages()]);
  const post = content.blog.posts.find((item) => item.id === id);
  if (!post) notFound();
  return <div className="mx-auto max-w-5xl"><BlogEditor post={post} images={images} /></div>;
}
