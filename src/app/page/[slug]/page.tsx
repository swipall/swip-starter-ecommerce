import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';
import { getPostDetail } from '@/lib/swipall/rest-adapter';
import {
	SITE_NAME,
	truncateDescription,
	buildCanonicalUrl,
	buildOgImages,
} from '@/lib/metadata';

async function getPagePost(slug: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(`page-${slug}`);

	return getPostDetail(slug);
}

export async function generateMetadata({
	params,
}: PageProps<'/page/[slug]'>): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPagePost(slug);

	if (!post) {
		return {
			title: 'Page Not Found',
		};
	}

	const descriptionSource = post.body;
	const description = truncateDescription(descriptionSource);

	return {
		title: post.title || SITE_NAME,
		description,
		alternates: {
			canonical: buildCanonicalUrl(`/page/${post.slug}`),
		},
		openGraph: {
			title: post.title || SITE_NAME,
			description,
			type: 'website',
			url: buildCanonicalUrl(`/page/${post.slug}`),
			images: buildOgImages(post.featured_image, post.title),
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title || SITE_NAME,
			description,
		},
	};
}

export default async function CmsPage({ params }: PageProps<'/page/[slug]'>) {
	const { slug } = await params;
	const post = await getPagePost(slug);

	if (!post) {
		notFound();
	}

	const html = post.body;

	if (!html) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8 mt-[118px]">
			<article className="prose prose-neutral max-w-none">
				{post.title ? <h1>{post.title}</h1> : null}
				<div dangerouslySetInnerHTML={{ __html: html }} />
			</article>
		</div>
	);
}
