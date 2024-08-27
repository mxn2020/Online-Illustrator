import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function BlogSection({ lang }: Props, ) {
  
  const { t } = useDictionary()

  const blogPosts = [
    {
      title: t('blog.post_1.title'),
      excerpt: t('blog.post_1.excerpt'),
      image: "/placeholder.svg",
      slug: "essential-illustration-techniques"
    },
    {
      title: t('blog.post_2.title'),
      excerpt: t('blog.post_2.excerpt'),
      image: "/placeholder.svg",
      slug: "color-theory-digital-artists"
    },
    {
      title: t('blog.post_3.title'),
      excerpt: t('blog.post_3.excerpt'),
      image: "/placeholder.svg",
      slug: "sketch-to-final-artwork"
    }
  ]

  return (
    <section id="blog" className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('blog.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div 
              key={index} 
              className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/*<Image src={post.image} alt={post.title} width={400} height={200} className="w-full h-48 object-cover" />*/}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                <Link href={`/`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {t('blog.read_more')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/">{t('blog.view_all')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}